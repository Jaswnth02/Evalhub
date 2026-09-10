const db = require('../config/db');

// Get Complete Evaluation Report for a submission
async function getReportBySubmissionId(req, res, next) {
  try {
    const submissionId = req.params.submissionId;

    // 1. Fetch submission, assignment, and student info
    const submissions = await db.query(
      `SELECT 
        s.submission_id,
        s.file_path,
        s.original_filename,
        s.submitted_at,
        s.status as submission_status,
        a.assignment_id,
        a.title as assignment_title,
        a.description as assignment_description,
        a.instructions as assignment_instructions,
        a.programming_language,
        a.deadline,
        a.max_test_score,
        a.max_quality_score,
        stu.student_id,
        stu.register_number,
        stu.department as student_department,
        stu.year as student_year,
        u.name as student_name,
        u.email as student_email
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.assignment_id
       JOIN students stu ON s.student_id = stu.student_id
       JOIN users u ON stu.user_id = u.user_id
       WHERE s.submission_id = ?`,
      [submissionId]
    );

    if (submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found.'
      });
    }

    const sub = submissions[0];

    // Authorization check: students can only see their own report
    if (req.user.role === 'student' && sub.student_id !== req.user.student_id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You may only view your own evaluation report.'
      });
    }

    // 2. Fetch evaluation details
    const evaluations = await db.query(
      'SELECT * FROM evaluations WHERE submission_id = ?',
      [submissionId]
    );
    const evaluation = evaluations.length > 0 ? evaluations[0] : null;

    // 3. Fetch test case results breakdown
    let testCaseResults = [];
    if (evaluation) {
      testCaseResults = await db.query(
        `SELECT tcr.*, tc.input_data, tc.expected_output, tc.marks as max_marks, tc.is_sample
         FROM test_case_results tcr
         JOIN test_cases tc ON tcr.test_case_id = tc.test_case_id
         WHERE tcr.evaluation_id = ?
         ORDER BY tc.test_case_id ASC`,
        [evaluation.evaluation_id]
      );
    }

    // 4. Fetch Plagiarism details and highest match
    const plagiarismMatches = await db.query(
      `SELECT 
        pr.similarity_score,
        pr.detection_status,
        pr.cluster_id,
        s2.original_filename as compared_filename,
        u2.name as compared_student_name,
        st2.register_number as compared_reg_no
       FROM plagiarism_results pr
       JOIN submissions s2 ON pr.compared_submission_id = s2.submission_id
       JOIN students st2 ON s2.student_id = st2.student_id
       JOIN users u2 ON st2.user_id = u2.user_id
       WHERE pr.submission_id = ?
       ORDER BY pr.similarity_score DESC`,
      [submissionId]
    );

    const highestSimilarity = plagiarismMatches.length > 0 ? plagiarismMatches[0].similarity_score : 0;
    const plagiarismStatus = highestSimilarity >= 60 ? 'HIGH_SIMILARITY' : (highestSimilarity >= 35 ? 'MODERATE_SIMILARITY' : 'LOW_SIMILARITY');

    // 5. Fetch Faculty Feedback
    const feedbackList = await db.query(
      `SELECT fb.*, u.name as faculty_name, u.email as faculty_email
       FROM feedback fb
       JOIN faculty f ON fb.faculty_id = f.faculty_id
       JOIN users u ON f.user_id = u.user_id
       WHERE fb.submission_id = ?`,
      [submissionId]
    );
    const facultyFeedback = feedbackList.length > 0 ? feedbackList[0] : null;

    // Assembled Report Structure matching Section 15
    const report = {
      reportId: `REP-${sub.submission_id}-${Date.now().toString().slice(-4)}`,
      student: {
        id: sub.student_id,
        name: sub.student_name,
        email: sub.student_email,
        registerNumber: sub.register_number,
        department: sub.student_department,
        year: sub.student_year
      },
      assignment: {
        id: sub.assignment_id,
        title: sub.assignment_title,
        description: sub.assignment_description,
        instructions: sub.assignment_instructions,
        programmingLanguage: sub.programming_language,
        deadline: sub.deadline,
        maxTestScore: sub.max_test_score,
        maxQualityScore: sub.max_quality_score
      },
      submission: {
        id: sub.submission_id,
        filename: sub.original_filename,
        submittedAt: sub.submitted_at,
        status: sub.submission_status
      },
      evaluation: evaluation ? {
        compilationStatus: evaluation.compilation_status,
        executionStatus: evaluation.execution_status,
        compilationOutput: evaluation.compilation_output,
        testCasesPassed: evaluation.test_cases_passed,
        testCasesFailed: evaluation.test_cases_failed,
        testScore: evaluation.test_score,
        otherScore: evaluation.other_score,
        plagiarismPenalty: evaluation.plagiarism_penalty,
        totalScore: evaluation.total_score,
        evaluatedAt: evaluation.evaluated_at
      } : null,
      testCaseResults,
      plagiarism: {
        highestSimilarity,
        status: plagiarismStatus,
        suspiciousMatches: plagiarismMatches.slice(0, 5) // Top suspicious matches
      },
      facultyFeedback: facultyFeedback ? {
        facultyName: facultyFeedback.faculty_name,
        comments: facultyFeedback.comments,
        givenAt: facultyFeedback.created_at
      } : null,
      generatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      report
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getReportBySubmissionId
};
