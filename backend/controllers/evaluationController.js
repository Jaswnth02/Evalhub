const db = require('../config/db');
const { evaluateSubmissionById } = require('../services/evaluation/evaluator');

// Trigger Automated Evaluation for a submission
async function triggerEvaluation(req, res, next) {
  try {
    const submissionId = req.params.submissionId;

    const subs = await db.query('SELECT * FROM submissions WHERE submission_id = ?', [submissionId]);
    if (subs.length === 0) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    const result = await evaluateSubmissionById(submissionId);

    res.json({
      success: true,
      message: 'Automated evaluation completed successfully.',
      evaluation: result
    });
  } catch (err) {
    next(err);
  }
}

// Get Evaluation Details
async function getEvaluation(req, res, next) {
  try {
    const submissionId = req.params.submissionId;

    const evaluations = await db.query(
      `SELECT e.*, s.status as submission_status, s.assignment_id, s.student_id
       FROM evaluations e
       JOIN submissions s ON e.submission_id = s.submission_id
       WHERE e.submission_id = ?`,
      [submissionId]
    );

    if (evaluations.length === 0) {
      return res.status(404).json({ success: false, message: 'Evaluation not found for this submission.' });
    }

    const evaluation = evaluations[0];

    const testCaseResults = await db.query(
      `SELECT tcr.*, tc.input_data, tc.expected_output, tc.marks as max_marks, tc.is_sample
       FROM test_case_results tcr
       JOIN test_cases tc ON tcr.test_case_id = tc.test_case_id
       WHERE tcr.evaluation_id = ?
       ORDER BY tc.test_case_id ASC`,
      [evaluation.evaluation_id]
    );

    res.json({
      success: true,
      evaluation: {
        ...evaluation,
        testCaseResults
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  triggerEvaluation,
  getEvaluation
};
