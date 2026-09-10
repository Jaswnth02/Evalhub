const fs = require('fs');
const path = require('path');
const { spawn, execFile } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const TEMP_BASE_DIR = path.join(__dirname, '..', '..', 'temp_execution');
if (!fs.existsSync(TEMP_BASE_DIR)) {
  fs.mkdirSync(TEMP_BASE_DIR, { recursive: true });
}

const DEFAULT_TIMEOUT_MS = Number(process.env.EXECUTION_TIMEOUT_MS) || 5000;
const MAX_OUTPUT_CHARS = Number(process.env.MAX_OUTPUT_CHARS) || 10000;

/**
 * Execute command with strict timeout and input feeding
 */
function runCommand(command, args, options = {}, stdinInput = '') {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isTimedOut = false;

    const child = spawn(command, args, {
      cwd: options.cwd,
      env: { PATH: process.env.PATH }, // Clean minimal environment without sensitive app secrets
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const timer = setTimeout(() => {
      isTimedOut = true;
      try {
        child.kill('SIGKILL');
      } catch (e) {}
      resolve({
        success: false,
        status: 'TIMEOUT',
        stdout: stdout.slice(0, MAX_OUTPUT_CHARS),
        stderr: 'Execution timed out. Exceeded time limit.',
        executionTimeMs: Date.now() - startTime
      });
    }, options.timeout || DEFAULT_TIMEOUT_MS);

    if (stdinInput) {
      child.stdin.write(stdinInput);
    }
    child.stdin.end();

    child.stdout.on('data', (data) => {
      if (stdout.length < MAX_OUTPUT_CHARS) {
        stdout += data.toString();
      }
    });

    child.stderr.on('data', (data) => {
      if (stderr.length < MAX_OUTPUT_CHARS) {
        stderr += data.toString();
      }
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        success: false,
        status: 'ERROR',
        stdout: stdout.slice(0, MAX_OUTPUT_CHARS),
        stderr: err.message,
        executionTimeMs: Date.now() - startTime
      });
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (isTimedOut) return;

      const duration = Date.now() - startTime;
      if (code === 0) {
        resolve({
          success: true,
          status: 'SUCCESS',
          stdout: stdout.slice(0, MAX_OUTPUT_CHARS),
          stderr: stderr.slice(0, MAX_OUTPUT_CHARS),
          executionTimeMs: duration
        });
      } else {
        resolve({
          success: false,
          status: 'RUNTIME_ERROR',
          stdout: stdout.slice(0, MAX_OUTPUT_CHARS),
          stderr: stderr.slice(0, MAX_OUTPUT_CHARS) || `Process exited with code ${code}`,
          executionTimeMs: duration
        });
      }
    });
  });
}

/**
 * Prepares compilation and runs test cases in an isolated environment
 */
async function executeSubmission({ codeContent, language, testCases }) {
  const runId = `run_${Date.now()}_${uuidv4().substring(0, 8)}`;
  const runDir = path.join(TEMP_BASE_DIR, runId);
  fs.mkdirSync(runDir, { recursive: true });

  const lang = (language || 'python').toLowerCase();

  try {
    let sourceFileName = 'solution.py';
    let compileCmd = null;
    let compileArgs = [];
    let executeCmd = 'python3';
    let executeArgs = ['-u', 'solution.py'];

    if (lang === 'python' || lang === 'py') {
      sourceFileName = 'solution.py';
      executeCmd = 'python3';
      executeArgs = ['-u', 'solution.py'];
    } else if (lang === 'cpp' || lang === 'c++') {
      sourceFileName = 'main.cpp';
      compileCmd = 'g++';
      compileArgs = ['-O2', '-std=c++17', '-o', 'solution', 'main.cpp'];
      executeCmd = path.join(runDir, 'solution');
      executeArgs = [];
    } else if (lang === 'c') {
      sourceFileName = 'main.c';
      compileCmd = 'gcc';
      compileArgs = ['-O2', '-o', 'solution', 'main.c'];
      executeCmd = path.join(runDir, 'solution');
      executeArgs = [];
    } else if (lang === 'java') {
      // Find class name or default to Solution
      const classMatch = codeContent.match(/public\s+class\s+([A-Za-z0-9_]+)/);
      const className = classMatch ? classMatch[1] : 'Solution';
      sourceFileName = `${className}.java`;
      compileCmd = 'javac';
      compileArgs = [sourceFileName];
      executeCmd = 'java';
      executeArgs = ['-Xmx128m', className];
    } else if (lang === 'javascript' || lang === 'js') {
      sourceFileName = 'solution.js';
      executeCmd = 'node';
      executeArgs = ['--max-old-space-size=64', 'solution.js'];
    }

    // Write source file to isolated dir
    const sourceFilePath = path.join(runDir, sourceFileName);
    fs.writeFileSync(sourceFilePath, codeContent);

    // 1. Compilation Phase (if required)
    if (compileCmd) {
      const compileResult = await runCommand(compileCmd, compileArgs, { cwd: runDir, timeout: 8000 });
      if (!compileResult.success) {
        return {
          compilationStatus: 'COMPILATION_ERROR',
          executionStatus: 'NOT_RUN',
          compilationOutput: compileResult.stderr || compileResult.stdout || 'Compilation failed.',
          testCaseResults: testCases.map(tc => ({
            testCaseId: tc.test_case_id,
            actualOutput: '',
            status: 'ERROR',
            marksAwarded: 0,
            executionTimeMs: 0
          }))
        };
      }
    }

    // 2. Test Cases Execution Phase
    const results = [];
    let overallExecutionStatus = 'SUCCESS';

    for (const tc of testCases) {
      const inputStr = (tc.input_data || '').trimEnd() + '\n';
      const execRes = await runCommand(executeCmd, executeArgs, { cwd: runDir, timeout: DEFAULT_TIMEOUT_MS }, inputStr);

      const actualTrimmed = (execRes.stdout || '').trim();
      const expectedTrimmed = (tc.expected_output || '').trim();

      let tcStatus = 'FAIL';
      let marksAwarded = 0;

      if (!execRes.success) {
        tcStatus = execRes.status === 'TIMEOUT' ? 'TIMEOUT' : 'ERROR';
        overallExecutionStatus = tcStatus;
      } else if (actualTrimmed === expectedTrimmed) {
        tcStatus = 'PASS';
        marksAwarded = Number(tc.marks) || 0;
      } else {
        tcStatus = 'FAIL';
        if (overallExecutionStatus === 'SUCCESS') {
          overallExecutionStatus = 'PARTIAL_FAIL';
        }
      }

      results.push({
        testCaseId: tc.test_case_id,
        inputData: tc.input_data,
        expectedOutput: tc.expected_output,
        actualOutput: execRes.stdout.trim(),
        errorMessage: execRes.stderr.trim(),
        status: tcStatus,
        marksAwarded,
        executionTimeMs: execRes.executionTimeMs
      });
    }

    return {
      compilationStatus: 'SUCCESS',
      executionStatus: overallExecutionStatus,
      compilationOutput: 'Code compiled and executed cleanly.',
      testCaseResults: results
    };

  } finally {
    // 3. Clean up sandbox folder safely
    try {
      if (fs.existsSync(runDir)) {
        fs.rmSync(runDir, { recursive: true, force: true });
      }
    } catch (cleanErr) {
      console.warn(`Failed to remove sandbox ${runDir}: ${cleanErr.message}`);
    }
  }
}

module.exports = {
  executeSubmission
};
