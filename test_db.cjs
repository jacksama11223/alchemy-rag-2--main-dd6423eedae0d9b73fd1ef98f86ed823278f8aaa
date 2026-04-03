const mongoose = require('mongoose');
const Node = require('./backend/models/Node');

async function test() {
  await mongoose.connect('mongodb://localhost:27017/alchemy-rag');
  
  const nodes = await Node.find({ type: 'Flashcard' }).sort({ createdAt: -1 }).limit(5);
  console.log("Flashcard Nodes found: ", nodes.length);
  for (const n of nodes) {
    console.log(`Node ${n._id}: ${n.title}`);
    console.log(`  data keys: ${n.data ? Object.keys(n.data).join(', ') : 'NONE'}`);
    if (n.data) {
        console.log(`  data.flashcards:`, n.data.flashcards);
    }
  }
  
  mongoose.disconnect();
}

test().catch(console.error);
