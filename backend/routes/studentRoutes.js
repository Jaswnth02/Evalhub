const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/dashboard/stats', authenticateToken, requireRole('student'), studentController.getStudentDashboard);
router.get('/', authenticateToken, requireRole('faculty', 'admin'), studentController.getAllStudents);
router.get('/:id', authenticateToken, studentController.getStudentById);

module.exports = router;
