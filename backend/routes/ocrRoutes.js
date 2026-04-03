const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOcrDocuments,
  getOcrDocumentById,
  createOcrDocument,
  updateOcrDocument,
  deleteOcrDocument
} = require('../controllers/ocrController');

router.route('/')
  .get(protect, getOcrDocuments)
  .post(protect, createOcrDocument);

router.route('/:id')
  .get(protect, getOcrDocumentById)
  .put(protect, updateOcrDocument)
  .delete(protect, deleteOcrDocument);

module.exports = router;
