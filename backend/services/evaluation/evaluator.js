const fs = require('fs');
const path = require('path');
const db = require('../../config/db');
const { executeSubmission } = require('../execution/runner');
const { compareCodes } = require('../plagiarism/similarity');
const { runDBSCAN } = require('../plagiarism/clustering');
const { calculateScore } = require('./scoreCalculator');

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');

/**
 * Evaluates a single submission end-to-end
 */
async function evaluateSubmissionById(submissionId) {
  // 1. Fetch submission details
  const submissions = await db.query(
    `SELECT s.*, a.programming_language, a.max_test_score, a.max_quality_score, a.title as assignment_title
     FROM submissions s
     JOIN assignments a ON s.assignment_id = a.assignment_id
     WHERE s.submission_id = ?`,
    [submissionId]
  );

  if (!submissions || submissions.length === 0) {
    throw new Error(`Submission ID ${submissionId} not found.`);
  }

  const submission = submissions[0];

  // Update status to 'evaluating'
  await db.execute('UPDATE submissions SET status = ? WHERE submission_id = ?', ['evaluating', submissionId]);

  // Read file content
  const filePath = path.join(UPLOADS_DIR, submission.file_path);
  if (!fs.existsSync(filePath)) {
    await db.execute('UPDATE submissions SET status = ? WHERE submission_id = ?', ['error', submissionId]);
    throw new Error(`Uploaded file not found on disk: ${submission.file_path}`);
  }

  const codeContent = fs.readFileSync(filePath, 'utf8');

  // 2. Fetch test cases for this assignment
  const testCases = await db.query(
    'SELECT * FROM test_cases WHERE assignment_id = ? ORDER BY test_case_id ASC',
    [submission.assignment_id]
  );

  // 3. Run Execution Sandbox
  const executionResult = await executeSubmission({
    codeContent,
    language: submission.programming_language,
    testCases
  });

  // 4. Plagiarism Comparison against all other submissions of the same assignment
  const otherSubmissions = await db.query(
    `SELECT submission_id, file_path FROM submissions 
     WHERE assignment_id = ? AND submission_id != ?`,
    [submission.assignment_id, submissionId]
  );

  let highestSimilarity = 0;

  // Clear previous plagiarism records for this submission
  await db.execute('DELETE FROM plagiarism_results WHERE submission_id = ?', [submissionId]);

  for (const other of otherSubmissions) {
    const otherPath = path.join(UPLOADS_DIR, other.file_path);
    if (fs.existsSync(otherPath)) {
      const otherCode = fs.readFileSync(otherPath, 'utf8');
      const comp = compareCodes(codeContent, otherCode, submission.programming_language);

      if (comp.similarityScore > highestSimilarity) {
        highestSimilarity = comp.similarityScore;
      }

      await db.execute(
        `INSERT INTO plagiarism_results (submission_id, compared_submission_id, similarity_score, detection_status)
         VALUES (?, ?, ?, ?)`,
        [submissionId, other.submission_id, comp.similarityScore, comp.detectionStatus]
      );
    }
  }

  // 5. Calculate Final Score
  const scoreResult = calculateScore({
    testCaseResults: executionResult.testCaseResults,
    maxTestScore: submission.max_test_score || 60,
    maxQualityScore: submission.max_quality_score || 40,
    highestSimilarityScore: highestSimilarity
  });

  // 6. Save or Update evaluations table
  // Check if evaluation record already exists
  const existingEval = await db.query('SELECT evaluation_id FROM evaluations WHERE submission_id = ?', [submissionId]);
  let evaluationId;

  if (existingEval.length > 0) {
    evaluationId = existingEval[0].evaluation_id;
    await db.execute(
      `UPDATE evaluations 
       SET compilation_status = ?, execution_status = ?, test_cases_passed = ?, test_cases_failed = ?,
           test_score = ?, other_score = ?, plagiarism_penalty = ?, total_score = ?, compilation_output = ?, evaluated_at = CURRENT_TIMESTAMP
       WHERE evaluation_id = ?`,
      [
        executionResult.compilationStatus,
        executionResult.executionStatus,
        scoreResult.passedCount,
        scoreResult.failedCount,
        scoreResult.testScore,
        scoreResult.otherScore,
        scoreResult.plagiarismPenalty,
        scoreResult.totalScore,
        executionResult.compilationOutput,
        evaluationId
      ]
    );

    // Remove old test_case_results to refresh
    await db.execute('DELETE FROM test_case_results WHERE evaluation_id = ?', [evaluationId]);
  } else {
    const newEval = await db.execute(
      `INSERT INTO evaluations 
       (submission_id, compilation_status, execution_status, test_cases_passed, test_cases_failed,
        test_score, other_score, plagiarism_penalty, total_score, compilation_output)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        submissionId,
        executionResult.compilationStatus,
        executionResult.executionStatus,
        scoreResult.passedCount,
        scoreResult.failedCount,
        scoreResult.testScore,
        scoreResult.otherScore,
        scoreResult.plagiarismPenalty,
        scoreResult.totalScore,
        executionResult.compilationOutput
      ]
    );
    evaluationId = newEval.insertId;
  }

  // Insert individual test_case_results
  for (const tcRes of executionResult.testCaseResults) {
    await db.execute(
      `INSERT INTO test_case_results (evaluation_id, test_case_id, actual_output, status, marks_awarded, execution_time_ms)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        evaluationId,
        tcRes.testCaseId,
        tcRes.actualOutput || tcRes.errorMessage || '',
        tcRes.status,
        tcRes.marksAwarded,
        tcRes.executionTimeMs || 0
      ]
    );
  }

  // 7. Generate or Update Report
  const existingReport = await db.query('SELECT report_id, feedback FROM reports WHERE submission_id = ?', [submissionId]);
  const defaultFeedback = highestSimilarity >= 60 
    ? 'High similarity detected with other submissions. Please review code originality with faculty.' 
    : 'Automated evaluation completed successfully.';

  if (existingReport.length > 0) {
    await db.execute(
      `UPDATE reports 
       SET plagiarism_score = ?, test_score = ?, total_score = ?, generated_at = CURRENT_TIMESTAMP
       WHERE submission_id = ?`,
      [highestSimilarity, scoreResult.testScore, scoreResult.totalScore, submissionId]
    );
  } else {
    await db.execute(
      `INSERT INTO reports (submission_id, plagiarism_score, test_score, total_score, feedback)
       VALUES (?, ?, ?, ?, ?)`,
      [submissionId, highestSimilarity, scoreResult.testScore, scoreResult.totalScore, defaultFeedback]
    );
  }

  // Update submission status to 'evaluated'
  await db.execute('UPDATE submissions SET status = ? WHERE submission_id = ?', ['evaluated', submissionId]);

  // 8. Run DBSCAN clustering update for the entire assignment
  await updateAssignmentClusters(submission.assignment_id);

  return {
    submissionId,
    compilationStatus: executionResult.compilationStatus,
    executionStatus: executionResult.executionStatus,
    testCasesPassed: scoreResult.passedCount,
    testCasesFailed: scoreResult.failedCount,
    testScore: scoreResult.testScore,
    otherScore: scoreResult.otherScore,
    plagiarismPenalty: scoreResult.plagiarismPenalty,
    totalScore: scoreResult.totalScore,
    highestSimilarity
  };
}

/**
 * Runs DBSCAN clustering on all submissions of an assignment and updates cluster_id
 */
async function updateAssignmentClusters(assignmentId) {
  const allSubs = await db.query(
    'SELECT submission_id, file_path FROM submissions WHERE assignment_id = ?',
    [assignmentId]
  );

  if (allSubs.length < 2) return;

  const subIds = allSubs.map(s => s.submission_id);
  const codeMap = {};

  for (const s of allSubs) {
    const fPath = path.join(UPLOADS_DIR, s.file_path);
    codeMap[s.submission_id] = fs.existsSync(fPath) ? fs.readFileSync(fPath, 'utf8') : '';
  }

  // Build distance matrix
  const distanceMatrix = {};
  for (const idA of subIds) {
    distanceMatrix[idA] = {};
    for (const idB of subIds) {
      if (idA === idB) {
        distanceMatrix[idA][idB] = 0.0;
      } else {
        const comp = compareCodes(codeMap[idA], codeMap[idB]);
        const dist = Number((1.0 - (comp.similarityScore / 100)).toFixed(4));
        distanceMatrix[idA][idB] = dist;
      }
    }
  }

  // Run DBSCAN (eps = 0.40 -> similarity >= 60%, minPts = 2)
  const dbscanResult = runDBSCAN(subIds, distanceMatrix, 0.40, 2);

  // Update cluster_id in plagiarism_results
  for (const cluster of dbscanResult.clusters) {
    for (const memberId of cluster.memberSubmissionIds) {
      await db.execute(
        'UPDATE plagiarism_results SET cluster_id = ? WHERE submission_id = ?',
        [cluster.clusterId, memberId]
      );
    }
  }

  return dbscanResult;
}

module.exports = {
  evaluateSubmissionById,
  updateAssignmentClusters
};
