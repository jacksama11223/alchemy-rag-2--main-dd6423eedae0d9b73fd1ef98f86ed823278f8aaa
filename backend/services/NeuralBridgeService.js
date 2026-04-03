// backend/services/NeuralBridgeService.js
const Todo = require('../models/Todo');
const Note = require('../models/Note');
const Node = require('../models/Node');

class NeuralBridgeService {
  /**
   * Transforms an Alchemy parsed item into a connected Knowledge Hub via auto-generation.
   * Auto-links to Todo board and NoteLab.
   */
  async autoLinkAlchemyToHub(alchemyItem, userId) {
    try {
      // 1. Create a Base Node for this Alchemy Item in the Graph
      const newNode = new Node({
        user: userId,
        title: alchemyItem.title || 'Untitled Alchemy Source',
        type: 'KnowledgeHub',
        originalAuthor: 'NeuralBridge',
        linkedTodos: [],
        linkedNotes: [],
        linkedAlchemy: [alchemyItem._id] // Link directly to the source
      });
      await newNode.save();

      // 2. Initialize a Draft in NoteLab
      const baseNote = new Note({
        user: userId,
        title: `Draft: ${alchemyItem.title}`,
        blocks: [{ id: 'block0', type: 'paragraph', content: 'Auto-generated context from Alchemy...' }],
        tags: ['auto-linked']
      });
      await baseNote.save();
      newNode.linkedNotes.push(baseNote._id);

      // 3. Create a corresponding Kanban Task in Todo
      const task = new Todo({
        user: userId,
        title: `Review Mastery: ${alchemyItem.title}`,
        text: 'System generated task to review auto-extracted knowledge.',
        status: 'todo', // Starting column
        boardId: 'default',
        tags: ['mastery-pipeline']
      });
      await task.save();
      newNode.linkedTodos.push(task._id);

      // Save references on the Master Node
      await newNode.save();

      return newNode;
    } catch (e) {
      console.error('[NeuralBridge] Auto-linking failed', e);
      throw e;
    }
  }

  /**
   * Manually attaches a Node to a specific module
   */
  async attachModuleToNode(nodeId, targetId, moduleType, userId) {
    const node = await Node.findOne({ _id: nodeId, user: userId });
    if (!node) throw new Error('Node not found');

    if (moduleType === 'todo') node.linkedTodos.push(targetId);
    if (moduleType === 'note') node.linkedNotes.push(targetId);
    if (moduleType === 'alchemy') node.linkedAlchemy.push(targetId);

    await node.save();
    return node;
  }
}

module.exports = new NeuralBridgeService();
