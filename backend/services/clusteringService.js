const Cluster = require('../models/Cluster');
const Node = require('../models/Node');

/**
 * @desc    Auto-clusters nodes with a shared batch identifier (createdID)
 * @param   {string} userId - ID of the owner
 * @param   {string} batchId - Unique ID for the roadmap generation session
 * @param   {string} label - Title for the cluster (e.g., roadmap title)
 * @returns {Promise<Object>} - The saved session cluster
 */
const createBatchCluster = async (userId, batchId, label) => {
    try {
        console.log(`[ClusteringService] Clustering nodes for batch: ${batchId}...`);
        
        // Find all nodes in this batch
        const nodes = await Node.find({ user: userId, createdID: batchId }).lean();
        if (nodes.length === 0) {
            console.warn(`[ClusteringService] No nodes found for batch ${batchId}.`);
            return null;
        }

        const nodeIds = nodes.map(n => n._id.toString());

        // Calculate Centroid (Mean X/Y for visual positioning)
        let totalX = 0, totalY = 0;
        let validCoords = 0;
        nodes.forEach(n => {
            if (n.x !== undefined && n.y !== undefined) {
                totalX += n.x;
                totalY += n.y;
                validCoords++;
            }
        });

        const centroid = validCoords > 0 
            ? { x: totalX / validCoords, y: totalY / validCoords }
            : { x: 0, y: 0 };

        // Check for existing cluster
        let existingCluster = await Cluster.findOne({ user: userId, createdID: batchId });

        if (existingCluster) {
            // Update existing cluster
            existingCluster.label = label;
            existingCluster.nodeIds = nodeIds;
            existingCluster.centroid = centroid;
            return await existingCluster.save();
        } else {
            // Create new cluster
            const newCluster = new Cluster({
                user: userId,
                label: label,
                color: '#3b82f6', // Default blue theme for AI roadmaps
                nodeIds: nodeIds,
                createdID: batchId,
                centroid: centroid
            });
            return await newCluster.save();
        }
    } catch (error) {
        console.error(`[ClusteringService] Error:`, error);
        throw error;
    }
};

module.exports = {
    createBatchCluster
};
