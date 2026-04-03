// backend/workers/gapFinder.worker.js
const mongoose = require('mongoose');
const Node = require('../models/Node');
const VectorStore = require('../models/VectorStore');
const GapSuggestion = require('../models/GapSuggestion');
const VectorQueryService = require('../services/VectorQueryService');

class GapFinderWorker {
  /**
   * BFS graph traversal mapped against Vector Cosine Similarities to find semantic gaps in explicit connections.
   */
  async runScanner(userId) {
    try {
      console.log(`[GapFinder] Starting BFS scan for user ${userId}...`);
      
      // Preload cache for efficiency
      await VectorQueryService.warmupCache(userId);
      
      const allNodes = await Node.find({ user: userId }).lean();
      if (allNodes.length === 0) return;

      const nodeMap = new Map();
      allNodes.forEach(n => nodeMap.set(n._id.toString(), n));
      
      const visited = new Set();
      const unconnectedHighSimilarity = [];

      // Build an Map of NodeId -> embedding
      const nodeEmbeddings = new Map();
      const vectors = await VectorStore.find({ userId }).lean();
      
      vectors.forEach(v => {
        if (v.metadata && v.metadata.originalDocId) {
          nodeEmbeddings.set(v.metadata.originalDocId.toString(), v.embedding);
        }
      });

      // Breadth-First Traversal of explicit graph mapping
      for (const startNode of allNodes) {
        let sid = startNode._id.toString();
        if (visited.has(sid)) continue;

        let queue = [sid];
        
        while (queue.length > 0) {
          let currId = queue.shift();
          if (visited.has(currId)) continue;
          visited.add(currId);
          
          let node = nodeMap.get(currId);
          if (!node) continue;

          let connections = node.connectedNodeIds || [];
          
          // Explore explicit graph edge connections
          for (let connId of connections) {
            if (!visited.has(connId)) {
                queue.push(connId);
            }
          }

          // GAP ALGORITHM: Map memory vectors against disjoint set nodes seeking unconnected intersections
          let currVector = nodeEmbeddings.get(currId);
          if (currVector) {
             for (const otherNode of allNodes) {
               let oid = otherNode._id.toString();
               if (oid === currId || connections.includes(oid)) continue; // Skip explicit graph links

               let otherVector = nodeEmbeddings.get(oid);
               if (otherVector) {
                 const sim = VectorQueryService.cosineSimilarity(currVector, otherVector);
                 if (sim > 0.85) { 
                   // High Threshold Crossed! Register AI Gap Suggestion
                   const exists = await GapSuggestion.exists({
                      $or: [
                        { sourceNodeId: currId, targetNodeId: oid },
                        { sourceNodeId: oid, targetNodeId: currId }
                      ]
                   });

                   if (!exists) {
                       await GapSuggestion.create({
                           user: userId,
                           sourceNodeId: currId,
                           targetNodeId: oid,
                           similarityScore: sim
                       });
                       unconnectedHighSimilarity.push({ currId, oid, sim });
                   }
                 }
               }
             }
          }
        }
      }

      console.log(`[GapFinder] Scan complete. Registered ${unconnectedHighSimilarity.length} semantic structural gaps.`);

    } catch (e) {
      console.error('[GapFinder] Engine traversal failure:', e);
    }
  }
}

module.exports = new GapFinderWorker();
