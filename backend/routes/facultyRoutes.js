const express = require('express');
const router = express.Router();
const facultyController = require('../controllers/facultyController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/dashboard/stats', authenticateToken, requireRole('faculty', 'admin'), facultyController.getFacultyDashboard);
router.get('/', authenticateToken, facultyController.getAllFaculty);
router.get('/:id', authenticateToken, facultyController.getFacultyById);

module.exports = router;
