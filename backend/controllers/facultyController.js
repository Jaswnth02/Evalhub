const db = require('../config/db');

// Faculty Dashboard Statistics
async function getFacultyDashboard(req, res, next) {
  try {
    const facultyId = req.user.faculty_id;

    // Total assignments created by this faculty (or overall if admin)
    const assignFilter = facultyId ? 'WHERE faculty_id = ?' : '';
    const assignParams = facultyId ? [facultyId] : [];

    const assignments = await db.query(
      `SELECT * FROM assignments ${assignFilter} ORDER BY created_at DESC`,
      assignParams
    );
    const totalAssignments = assignments.length;

    // Submissions for these assignments
    const assignIds = assignments.map(a => a.assignment_id);
    let totalSubmissions = 0;
    let pendingEvaluations = 0;
    let evaluatedSubmissions = 0;
    let suspiciousSubmissions = 0;
    let recentSubmissions = [];

    if (assignIds.length > 0) {
      const placeholders = assignIds.map(() => '?').join(',');
      const subs = await db.query(
        `SELECT 
          s.submission_id,
          s.assignment_id,
          s.submitted_at,
          s.status,
          s.original_filename,
          a.title as assignment_title,
          u.name as student_name,
          st.register_number,
          e.total_score,
          e.compilation_status,
          r.plagiarism_score
         FROM submissions s
         JOIN assignments a ON s.assignment_id = a.assignment_id
         JOIN students st ON s.student_id = st.student_id
         JOIN users u ON st.user_id = u.user_id
         LEFT JOIN evaluations e ON s.submission_id = e.submission_id
         LEFT JOIN reports r ON s.submission_id = r.submission_id
         WHERE s.assignment_id IN (${placeholders})
         ORDER BY s.submitted_at DESC`,
        assignIds
      );

      totalSubmissions = subs.length;
      evaluatedSubmissions = subs.filter(s => s.status === 'evaluated').length;
      pendingEvaluations = subs.filter(s => s.status === 'submitted' || s.status === 'evaluating').length;
      suspiciousSubmissions = subs.filter(s => Number(s.plagiarism_score || 0) >= 60).length;
      recentSubmissions = subs.slice(0, 8);
    }

    res.json({
      success: true,
      stats: {
        totalAssignments,
        totalSubmissions,
        pendingEvaluations,
        evaluatedSubmissions,
        suspiciousSubmissions
      },
      assignments: assignments.slice(0, 5),
      recentSubmissions
    });
  } catch (err) {
    next(err);
  }
}

// Get all faculty members
async function getAllFaculty(req, res, next) {
  try {
    const faculty = await db.query(
      `SELECT 
        f.faculty_id,
        f.department,
        u.user_id,
        u.name,
        u.email,
        u.created_at,
        (SELECT COUNT(*) FROM assignments a WHERE a.faculty_id = f.faculty_id) as total_assignments
       FROM faculty f
       JOIN users u ON f.user_id = u.user_id
       ORDER BY u.name ASC`
    );

    res.json({
      success: true,
      faculty
    });
  } catch (err) {
    next(err);
  }
}

// Get single faculty by ID
async function getFacultyById(req, res, next) {
  try {
    const facultyId = req.params.id;
    const faculty = await db.query(
      `SELECT 
        f.faculty_id,
        f.department,
        u.user_id,
        u.name,
        u.email,
        u.created_at
       FROM faculty f
       JOIN users u ON f.user_id = u.user_id
       WHERE f.faculty_id = ?`,
      [facultyId]
    );

    if (faculty.length === 0) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    res.json({
      success: true,
      faculty: faculty[0]
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getFacultyDashboard,
  getAllFaculty,
  getFacultyById
};
