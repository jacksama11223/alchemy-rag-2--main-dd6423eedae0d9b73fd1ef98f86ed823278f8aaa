const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addXP, updateRank,
  getQuests, createQuest, updateQuest, deleteQuest,
  getAchievements, createAchievement, updateAchievement,
  getSkillAchievements,
  getSecondBrainStats
} = require('../controllers/gamificationController');

router.use(protect);

router.route('/xp').post(addXP);
router.route('/rank').post(updateRank);

router.route('/quests').get(getQuests).post(createQuest);
router.route('/quests/:id').put(updateQuest).delete(deleteQuest);

router.route('/achievements').get(getAchievements).post(createAchievement);
router.route('/achievements/:id').put(updateAchievement);

router.route('/skill-achievements').get(getSkillAchievements);
router.route('/second-brain').get(getSecondBrainStats);

module.exports = router;
