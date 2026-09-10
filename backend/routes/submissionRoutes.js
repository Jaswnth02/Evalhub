const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const upload = require('../middleware/uploadMiddleware');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, requireRole('student'), upload.single('codeFile'), submissionController.submitProject);
router.get('/', authenticateToken, submissionController.getSubmissions);
router.get('/:id', authenticateToken, submissionController.getSubmissionById);
router.delete('/:id', authenticateToken, requireRole('faculty', 'admin'), submissionController.deleteSubmission);

module.exports = router;
