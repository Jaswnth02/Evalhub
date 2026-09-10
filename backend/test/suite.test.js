const assert = require('assert');
const { preprocessCode } = require('../services/plagiarism/preprocessor');
const { tokenizeCode } = require('../services/plagiarism/tokenizer');
const { compareCodes } = require('../services/plagiarism/similarity');
const { runDBSCAN } = require('../services/plagiarism/clustering');
const { executeSubmission } = require('../services/execution/runner');

async function runTests() {
  console.log('🧪 Running EvalHub Unit & Integration Tests...');

  // Test 1: Preprocessor & Tokenizer
  console.log('1. Testing Preprocessor & Tokenizer...');
  const pyCode1 = `
    # Calculate sum
    def add_numbers(a, b):
        return a + b
  `;
  const pyCode2 = `
    # Different comments and variable names
    def compute_sum(first_val, second_val):
        return first_val + second_val
  `;

  const tokens1 = tokenizeCode(preprocessCode(pyCode1, 'python'));
  const tokens2 = tokenizeCode(preprocessCode(pyCode2, 'python'));

  console.log('   Tokens 1:', tokens1.join(' '));
  console.log('   Tokens 2:', tokens2.join(' '));

  // The normalized tokens should be structurally identical because variable names map to ID_1, ID_2
  assert.strictEqual(tokens1.join(' '), tokens2.join(' '), 'Normalized token streams should match for isomorphic code.');
  console.log('   ✅ Tokenizer correctly normalized renamed variables and stripped comments.');

  // Test 2: Similarity Analysis
  console.log('2. Testing Plagiarism Similarity Score...');
  const comp = compareCodes(pyCode1, pyCode2, 'python');
  console.log(`   Computed Similarity: ${comp.similarityScore}%, Status: ${comp.detectionStatus}`);
  assert.ok(comp.similarityScore > 85.0, 'Similarity should be > 85% for isomorphic code');
  console.log('   ✅ Similarity engine accurately detected high similarity.');

  // Test 3: DBSCAN Density-Based Clustering
  console.log('3. Testing DBSCAN Clustering...');
  const subIds = [101, 102, 103, 104];
  const distMatrix = {
    101: { 101: 0.0, 102: 0.10, 103: 0.12, 104: 0.90 },
    102: { 101: 0.10, 102: 0.0, 103: 0.15, 104: 0.88 },
    103: { 101: 0.12, 102: 0.15, 103: 0.0, 104: 0.92 },
    104: { 101: 0.90, 102: 0.88, 103: 0.92, 104: 0.0 }
  };

  const clusters = runDBSCAN(subIds, distMatrix, 0.40, 2);
  console.log('   Clusters found:', clusters.clusters.length);
  console.log('   Cluster 1 members:', clusters.clusters[0].memberSubmissionIds);
  console.log('   Outliers:', clusters.outliers);

  assert.strictEqual(clusters.clusters.length, 1);
  assert.deepStrictEqual(clusters.clusters[0].memberSubmissionIds.sort(), [101, 102, 103]);
  assert.deepStrictEqual(clusters.outliers, [104]);
  console.log('   ✅ DBSCAN correctly grouped the collusion cluster and isolated the original submission.');

  // Test 4: Sandboxed Code Execution
  console.log('4. Testing Sandboxed Code Execution Runner...');
  const testCode = `
import sys
val = sys.stdin.read().strip()
print('PROCESSED_' + val.upper())
`;
  const execResult = await executeSubmission({
    codeContent: testCode,
    language: 'python',
    testCases: [
      { test_case_id: 1, input_data: 'hello', expected_output: 'PROCESSED_HELLO', marks: 10 },
      { test_case_id: 2, input_data: 'world', expected_output: 'PROCESSED_WORLD', marks: 10 },
      { test_case_id: 3, input_data: 'fail_me', expected_output: 'PROCESSED_OTHER', marks: 10 }
    ]
  });

  console.log('   Compilation:', execResult.compilationStatus);
  console.log('   Test Cases Passed:', execResult.testCaseResults.filter(r => r.status === 'PASS').length);
  console.log('   Test Cases Failed:', execResult.testCaseResults.filter(r => r.status === 'FAIL').length);

  assert.strictEqual(execResult.compilationStatus, 'SUCCESS');
  assert.strictEqual(execResult.testCaseResults[0].status, 'PASS');
  assert.strictEqual(execResult.testCaseResults[1].status, 'PASS');
  assert.strictEqual(execResult.testCaseResults[2].status, 'FAIL');
  console.log('   ✅ Sandboxed code execution and test case evaluation passed flawlessly.');

  console.log('\n🎉 ALL BACKEND UNIT AND INTEGRATION TESTS PASSED!');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
