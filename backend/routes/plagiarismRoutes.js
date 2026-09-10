const express = require('express');
const router = express.Router();
const plagiarismController = require('../controllers/plagiarismController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/:submissionId', authenticateToken, plagiarismController.getPlagiarismBySubmission);
router.get('/assignment/:assignmentId', authenticateToken, requireRole('faculty', 'admin'), plagiarismController.getAssignmentPlagiarismHub);

module.exports = router;
