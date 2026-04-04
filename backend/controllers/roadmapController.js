const asyncHandler = require('express-async-handler');
const RAGService = require('../services/RAGService');
const AIOrchestrator = require('../services/aiOrchestrator');
const Node = require('../models/Node');
const Cluster = require('../models/Cluster');
const KnowledgeIndex = require('../models/KnowledgeIndex');
const VectorStore = require('../models/VectorStore');
const { parseQueryKeywords } = require('../utils/keywordExtractor');
const mongoose = require('mongoose');

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

/**
 * @desc    Generate a multi-stage learning roadmap from RAG data
 * @route   POST /api/roadmap/generate
 * @access  Private
 */
const generateRoadmapFromRag = asyncHandler(async (req, res) => {
    const { topic, difficulty = 'Medium', stagesCount = 3 } = req.body;
    const userId = req.user._id;
    const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

    if (!topic) {
        res.status(400);
        throw new Error('Topic is required for roadmap generation');
    }

    if (!apiKey) {
        res.status(401);
        throw new Error('Gemini API Key is missing. Please provide it in settings.');
    }

    const orchestrator = new AIOrchestrator(apiKey);

    // 1. DUAL-PHASE RETRIEVAL (KV -> VECTOR)
    console.log(`[RoadmapForge] Phase 1: Identifying key concepts for "${topic}"...`);
    
    // Step A: Extract Keywords from topic
    const keywords = parseQueryKeywords(topic);
    console.log(`[RoadmapForge] Extracted keywords:`, keywords);

    // Step B: Query KV Store (KnowledgeIndex)
    const kvEntries = await KnowledgeIndex.find({
        userId: userId,
        keyword: { $in: keywords.map(k => new RegExp(k, 'i')) }
    }).limit(10).lean();

    const sourceIds = kvEntries.map(e => e.sourceId).filter(id => id);
    console.log(`[RoadmapForge] Found ${kvEntries.length} KV matches. Source IDs:`, sourceIds);

    // Step C: Fetch full context from VectorStore (Deep Context)
    let contextDocs = [];
    if (sourceIds.length > 0) {
        contextDocs = await VectorStore.find({ _id: { $in: sourceIds } }).lean();
    }

    // Step D: Fallback to standard Vector Search if KV results are low
    if (contextDocs.length < 3) {
        console.log(`[RoadmapForge] KV results insufficient. Performing dense vector search...`);
        const vectorResults = await RAGService.retrieve(topic, userId.toString(), { limit: 5 });
        vectorResults.forEach(r => contextDocs.push({ textChunk: r.textChunk, metadata: r.metadata }));
    }

    const contextString = RAGService.formatContext(contextDocs.map(d => ({ 
        textChunk: d.textChunk, 
        metadata: d.metadata 
    })));

    if (!contextString) {
        console.warn(`[RoadmapForge] No Ground Truth context found for "${topic}". Using AI general knowledge.`);
    }

    // 2. GENERATE CURRICULUM STRATEGY
    const strategyPrompt = `
        You are a Senior Learning Architect. Based on the provided context (from the user's personal knowledge base) and your own knowledge, create a logical ${stagesCount}-stage learning roadmap for the topic: "${topic}".
        
        Difficulty LEVEL: ${difficulty}
        
        OUTPUT FORMAT (STRICT JSON):
        {
          "roadmapTitle": "A catchy title for the curriculum",
          "description": "A brief overview of the learning journey",
          "stages": [
            {
              "id": "stage_1",
              "title": "Clear concise stage name",
              "summary": "What the user will learn in this stage",
              "concepts": ["Concept 1", "Concept 2", "Key Term"]
            }
          ]
        }
        
        CONTEXT:
        ${contextString}
    `;

    console.log(`[RoadmapForge] Planning curriculum strategy for stages: ${stagesCount}...`);
    const strategyRaw = await orchestrator.run("You are a Curriculum JSON Generator.", strategyPrompt, [], userId.toString());
    console.log(`[RoadmapForge] Strategy planned. Parsing response...`);
    
    let strategy;
    try {
        // Robust JSON filtering (handles markdown and text wrapping)
        const findJson = (str) => {
            const firstOpen = str.indexOf('{');
            const lastClose = str.lastIndexOf('}');
            if (firstOpen === -1 || lastClose === -1) return null;
            return str.substring(firstOpen, lastClose + 1);
        };

        const jsonStr = findJson(strategyRaw);
        if (!jsonStr) throw new Error("No JSON found in AI strategy response.");
        
        strategy = JSON.parse(jsonStr);
        if (!strategy.stages || !Array.isArray(strategy.stages)) {
            throw new Error("Invalid curriculum structure: 'stages' is missing or not an array.");
        }
    } catch (e) {
        console.error("Failed to parse roadmap strategy JSON:", e, "\nRAW OUTPUT:", strategyRaw);
        res.status(500);
        throw new Error(`Kế hoạch bị lỗi: ${e.message}`);
    }

    // 3. GENERATE FLASHCARDS PER STAGE & CREATE NODES
    console.log(`[RoadmapForge] Generating content for ${strategy.stages.length} stages...`);
    
    const createdNodes = [];
    let previousNodeId = null;
    const batchId = `roadmap-${Date.now()}`; // Unique ID for this generation batch

    // We process sequentially to ensure linking
    for (let i = 0; i < strategy.stages.length; i++) {
        const stage = strategy.stages[i];

        // THROTTLE: Wait 2 seconds between AI calls to avoid 429 rate limits
        if (i > 0) {
            console.log(`[RoadmapForge] Throttling... waiting for Gemini API...`);
            await sleep(2000);
        }

        const flashcardPrompt = `
            Create 6 high-quality Anki-style flashcards for the following learning stage.
            Each flashcard MUST be a 'Question/Term' on the Front and a 'Detailed Answer' on the Back.
            
            STAGE: ${stage.title}
            SUMMARY: ${stage.summary}
            KEY CONCEPTS: ${stage.concepts.join(', ')}
            
            OUTPUT FORMAT (STRICT JSON):
            {
              "flashcards": [
                { "front": "The concept name or question", "back": "Clear definition or explanation" }
              ]
            }
            
            CONTEXT GROUND TRUTH (FROM USER NOTES):
            ${contextString}
        `;

        const flashcardsRaw = await orchestrator.run("You are a Flashcard Generator.", flashcardPrompt, [], userId.toString());
        let stageData = { flashcards: [] };
        try {
            const findJson = (str) => {
                const match = str.match(/\{[\s\S]*\}/);
                return match ? match[0] : null;
            };
            const jsonStr = findJson(flashcardsRaw);
            if (jsonStr) {
                stageData = JSON.parse(jsonStr);
            }
        } catch (e) {
            console.warn(`[RoadmapForge] Failed to generate flashcards for stage ${i + 1}. Proceeding with empty deck.`);
        }

        // Calculate Position on Graph (Sequential Chain Layout)
        const startX = (Math.random() - 0.5) * 100;
        const startY = (Math.random() - 0.5) * 100;
        const xOffset = i * 250; // Move right for each stage
        const yOffset = Math.sin(i) * 100; // Curvy path

        // Create the Node
        const newNode = new Node({
            user: userId,
            title: `${i + 1}. ${stage.title}`,
            type: 'Flashcard',
            status: 'new',
            tags: ['Roadmap', strategy.roadmapTitle, batchId, ...stage.concepts],
            createdID: batchId, // New field for batch grouping
            x: startX + xOffset,
            y: startY + yOffset,
            data: {
                summary: stage.summary,
                flashcards: stageData.flashcards,
                roadmapId: strategy.roadmapTitle,
                stageId: stage.id,
                isRoadmapNode: true
            },
            connectedNodeIds: [] // Will link in the next step
        });

        const savedNode = await newNode.save();
        
        // Link to previous node using both legacy and NEW structured connections
        if (previousNodeId) {
            // Update previous node to point to this new node with an ARROW
            await Node.findByIdAndUpdate(previousNodeId, { 
                $addToSet: { 
                    connectedNodeIds: savedNode._id.toString(),
                    connections: { 
                        targetId: savedNode._id.toString(),
                        label: "Tiếp theo",
                        style: "solid",
                        hasArrow: true,
                        color: "#22d3ee"
                    }
                } 
            });
            
            // Backward link (legacy)
            savedNode.connectedNodeIds.push(previousNodeId.toString());
            await savedNode.save();
        }

        createdNodes.push(savedNode);
        previousNodeId = savedNode._id;
    }
    
    // 4. AUTO-CLUSTER ROADMAP NODES (Vùng tri thức)
    let finalCluster = null;
    try {
        const clusteringService = require('../services/clusteringService');
        finalCluster = await clusteringService.createBatchCluster(userId, batchId, strategy.roadmapTitle);
        console.log(`[RoadmapForge] Cluster established: ${strategy.roadmapTitle} with ID: ${batchId}`);
    } catch (e) {
        console.warn(`[RoadmapForge] Failed to create roadmap cluster:`, e);
    }

    res.status(201).json({
        message: 'Roadmap generated successfully',
        roadmapTitle: strategy.roadmapTitle,
        nodes: createdNodes,
        cluster: finalCluster // Returning the cluster for immediate frontend update
    });
});

module.exports = {
    generateRoadmapFromRag
};
