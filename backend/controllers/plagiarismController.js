const fs = require('fs');
const path = require('path');
const db = require('../config/db');
const { compareCodes } = require('../services/plagiarism/similarity');
const { runDBSCAN } = require('../services/plagiarism/clustering');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Get Plagiarism results for single submission
async function getPlagiarismBySubmission(req, res, next) {
  try {
    const submissionId = req.params.submissionId;

    const results = await db.query(
      `SELECT 
        pr.*,
        s2.original_filename as compared_filename,
        u2.name as compared_student_name,
        st2.register_number as compared_reg_no,
        st2.department as compared_dept
       FROM plagiarism_results pr
       JOIN submissions s2 ON pr.compared_submission_id = s2.submission_id
       JOIN students st2 ON s2.student_id = st2.student_id
       JOIN users u2 ON st2.user_id = u2.user_id
       WHERE pr.submission_id = ?
       ORDER BY pr.similarity_score DESC`,
      [submissionId]
    );

    const highest = results.length > 0 ? results[0].similarity_score : 0;
    const detectionStatus = highest >= 60 ? 'HIGH_SIMILARITY' : (highest >= 35 ? 'MODERATE_SIMILARITY' : 'LOW_SIMILARITY');

    res.json({
      success: true,
      submissionId,
      highestSimilarity: highest,
      detectionStatus,
      matches: results
    });
  } catch (err) {
    next(err);
  }
}

// Assignment Plagiarism Overview (Pairwise Matrix & DBSCAN Clusters)
async function getAssignmentPlagiarismHub(req, res, next) {
  try {
    const assignmentId = req.params.assignmentId;

    // Fetch all submissions for this assignment
    const submissions = await db.query(
      `SELECT 
        s.submission_id,
        s.original_filename,
        s.file_path,
        s.submitted_at,
        u.name as student_name,
        st.register_number,
        st.department
       FROM submissions s
       JOIN students st ON s.student_id = st.student_id
       JOIN users u ON st.user_id = u.user_id
       WHERE s.assignment_id = ?
       ORDER BY s.submission_id ASC`,
      [assignmentId]
    );

    if (submissions.length === 0) {
      return res.json({
        success: true,
        assignmentId,
        submissions: [],
        matrix: [],
        clusters: [],
        outliers: []
      });
    }

    // Read all codes
    const codeMap = {};
    for (const sub of submissions) {
      const fPath = path.join(UPLOADS_DIR, sub.file_path);
      codeMap[sub.submission_id] = fs.existsSync(fPath) ? fs.readFileSync(fPath, 'utf8') : '';
    }

    // Build pairwise matrix
    const matrix = [];
    const distanceMatrix = {};
    const subIds = submissions.map(s => s.submission_id);

    for (let i = 0; i < submissions.length; i++) {
      const row = {
        submissionId: submissions[i].submission_id,
        studentName: submissions[i].student_name,
        registerNumber: submissions[i].register_number,
        scores: {}
      };
      distanceMatrix[submissions[i].submission_id] = {};

      for (let j = 0; j < submissions.length; j++) {
        const idA = submissions[i].submission_id;
        const idB = submissions[j].submission_id;

        if (idA === idB) {
          row.scores[idB] = 100.0;
          distanceMatrix[idA][idB] = 0.0;
        } else {
          const comp = compareCodes(codeMap[idA], codeMap[idB]);
          row.scores[idB] = comp.similarityScore;
          distanceMatrix[idA][idB] = Number((1.0 - (comp.similarityScore / 100)).toFixed(4));
        }
      }
      matrix.push(row);
    }

    // Run DBSCAN clustering (epsilon = 0.40 -> similarity >= 60%, minPts = 2)
    const dbscan = runDBSCAN(subIds, distanceMatrix, 0.40, 2);

    // Enrich clusters with student names
    const enrichedClusters = dbscan.clusters.map(cl => {
      const members = cl.memberSubmissionIds.map(subId => {
        const s = submissions.find(x => x.submission_id === subId);
        return {
          submissionId: subId,
          studentName: s ? s.student_name : 'Unknown',
          registerNumber: s ? s.register_number : 'Unknown'
        };
      });

      return {
        ...cl,
        members
      };
    });

    const enrichedOutliers = dbscan.outliers.map(subId => {
      const s = submissions.find(x => x.submission_id === subId);
      return {
        submissionId: subId,
        studentName: s ? s.student_name : 'Unknown',
        registerNumber: s ? s.register_number : 'Unknown'
      };
    });

    res.json({
      success: true,
      assignmentId,
      submissions: submissions.map(s => ({
        submissionId: s.submission_id,
        studentName: s.student_name,
        registerNumber: s.register_number,
        filename: s.original_filename
      })),
      matrix,
      clusters: enrichedClusters,
      outliers: enrichedOutliers,
      parameters: dbscan.parameters
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPlagiarismBySubmission,
  getAssignmentPlagiarismHub
};
