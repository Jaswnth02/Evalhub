const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/:submissionId', authenticateToken, reportController.getReportBySubmissionId);

module.exports = router;
