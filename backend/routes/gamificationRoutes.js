const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addXP, updateRank,
  getQuests, createQuest, updateQuest, deleteQuest,
  getAchievements, createAchievement, updateAchievement,
  getSkillAchievements
} = require('../controllers/gamificationController');

router.route('/xp').post(protect, addXP);
router.route('/rank').post(protect, updateRank);

router.route('/quests').get(protect, getQuests).post(protect, createQuest);
router.route('/quests/:id').put(protect, updateQuest).delete(protect, deleteQuest);

router.route('/achievements').get(protect, getAchievements).post(protect, createAchievement);
router.route('/achievements/:id').put(protect, updateAchievement);

router.route('/skill-achievements').get(protect, getSkillAchievements);

module.exports = router;
