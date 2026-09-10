const express = require('express');
const router = express.Router();
const feedbackController = require('../controllers/feedbackController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, requireRole('faculty', 'admin'), feedbackController.addOrUpdateFeedback);
router.get('/:submissionId', authenticateToken, feedbackController.getFeedbackBySubmission);

module.exports = router;
