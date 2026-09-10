/**
 * Configurable Score Calculator
 * Computes Test Score, Plagiarism Penalty, and Final Score
 */

function calculateScore({
  testCaseResults = [],
  maxTestScore = 60,
  maxQualityScore = 40,
  manualQualityScore = null,
  highestSimilarityScore = 0
}) {
  // 1. Calculate raw test score from passing cases
  let earnedRawMarks = 0;
  let totalRawMarks = 0;

  testCaseResults.forEach(tc => {
    totalRawMarks += Number(tc.marks || tc.marksAwarded || 10);
    if (tc.status === 'PASS') {
      earnedRawMarks += Number(tc.marksAwarded || tc.marks || 10);
    }
  });

  // Scale test score to maxTestScore (e.g. 60)
  const testScore = totalRawMarks > 0 
    ? Number(((earnedRawMarks / totalRawMarks) * maxTestScore).toFixed(2))
    : 0;

  // 2. Plagiarism Penalty calculation
  let plagiarismPenalty = 0;
  if (highestSimilarityScore >= 75) {
    plagiarismPenalty = 20;
  } else if (highestSimilarityScore >= 60) {
    plagiarismPenalty = 10;
  } else if (highestSimilarityScore >= 40) {
    plagiarismPenalty = 5;
  }

  // 3. Other/Quality Score (defaults to proportional base if faculty hasn't set manual score)
  let otherScore = manualQualityScore !== null 
    ? Number(manualQualityScore) 
    : Number((maxQualityScore * (testScore / (maxTestScore || 1))).toFixed(2));

  // 4. Final Score calculation
  const calculatedTotal = Math.max(0, Math.min(100, testScore + otherScore - plagiarismPenalty));
  const totalScore = Number(calculatedTotal.toFixed(2));

  return {
    testScore,
    otherScore,
    plagiarismPenalty,
    totalScore,
    passedCount: testCaseResults.filter(r => r.status === 'PASS').length,
    failedCount: testCaseResults.filter(r => r.status !== 'PASS').length
  };
}

module.exports = {
  calculateScore
};
