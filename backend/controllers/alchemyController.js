const asyncHandler = require('express-async-handler');
const AlchemyLogItem = require('../models/AlchemyLogItem');
const TutorPersona = require('../models/TutorPersona');
const AlchemyTemplate = require('../models/AlchemyTemplate');
const AlchemyPersona = require('../models/AlchemyPersona');
const AlchemyStorageItem = require('../models/AlchemyStorageItem');
const AlchemyStorageFlashcard = require('../models/AlchemyStorageFlashcard');
const FlashcardDeck = require('../models/FlashcardDeck');
const Node = require('../models/Node');
const AIOrchestrator = require('../services/aiOrchestrator');


// --- AlchemyStorageItem ---
const getAlchemyStorageItems = asyncHandler(async (req, res) => {
  const items = await AlchemyStorageItem.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(items);
});

const createAlchemyStorageItem = asyncHandler(async (req, res) => {
  const item = new AlchemyStorageItem({ ...req.body, user: req.user._id });
  const createdItem = await item.save();
  
  // Trigger background embedding
  const textContent = `${createdItem.title || ''}\n\n${createdItem.extractedText || ''}`.trim();
  if (textContent) {
    try {
      const BackgroundWorker = require('../services/backgroundWorker');
      const worker = new BackgroundWorker();
      await worker.embedAndStoreDocument(textContent, req.user._id, 'alchemy', createdItem._id, createdItem.title);
      console.log(`[VectorService] ✅ Successfully embedded and stored alchemy item ${createdItem._id}`);
    } catch (e) {
      console.error(`[VectorService] ❌ Error embedding alchemy item ${createdItem._id}:`, e.message);
      console.error(e.stack);
    }
  } else {
    console.warn(`[VectorService] ⚠️ Warning: Alchemy item ${createdItem._id} has no text content to embed.`);
  }

  // Broadcast the new item
  if (req.io) {
    req.io.emit('data-updated', { type: 'file_created', item: createdItem });
  }

  res.status(201).json(createdItem);
});

const updateAlchemyStorageItem = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid ID format');
  }

  let item = await AlchemyStorageItem.findOne({ _id: req.params.id, user: req.user._id });
  if (item) {
    Object.assign(item, req.body);
    const updatedItem = await item.save();
    
    // Trigger background embedding
    const textContent = `${updatedItem.title || ''}\n\n${updatedItem.extractedText || ''}`.trim();
    if (textContent) {
      try {
        const BackgroundWorker = require('../services/backgroundWorker');
        const worker = new BackgroundWorker();
        await worker.embedAndStoreDocument(textContent, req.user._id, 'alchemy', updatedItem._id, updatedItem.title);
        console.log(`[VectorService] ✅ Successfully embedded and stored alchemy item ${updatedItem._id}`);
      } catch (e) {
        console.error(`[VectorService] ❌ Error embedding alchemy item ${updatedItem._id}:`, e.message);
        console.error(e.stack);
      }
    } else {
      console.warn(`[VectorService] ⚠️ Warning: Alchemy item ${updatedItem._id} has no text content to embed.`);
    }

    if (req.io) {
      req.io.emit('data-updated', { type: 'file_updated', item: updatedItem });
    }
    return res.json(updatedItem);
  }

  // Check SavedRecording
  const SavedRecording = require('../models/SavedRecording');
  let recording = await SavedRecording.findOne({ _id: req.params.id, user: req.user._id });
  if (recording) {
    if (req.body.title) recording.title = req.body.title;
    if (req.body.extractedText) recording.transcript = req.body.extractedText;
    const updatedRecording = await recording.save();
    const formattedRecording = {
      id: updatedRecording._id,
      sourceType: 'voice',
      title: updatedRecording.title,
      originalContent: updatedRecording.audioData,
      extractedText: updatedRecording.transcript,
      createdAt: updatedRecording.createdAt,
      updatedAt: updatedRecording.updatedAt
    };
    if (req.io) {
      req.io.emit('data-updated', { type: 'file_updated', item: formattedRecording });
    }
    return res.json(formattedRecording);
  }

  // Check SavedYoutubeVideo
  const SavedYoutubeVideo = require('../models/SavedYoutubeVideo');
  let video = await SavedYoutubeVideo.findOne({ _id: req.params.id, user: req.user._id });
  if (video) {
    if (req.body.title) video.title = req.body.title;
    if (req.body.extractedText) video.subtitles = req.body.extractedText;
    const updatedVideo = await video.save();
    const formattedVideo = {
      id: updatedVideo._id,
      sourceType: 'youtube',
      title: updatedVideo.title,
      originalContent: updatedVideo.url,
      extractedText: updatedVideo.subtitles,
      createdAt: updatedVideo.createdAt,
      updatedAt: updatedVideo.updatedAt
    };
    if (req.io) {
      req.io.emit('data-updated', { type: 'file_updated', item: formattedVideo });
    }
    return res.json(formattedVideo);
  }

  // Check SavedUrl
  const SavedUrl = require('../models/SavedUrl');
  let urlItem = await SavedUrl.findOne({ _id: req.params.id, user: req.user._id });
  if (urlItem) {
    if (req.body.title) urlItem.title = req.body.title;
    if (req.body.extractedText) urlItem.textContent = req.body.extractedText;
    const updatedUrl = await urlItem.save();
    const formattedUrl = {
      id: updatedUrl._id,
      sourceType: 'web',
      title: updatedUrl.title,
      originalContent: updatedUrl.url,
      extractedText: updatedUrl.textContent || updatedUrl.htmlContent,
      createdAt: updatedUrl.createdAt,
      updatedAt: updatedUrl.updatedAt
    };
    if (req.io) {
      req.io.emit('data-updated', { type: 'file_updated', item: formattedUrl });
    }
    return res.json(formattedUrl);
  }

  // Check PastedText
  const PastedText = require('../models/PastedText');
  let pastedText = await PastedText.findOne({ _id: req.params.id, user: req.user._id });
  if (pastedText) {
    if (req.body.title) pastedText.title = req.body.title;
    if (req.body.extractedText) pastedText.content = req.body.extractedText;
    const updatedPastedText = await pastedText.save();
    const formattedPastedText = {
      id: updatedPastedText._id,
      sourceType: 'text',
      title: updatedPastedText.title,
      originalContent: updatedPastedText.content,
      extractedText: updatedPastedText.content,
      createdAt: updatedPastedText.createdAt,
      updatedAt: updatedPastedText.updatedAt
    };
    if (req.io) {
      req.io.emit('data-updated', { type: 'file_updated', item: formattedPastedText });
    }
    return res.json(formattedPastedText);
  }

  // Check Note
  const Note = require('../models/Note');
  let note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (note) {
    if (req.body.title) note.title = req.body.title;
    if (req.body.extractedText) {
        // Note blocks are complex, we'll just update the first block or create one if it doesn't exist
        if (!note.blocks || note.blocks.length === 0) {
            note.blocks = [{ id: 'block1', type: 'paragraph', content: req.body.extractedText }];
        } else {
            note.blocks[0].content = req.body.extractedText;
        }
    }
    const updatedNote = await note.save();
    const formattedNote = {
      id: updatedNote._id,
      sourceType: 'note',
      title: updatedNote.title,
      originalContent: '',
      extractedText: updatedNote.blocks ? updatedNote.blocks.map(b => b.content).join('\n') : '',
      createdAt: updatedNote.createdAt,
      updatedAt: updatedNote.updatedAt
    };
    if (req.io) {
      req.io.emit('data-updated', { type: 'file_updated', item: formattedNote });
    }
    return res.json(formattedNote);
  }

  res.status(404);
  throw new Error('Storage item not found');
});

const deleteAlchemyStorageItem = asyncHandler(async (req, res) => {
  const mongoose = require('mongoose');
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error('Invalid ID format');
  }

  const broadcastDelete = async () => {
    if (req.io) {
      req.io.emit('data-updated', { type: 'file_deleted', id: req.params.id });
    }
    // Delete associated vector store documents
    try {
      const VectorStore = require('../models/VectorStore');
      await VectorStore.deleteMany({
        userId: req.user._id,
        'metadata.originalDocId': req.params.id
      });
    } catch (e) {
      console.error('Error deleting vector store documents:', e);
    }
  };

  const item = await AlchemyStorageItem.findOne({ _id: req.params.id, user: req.user._id });
  if (item) {
    await item.deleteOne();
    await broadcastDelete();
    return res.json({ message: 'Storage item removed' });
  }

  // Check SavedRecording
  const SavedRecording = require('../models/SavedRecording');
  const recording = await SavedRecording.findOne({ _id: req.params.id, user: req.user._id });
  if (recording) {
    await recording.deleteOne();
    await broadcastDelete();
    return res.json({ message: 'Storage item removed' });
  }

  // Check SavedYoutubeVideo
  const SavedYoutubeVideo = require('../models/SavedYoutubeVideo');
  const video = await SavedYoutubeVideo.findOne({ _id: req.params.id, user: req.user._id });
  if (video) {
    await video.deleteOne();
    await broadcastDelete();
    return res.json({ message: 'Storage item removed' });
  }

  // Check SavedUrl
  const SavedUrl = require('../models/SavedUrl');
  const urlItem = await SavedUrl.findOne({ _id: req.params.id, user: req.user._id });
  if (urlItem) {
    await urlItem.deleteOne();
    await broadcastDelete();
    return res.json({ message: 'Storage item removed' });
  }

  // Check PastedText
  const PastedText = require('../models/PastedText');
  const pastedText = await PastedText.findOne({ _id: req.params.id, user: req.user._id });
  if (pastedText) {
    await pastedText.deleteOne();
    await broadcastDelete();
    return res.json({ message: 'Storage item removed' });
  }

  // Check Note
  const Note = require('../models/Note');
  const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
  if (note) {
    await note.deleteOne();
    await broadcastDelete();
    return res.json({ message: 'Storage item removed' });
  }

  res.status(404);
  throw new Error('Storage item not found');
});

// --- AlchemyStorageFlashcard ---
const getAlchemyStorageFlashcards = asyncHandler(async (req, res) => {
  const flashcards = await AlchemyStorageFlashcard.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(flashcards);
});

const createAlchemyStorageFlashcard = asyncHandler(async (req, res) => {
  const flashcard = new AlchemyStorageFlashcard({ ...req.body, user: req.user._id });
  const createdFlashcard = await flashcard.save();
  res.status(201).json(createdFlashcard);
});

const updateAlchemyStorageFlashcard = asyncHandler(async (req, res) => {
  const flashcard = await AlchemyStorageFlashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (flashcard) {
    Object.assign(flashcard, req.body);
    const updatedFlashcard = await flashcard.save();
    res.json(updatedFlashcard);
  } else {
    res.status(404);
    throw new Error('Flashcard not found');
  }
});

const deleteAlchemyStorageFlashcard = asyncHandler(async (req, res) => {
  const flashcard = await AlchemyStorageFlashcard.findOne({ _id: req.params.id, user: req.user._id });
  if (flashcard) {
    await flashcard.deleteOne();
    res.json({ message: 'Flashcard removed' });
  } else {
    res.status(404);
    throw new Error('Flashcard not found');
  }
});

// --- FlashcardDecks ---
const getFlashcardDecks = asyncHandler(async (req, res) => {
  const decks = await FlashcardDeck.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(decks);
});

const createFlashcardDeck = asyncHandler(async (req, res) => {
  const deck = new FlashcardDeck({ ...req.body, user: req.user._id });
  const createdDeck = await deck.save();
  res.status(201).json(createdDeck);
});

const updateFlashcardDeck = asyncHandler(async (req, res) => {
  const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user._id });
  if (deck) {
    Object.assign(deck, req.body);
    const updatedDeck = await deck.save();
    res.json(updatedDeck);
  } else {
    res.status(404);
    throw new Error('Deck not found');
  }
});

const deleteFlashcardDeck = asyncHandler(async (req, res) => {
  const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user._id });
  if (deck) {
    await deck.deleteOne();
    res.json({ message: 'Deck removed' });
  } else {
    res.status(404);
    throw new Error('Deck not found');
  }
});

// --- AlchemyLogItem ---
const getAlchemyLogs = asyncHandler(async (req, res) => {
  const logs = await AlchemyLogItem.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(logs);
});

const createAlchemyLog = asyncHandler(async (req, res) => {
  const log = new AlchemyLogItem({ ...req.body, user: req.user._id });
  const createdLog = await log.save();
  res.status(201).json(createdLog);
});

// --- TutorPersona ---
const getTutorPersonas = asyncHandler(async (req, res) => {
  const personas = await TutorPersona.find({});
  res.json(personas);
});

const createTutorPersona = asyncHandler(async (req, res) => {
  const persona = new TutorPersona({ ...req.body, createdBy: req.user._id });
  const createdPersona = await persona.save();
  res.status(201).json(createdPersona);
});

const updateTutorPersona = asyncHandler(async (req, res) => {
  const persona = await TutorPersona.findById(req.params.id);
  if (persona) {
    Object.assign(persona, req.body);
    const updatedPersona = await persona.save();
    res.json(updatedPersona);
  } else {
    res.status(404);
    throw new Error('Persona not found');
  }
});

const deleteTutorPersona = asyncHandler(async (req, res) => {
  const persona = await TutorPersona.findById(req.params.id);
  if (persona) {
    await persona.deleteOne();
    res.json({ message: 'Persona removed' });
  } else {
    res.status(404);
    throw new Error('Persona not found');
  }
});

// --- AlchemyTemplate ---
const getAlchemyTemplates = asyncHandler(async (req, res) => {
  const templates = await AlchemyTemplate.find({});
  res.json(templates);
});

const createAlchemyTemplate = asyncHandler(async (req, res) => {
  const template = new AlchemyTemplate({ ...req.body, createdBy: req.user._id });
  const createdTemplate = await template.save();
  res.status(201).json(createdTemplate);
});

const updateAlchemyTemplate = asyncHandler(async (req, res) => {
  const template = await AlchemyTemplate.findById(req.params.id);
  if (template) {
    Object.assign(template, req.body);
    const updatedTemplate = await template.save();
    res.json(updatedTemplate);
  } else {
    res.status(404);
    throw new Error('Template not found');
  }
});

const deleteAlchemyTemplate = asyncHandler(async (req, res) => {
  const template = await AlchemyTemplate.findById(req.params.id);
  if (template) {
    await template.deleteOne();
    res.json({ message: 'Template removed' });
  } else {
    res.status(404);
    throw new Error('Template not found');
  }
});

// --- AlchemyPersona ---
const getAlchemyPersonas = asyncHandler(async (req, res) => {
  const personas = await AlchemyPersona.find({});
  res.json(personas);
});

const createAlchemyPersona = asyncHandler(async (req, res) => {
  const persona = new AlchemyPersona({ ...req.body, createdBy: req.user._id });
  const createdPersona = await persona.save();
  res.status(201).json(createdPersona);
});

const updateAlchemyPersona = asyncHandler(async (req, res) => {
  const persona = await AlchemyPersona.findById(req.params.id);
  if (persona) {
    Object.assign(persona, req.body);
    const updatedPersona = await persona.save();
    res.json(updatedPersona);
  } else {
    res.status(404);
    throw new Error('Persona not found');
  }
});

const deleteAlchemyPersona = asyncHandler(async (req, res) => {
  const persona = await AlchemyPersona.findById(req.params.id);
  if (persona) {
    await persona.deleteOne();
    res.json({ message: 'Persona removed' });
  } else {
    res.status(404);
    throw new Error('Persona not found');
  }
});

// --- Push Flashcard Deck to Knowledge Graph as a single node ---
const pushDeckToGraph = asyncHandler(async (req, res) => {
  const { deckId } = req.body;
  const userId = req.user._id;

  if (!deckId) {
    res.status(400);
    throw new Error('deckId is required');
  }

  let deckName = "Bộ thẻ mặc định";
  let deckDescription = "Bộ thẻ lẻ không xác định";
  let allCards = [];

  if (deckId === 'default' || deckId === 'temp_default') {
    // 1. Handle default deck push
    // Lấy toàn bộ cards chưa gán deckId hợp lệ hoặc mang tên bộ thẻ mặc định
    const individualCards = await AlchemyStorageFlashcard.find({ 
        user: userId, 
        $or: [{ deckId: { $exists: false } }, { deckId: null }, { deckName: "Bộ thẻ mặc định" }, { deckName: "Thẻ lẻ" }]
    });
    
    allCards = individualCards.map(c => ({ front: c.front, back: c.back }));
  } else {
    // 2. Fetch the metadata for an actual deck
    const deck = await FlashcardDeck.findOne({ _id: deckId, user: userId });
    if (!deck) {
      res.status(404);
      throw new Error('FlashcardDeck not found');
    }

    deckName = deck.name;
    deckDescription = deck.description;

    // Fetch individual flashcards belonging to this deck
    const individualCards = await AlchemyStorageFlashcard.find({ deckId, user: userId });

    // Build the normalized cards array — merge embedded cards + individual cards
    const embeddedCards = (deck.cards || []).map(c => ({ front: c.front, back: c.back }));
    const fetchedCards = individualCards.map(c => ({ front: c.front, back: c.back }));

    // Deduplicate by combining both sources (embedded wins)
    allCards = embeddedCards.length > 0 ? embeddedCards : fetchedCards;
  }

  if (allCards.length === 0) {
    res.status(400);
    throw new Error('Deck has no flashcard content to push to Graph');
  }

  // 3. Create exactly ONE graph node representing the whole deck
  const newNode = new Node({
    user: userId,
    title: deckName,
    type: 'Flashcard',
    tags: ['Flashcard Deck', deckName],
    data: {
      summary: deckDescription || `Bộ flashcard: ${deckName} (${allCards.length} thẻ)`,
      flashcards: allCards, // ← FIX: was "cards", LearningModal reads "flashcards"
      deckId: deckId === 'default' ? 'default' : deckId.toString(),
      cardCount: allCards.length
    }
  });

  const saved = await newNode.save();

  // 4. Trigger Vector Embedding for RAG (integrate node content into Knowledge Base)
  try {
    const textContent = allCards.map(c => `Q: ${c.front}\nA: ${c.back}`).join('\n\n');
    const BackgroundWorker = require('../services/backgroundWorker');
    const worker = new BackgroundWorker();
    await worker.embedAndStoreDocument(textContent, userId, 'graph_node', saved._id.toString(), deckName);
    console.log(`[VectorService] ✅ Successfully embedded and stored deck node ${saved._id}`);
  } catch (err) {
    console.error(`[VectorService] ❌ Error embedding deck node ${saved._id}:`, err.message);
  }

  const obj = saved.toObject();
  obj.id = obj._id;
  delete obj._id;

  res.status(201).json(obj);
});

// @desc    Process content with AI (Alchemy)
// @route   POST /api/alchemy/process
// @access  Private
const processAlchemyContent = asyncHandler(async (req, res) => {
  const { personaId, templateId, instruction, sourceData } = req.body;
  const userId = req.user._id;

  // 1. Get API Key from header or ENV
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    res.status(400);
    throw new Error('Missing Gemini API Key. Please provide it in settings.');
  }

  // 2. Resolve Persona & Template Instructions
  let systemPrompt = "You are a powerful AI assistant expert in content alchemy and transformation.";
  
  try {
    if (personaId && personaId !== 'default') {
      const persona = await AlchemyPersona.findById(personaId);
      if (persona) systemPrompt = persona.instruction || persona.description || systemPrompt;
    }

    if (templateId && templateId !== 'default') {
       const template = await AlchemyTemplate.findById(templateId);
       if (template) systemPrompt += `\n\nTemplate/Output Style: ${template.instruction || template.description}`;
    }
  } catch (error) {
    console.warn('[Alchemy-Process] Error fetching persona/template metadata:', error.message);
  }

  // 3. Run AI Orchestrator
  const orchestrator = new AIOrchestrator(apiKey);
  
  const userMessage = `
    [SOURCE DATA TO PROCESS]
    ${sourceData || "No source data provided."}
    
    [USER INSTRUCTION]
    ${instruction || "Please process the content based on your persona and style."}
  `;

  try {
    console.log(`[Alchemy-Process] Starting AI generation with persona: ${personaId || 'default'}...`);
    const aiResponse = await orchestrator.run(systemPrompt, userMessage, [], userId.toString());
    res.json({ success: true, result: aiResponse });
  } catch (error) {
    console.error('[Alchemy-Process] AI Generation Error:', error.message);
    
    // Check for specific Google AI errors (like Invalid API Key)
    if (error.message && error.message.includes('API key not valid')) {
      return res.status(400).json({ 
        success: false, 
        error: "API key không hợp lệ. Vui lòng kiểm tra lại cấu hình Gemini API Key của bạn.",
        details: error.message
      });
    }

    res.status(error.status || 500).json({ 
      success: false, 
      error: error.message || 'Lỗi khi xử lý AI Alchemy',
      details: error.stack
    });
  }
});

module.exports = {
  getAlchemyLogs, createAlchemyLog,
  getTutorPersonas, createTutorPersona, updateTutorPersona, deleteTutorPersona,
  getAlchemyTemplates, createAlchemyTemplate, updateAlchemyTemplate, deleteAlchemyTemplate,
  getAlchemyPersonas, createAlchemyPersona, updateAlchemyPersona, deleteAlchemyPersona,
  getAlchemyStorageItems, createAlchemyStorageItem, updateAlchemyStorageItem, deleteAlchemyStorageItem,
  getAlchemyStorageFlashcards, createAlchemyStorageFlashcard, updateAlchemyStorageFlashcard, deleteAlchemyStorageFlashcard,
  getFlashcardDecks, createFlashcardDeck, updateFlashcardDeck, deleteFlashcardDeck,
  pushDeckToGraph, processAlchemyContent
};
