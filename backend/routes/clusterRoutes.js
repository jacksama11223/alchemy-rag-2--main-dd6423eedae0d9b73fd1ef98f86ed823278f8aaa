
const express = require('express');
const router = express.Router();
const { getClusters, createCluster, updateCluster, deleteCluster } = require('../controllers/clusterController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getClusters).post(protect, createCluster);
router.route('/:id').put(protect, updateCluster).delete(protect, deleteCluster);

module.exports = router;
