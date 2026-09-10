const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { evaluateSubmissionById } = require('../services/evaluation/evaluator');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Submit Project / Upload Code File
async function submitProject(req, res, next) {
  try {
    const { assignmentId } = req.body;
    const file = req.file;

    if (!assignmentId) {
      return res.status(400).json({ success: false, message: 'Assignment ID is required.' });
    }

    if (!file) {
      return res.status(400).json({ success: false, message: 'Please upload a source code file.' });
    }

    const studentId = req.user.student_id;
    if (!studentId) {
      return res.status(403).json({ success: false, message: 'Only students can submit assignments.' });
    }

    // Verify assignment exists and deadline
    const assignments = await db.query('SELECT * FROM assignments WHERE assignment_id = ?', [assignmentId]);
    if (assignments.length === 0) {
      return res.status(404).json({ success: false, message: 'Assignment does not exist.' });
    }

    // Check if student has an existing submission for this assignment
    const existing = await db.query(
      'SELECT submission_id, file_path FROM submissions WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );

    let submissionId;
    if (existing.length > 0) {
      // Update existing submission with new file
      submissionId = existing[0].submission_id;

      // Safely delete previous file if it exists
      const oldPath = path.join(UPLOADS_DIR, existing[0].file_path);
      if (fs.existsSync(oldPath)) {
        try { fs.unlinkSync(oldPath); } catch (e) {}
      }

      await db.execute(
        `UPDATE submissions 
         SET file_path = ?, original_filename = ?, submitted_at = CURRENT_TIMESTAMP, status = 'submitted'
         WHERE submission_id = ?`,
        [file.filename, file.originalname, submissionId]
      );
    } else {
      // Insert new submission
      const subRes = await db.execute(
        `INSERT INTO submissions (assignment_id, student_id, file_path, original_filename, status)
         VALUES (?, ?, ?, ?, 'submitted')`,
        [assignmentId, studentId, file.filename, file.originalname]
      );
      submissionId = subRes.insertId;
    }

    // Auto-evaluate option (runs evaluation in background or synchronously)
    let evaluationSummary = null;
    try {
      evaluationSummary = await evaluateSubmissionById(submissionId);
    } catch (evalErr) {
      console.warn(`Automated evaluation warning on submission ${submissionId}:`, evalErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Project source code submitted successfully!',
      submissionId,
      evaluationSummary
    });
  } catch (err) {
    next(err);
  }
}

// Get Submissions (Filtered by query params)
async function getSubmissions(req, res, next) {
  try {
    const { assignmentId, studentId } = req.query;
    let sql = `
      SELECT 
        s.submission_id,
        s.assignment_id,
        s.student_id,
        s.file_path,
        s.original_filename,
        s.submitted_at,
        s.status,
        a.title as assignment_title,
        a.programming_language,
        u.name as student_name,
        u.email as student_email,
        st.register_number,
        st.department,
        e.compilation_status,
        e.execution_status,
        e.test_cases_passed,
        e.test_cases_failed,
        e.test_score,
        e.total_score,
        r.plagiarism_score,
        (SELECT COUNT(*) FROM test_cases tc WHERE tc.assignment_id = s.assignment_id) as total_test_cases
      FROM submissions s
      JOIN assignments a ON s.assignment_id = a.assignment_id
      JOIN students st ON s.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      LEFT JOIN evaluations e ON s.submission_id = e.submission_id
      LEFT JOIN reports r ON s.submission_id = r.submission_id
      WHERE 1=1
    `;

    const params = [];

    // If user is student, restrict to own submissions
    if (req.user.role === 'student') {
      sql += ' AND s.student_id = ?';
      params.push(req.user.student_id);
    } else {
      if (studentId) {
        sql += ' AND s.student_id = ?';
        params.push(studentId);
      }
    }

    if (assignmentId) {
      sql += ' AND s.assignment_id = ?';
      params.push(assignmentId);
    }

    sql += ' ORDER BY s.submitted_at DESC';

    const submissions = await db.query(sql, params);

    res.json({
      success: true,
      submissions
    });
  } catch (err) {
    next(err);
  }
}

// Get Single Submission Details with Source Code Content
async function getSubmissionById(req, res, next) {
  try {
    const submissionId = req.params.id;

    const subs = await db.query(
      `SELECT 
        s.*,
        a.title as assignment_title,
        a.description as assignment_description,
        a.programming_language,
        a.max_test_score,
        a.max_quality_score,
        u.name as student_name,
        u.email as student_email,
        st.register_number,
        st.department,
        st.year,
        e.evaluation_id,
        e.compilation_status,
        e.execution_status,
        e.test_cases_passed,
        e.test_cases_failed,
        e.test_score,
        e.other_score,
        e.plagiarism_penalty,
        e.total_score,
        e.compilation_output,
        e.evaluated_at,
        r.plagiarism_score as report_plagiarism_score,
        fb.feedback_id,
        fb.comments as faculty_feedback,
        fu.name as feedback_faculty_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.assignment_id
       JOIN students st ON s.student_id = st.student_id
       JOIN users u ON st.user_id = u.user_id
       LEFT JOIN evaluations e ON s.submission_id = e.submission_id
       LEFT JOIN reports r ON s.submission_id = r.submission_id
       LEFT JOIN feedback fb ON s.submission_id = fb.submission_id
       LEFT JOIN faculty f ON fb.faculty_id = f.faculty_id
       LEFT JOIN users fu ON f.user_id = fu.user_id
       WHERE s.submission_id = ?`,
      [submissionId]
    );

    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const sub = subs[0];

    // Authorization check: student can only view own submission
    if (req.user.role === 'student' && sub.student_id !== req.user.student_id) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this submission.' });
    }

    // Read Source Code File
    let codeContent = '';
    const filePath = path.join(UPLOADS_DIR, sub.file_path);
    if (fs.existsSync(filePath)) {
      codeContent = fs.readFileSync(filePath, 'utf8');
    }

    // Fetch test case breakdown if evaluated
    let testCaseResults = [];
    if (sub.evaluation_id) {
      testCaseResults = await db.query(
        `SELECT tcr.*, tc.input_data, tc.expected_output, tc.marks as max_marks, tc.is_sample
         FROM test_case_results tcr
         JOIN test_cases tc ON tcr.test_case_id = tc.test_case_id
         WHERE tcr.evaluation_id = ?
         ORDER BY tc.test_case_id ASC`,
        [sub.evaluation_id]
      );
    }

    // Fetch Plagiarism Matches for this submission
    const plagiarismMatches = await db.query(
      `SELECT pr.*, s.original_filename as compared_filename, u.name as compared_student_name, st.register_number as compared_reg_no
       FROM plagiarism_results pr
       JOIN submissions s ON pr.compared_submission_id = s.submission_id
       JOIN students st ON s.student_id = st.student_id
       JOIN users u ON st.user_id = u.user_id
       WHERE pr.submission_id = ?
       ORDER BY pr.similarity_score DESC`,
      [submissionId]
    );

    res.json({
      success: true,
      submission: {
        ...sub,
        codeContent,
        testCaseResults,
        plagiarismMatches
      }
    });
  } catch (err) {
    next(err);
  }
}

// Delete Submission
async function deleteSubmission(req, res, next) {
  try {
    const submissionId = req.params.id;

    const subs = await db.query('SELECT file_path FROM submissions WHERE submission_id = ?', [submissionId]);
    if (subs.length > 0 && subs[0].file_path) {
      const fPath = path.join(UPLOADS_DIR, subs[0].file_path);
      if (fs.existsSync(fPath)) {
        try { fs.unlinkSync(fPath); } catch (e) {}
      }
    }

    await db.execute('DELETE FROM submissions WHERE submission_id = ?', [submissionId]);

    res.json({
      success: true,
      message: 'Submission deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitProject,
  getSubmissions,
  getSubmissionById,
  deleteSubmission
};
