const express = require('express');
const router = express.Router();
const evaluationController = require('../controllers/evaluationController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.post('/:submissionId', authenticateToken, requireRole('faculty', 'admin'), evaluationController.triggerEvaluation);
router.get('/:submissionId', authenticateToken, evaluationController.getEvaluation);

module.exports = router;
