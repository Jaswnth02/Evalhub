const db = require('../config/db');

// Create New Assignment
async function createAssignment(req, res, next) {
  try {
    const {
      title,
      description,
      instructions,
      programmingLanguage,
      deadline,
      maxTestScore = 60,
      maxQualityScore = 40,
      testCases = []
    } = req.body;

    if (!title || !programmingLanguage || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, programming language, and deadline are required.'
      });
    }

    const facultyId = req.user.faculty_id;
    if (!facultyId) {
      return res.status(403).json({
        success: false,
        message: 'Only registered faculty members can create assignments.'
      });
    }

    // Insert assignment
    const assignRes = await db.execute(
      `INSERT INTO assignments 
       (title, description, instructions, programming_language, deadline, faculty_id, max_test_score, max_quality_score)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description || '',
        instructions || '',
        programmingLanguage.toLowerCase(),
        deadline,
        facultyId,
        maxTestScore,
        maxQualityScore
      ]
    );

    const assignmentId = assignRes.insertId;

    // Insert test cases if provided
    if (Array.isArray(testCases) && testCases.length > 0) {
      for (const tc of testCases) {
        if (tc.expectedOutput !== undefined && tc.expectedOutput !== null) {
          await db.execute(
            `INSERT INTO test_cases (assignment_id, input_data, expected_output, marks, is_sample)
             VALUES (?, ?, ?, ?, ?)`,
            [
              assignmentId,
              tc.inputData || '',
              tc.expectedOutput,
              tc.marks || 10,
              tc.isSample ? 1 : 0
            ]
          );
        }
      }
    }

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      assignmentId
    });
  } catch (err) {
    next(err);
  }
}

// Get All Assignments
async function getAssignments(req, res, next) {
  try {
    const userRole = req.user ? req.user.role : 'guest';
    const userId = req.user ? req.user.user_id : null;
    const studentId = req.user ? req.user.student_id : null;

    const sql = `
      SELECT 
        a.assignment_id,
        a.title,
        a.description,
        a.instructions,
        a.programming_language,
        a.deadline,
        a.max_test_score,
        a.max_quality_score,
        a.created_at,
        u.name as faculty_name,
        f.department as faculty_department,
        (SELECT COUNT(*) FROM test_cases tc WHERE tc.assignment_id = a.assignment_id) as test_case_count,
        (SELECT COUNT(*) FROM submissions s WHERE s.assignment_id = a.assignment_id) as total_submissions
      FROM assignments a
      JOIN faculty f ON a.faculty_id = f.faculty_id
      JOIN users u ON f.user_id = u.user_id
      ORDER BY a.created_at DESC
    `;

    const assignments = await db.query(sql);

    // If student, attach their submission status for each assignment
    if (studentId) {
      const studentSubmissions = await db.query(
        'SELECT assignment_id, submission_id, status, submitted_at FROM submissions WHERE student_id = ?',
        [studentId]
      );
      const subMap = {};
      studentSubmissions.forEach(s => { subMap[s.assignment_id] = s; });

      assignments.forEach(a => {
        a.mySubmission = subMap[a.assignment_id] || null;
      });
    }

    res.json({
      success: true,
      assignments
    });
  } catch (err) {
    next(err);
  }
}

// Get Single Assignment Details
async function getAssignmentById(req, res, next) {
  try {
    const assignmentId = req.params.id;

    const assignments = await db.query(
      `SELECT 
        a.*,
        u.name as faculty_name,
        u.email as faculty_email,
        f.department as faculty_department
       FROM assignments a
       JOIN faculty f ON a.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE a.assignment_id = ?`,
      [assignmentId]
    );

    if (assignments.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found.'
      });
    }

    const assignment = assignments[0];

    // Role-dependent test case visibility
    let testCases;
    if (req.user && (req.user.role === 'faculty' || req.user.role === 'admin')) {
      testCases = await db.query(
        'SELECT * FROM test_cases WHERE assignment_id = ? ORDER BY test_case_id ASC',
        [assignmentId]
      );
    } else {
      // Students only see sample/public test cases
      testCases = await db.query(
        'SELECT test_case_id, input_data, expected_output, marks, is_sample FROM test_cases WHERE assignment_id = ? AND is_sample = 1 ORDER BY test_case_id ASC',
        [assignmentId]
      );
    }

    // If user is a student, attach their own submission details
    let mySubmission = null;
    if (req.user && req.user.student_id) {
      const subs = await db.query(
        `SELECT s.*, e.compilation_status, e.execution_status, e.total_score, r.plagiarism_score, fb.comments as feedback_comment
         FROM submissions s
         LEFT JOIN evaluations e ON s.submission_id = e.submission_id
         LEFT JOIN reports r ON s.submission_id = r.submission_id
         LEFT JOIN feedback fb ON s.submission_id = fb.submission_id
         WHERE s.assignment_id = ? AND s.student_id = ?`,
        [assignmentId, req.user.student_id]
      );
      if (subs.length > 0) {
        mySubmission = subs[0];
      }
    }

    res.json({
      success: true,
      assignment: {
        ...assignment,
        testCases,
        mySubmission
      }
    });
  } catch (err) {
    next(err);
  }
}

// Update Assignment
async function updateAssignment(req, res, next) {
  try {
    const assignmentId = req.params.id;
    const { title, description, instructions, deadline, maxTestScore, maxQualityScore } = req.body;

    await db.execute(
      `UPDATE assignments 
       SET title = COALESCE(?, title),
           description = COALESCE(?, description),
           instructions = COALESCE(?, instructions),
           deadline = COALESCE(?, deadline),
           max_test_score = COALESCE(?, max_test_score),
           max_quality_score = COALESCE(?, max_quality_score)
       WHERE assignment_id = ?`,
      [title, description, instructions, deadline, maxTestScore, maxQualityScore, assignmentId]
    );

    res.json({
      success: true,
      message: 'Assignment updated successfully.'
    });
  } catch (err) {
    next(err);
  }
}

// Delete Assignment
async function deleteAssignment(req, res, next) {
  try {
    const assignmentId = req.params.id;
    await db.execute('DELETE FROM assignments WHERE assignment_id = ?', [assignmentId]);

    res.json({
      success: true,
      message: 'Assignment deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  updateAssignment,
  deleteAssignment
};
