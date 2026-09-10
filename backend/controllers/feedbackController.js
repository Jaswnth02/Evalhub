const db = require('../config/db');

// Add or Update Faculty Feedback
async function addOrUpdateFeedback(req, res, next) {
  try {
    const { submissionId, comments } = req.body;

    if (!submissionId || !comments) {
      return res.status(400).json({
        success: false,
        message: 'Submission ID and comments are required.'
      });
    }

    const facultyId = req.user.faculty_id;
    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Only faculty members can provide evaluation feedback.'
      });
    }

    // Check if feedback already exists for this submission
    const existing = await db.query('SELECT feedback_id FROM feedback WHERE submission_id = ?', [submissionId]);

    if (existing.length > 0) {
      await db.execute(
        'UPDATE feedback SET comments = ?, faculty_id = ?, created_at = CURRENT_TIMESTAMP WHERE submission_id = ?',
        [comments, facultyId, submissionId]
      );
    } else {
      await db.execute(
        'INSERT INTO feedback (submission_id, faculty_id, comments) VALUES (?, ?, ?)',
        [submissionId, facultyId, comments]
      );
    }

    // Synchronize comments into reports table
    await db.execute(
      'UPDATE reports SET feedback = ? WHERE submission_id = ?',
      [comments, submissionId]
    );

    res.json({
      success: true,
      message: 'Feedback submitted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

// Get Feedback by Submission ID
async function getFeedbackBySubmission(req, res, next) {
  try {
    const submissionId = req.params.submissionId;

    const feedbackList = await db.query(
      `SELECT fb.*, u.name as faculty_name, u.email as faculty_email, f.department as faculty_department
       FROM feedback fb
       JOIN faculty f ON fb.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE fb.submission_id = ?`,
      [submissionId]
    );

    if (feedbackList.length === 0) {
      return res.json({
        success: true,
        feedback: null
      });
    }

    res.json({
      success: true,
      feedback: feedbackList[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addOrUpdateFeedback,
  getFeedbackBySubmission
};
