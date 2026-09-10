const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, requireRole } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, assignmentController.getAssignments);
router.get('/:id', authenticateToken, assignmentController.getAssignmentById);
router.post('/', authenticateToken, requireRole('faculty', 'admin'), assignmentController.createAssignment);
router.put('/:id', authenticateToken, requireRole('faculty', 'admin'), assignmentController.updateAssignment);
router.delete('/:id', authenticateToken, requireRole('faculty', 'admin'), assignmentController.deleteAssignment);

module.exports = router;
