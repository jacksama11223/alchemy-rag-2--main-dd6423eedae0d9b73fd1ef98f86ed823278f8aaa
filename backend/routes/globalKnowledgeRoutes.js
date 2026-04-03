const express = require('express');
const router = express.Router();
const globalKnowledgeController = require('../controllers/globalKnowledgeController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/upsert', globalKnowledgeController.upsertKnowledge);
router.post('/search', globalKnowledgeController.searchKnowledge);

module.exports = router;
