const db = require('../config/db');

// Student Dashboard Statistics
async function getStudentDashboard(req, res, next) {
  try {
    const studentId = req.user.student_id;
    if (!studentId) {
      return res.status(403).json({ success: false, message: 'Student profile not found.' });
    }

    // 1. Total Assignments
    const totalAssignmentsRes = await db.query('SELECT COUNT(*) as count FROM assignments');
    const totalAssignments = totalAssignmentsRes[0].count || 0;

    // 2. Student Submissions
    const submissions = await db.query(
      `SELECT 
        s.submission_id,
        s.assignment_id,
        s.original_filename,
        s.submitted_at,
        s.status,
        a.title as assignment_title,
        a.deadline,
        a.programming_language,
        e.compilation_status,
        e.execution_status,
        e.total_score,
        r.plagiarism_score,
        fb.comments as feedback_comment
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.assignment_id
       LEFT JOIN evaluations e ON s.submission_id = e.submission_id
       LEFT JOIN reports r ON s.submission_id = r.submission_id
       LEFT JOIN feedback fb ON s.submission_id = fb.submission_id
       WHERE s.student_id = ?
       ORDER BY s.submitted_at DESC`,
      [studentId]
    );

    const submittedCount = submissions.length;
    const evaluatedCount = submissions.filter(s => s.status === 'evaluated').length;
    const pendingCount = submissions.filter(s => s.status === 'submitted' || s.status === 'evaluating').length;

    // Recent results
    const recentResults = submissions.slice(0, 5);

    res.json({
      success: true,
      stats: {
        totalAssignments,
        submittedProjects: submittedCount,
        pendingEvaluations: pendingCount,
        completedEvaluations: evaluatedCount
      },
      recentResults
    });
  } catch (err) {
    next(err);
  }
}

// Get all students (Admin/Faculty only)
async function getAllStudents(req, res, next) {
  try {
    const students = await db.query(
      `SELECT 
        s.student_id,
        s.register_number,
        s.department,
        s.year,
        u.user_id,
        u.name,
        u.email,
        u.created_at,
        (SELECT COUNT(*) FROM submissions sub WHERE sub.student_id = s.student_id) as total_submissions
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       ORDER BY s.register_number ASC`
    );

    res.json({
      success: true,
      students
    });
  } catch (err) {
    next(err);
  }
}

// Get single student by ID
async function getStudentById(req, res, next) {
  try {
    const studentId = req.params.id;
    const students = await db.query(
      `SELECT 
        s.student_id,
        s.register_number,
        s.department,
        s.year,
        u.user_id,
        u.name,
        u.email,
        u.created_at
       FROM students s
       JOIN users u ON s.user_id = u.user_id
       WHERE s.student_id = ?`,
      [studentId]
    );

    if (students.length === 0) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({
      success: true,
      student: students[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getStudentDashboard,
  getAllStudents,
  getStudentById
};
