const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../config/db');

async function initializeDatabase() {
  console.log('🚀 Initializing Automated Student Project Evaluation Hub Database...');
  await db.initDatabase();

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  try {
    await db.exec(schemaSql);
    console.log('✅ Schema tables verified and ready.');
  } catch (err) {
    console.warn(`Notice during schema creation: ${err.message}`);
  }

  // Check if users already exist
  const existingUsers = await db.query('SELECT COUNT(*) as count FROM users');
  const userCount = existingUsers[0] ? (existingUsers[0].count || existingUsers[0]['COUNT(*)']) : 0;

  if (Number(userCount) > 0) {
    console.log(`ℹ️ Database already contains ${userCount} users. Skipping seed.`);
    return;
  }

  console.log('🌱 Seeding default users, faculty, students, assignments, and test cases...');

  const pwHashAdmin = await bcrypt.hash('admin123', 10);
  const pwHashFaculty = await bcrypt.hash('faculty123', 10);
  const pwHashStudent = await bcrypt.hash('student123', 10);

  // 1. Insert Users
  // Admin
  const adminRes = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['System Administrator', 'admin@evalhub.edu', pwHashAdmin, 'admin']
  );

  // Faculty 1
  const f1Res = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Prof. Alan Turing', 'prof.alan@evalhub.edu', pwHashFaculty, 'faculty']
  );
  const fac1 = await db.execute(
    'INSERT INTO faculty (user_id, department) VALUES (?, ?)',
    [f1Res.insertId, 'Computer Science and Engineering']
  );

  // Faculty 2
  const f2Res = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Dr. Grace Hopper', 'prof.grace@evalhub.edu', pwHashFaculty, 'faculty']
  );
  const fac2 = await db.execute(
    'INSERT INTO faculty (user_id, department) VALUES (?, ?)',
    [f2Res.insertId, 'Software Engineering']
  );

  // Student 1 (John)
  const s1Res = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['John Doe', 'student.john@evalhub.edu', pwHashStudent, 'student']
  );
  const stu1 = await db.execute(
    'INSERT INTO students (user_id, register_number, department, year) VALUES (?, ?, ?, ?)',
    [s1Res.insertId, 'REG2026CS101', 'Computer Science and Engineering', 3]
  );

  // Student 2 (Jane)
  const s2Res = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Jane Smith', 'student.jane@evalhub.edu', pwHashStudent, 'student']
  );
  const stu2 = await db.execute(
    'INSERT INTO students (user_id, register_number, department, year) VALUES (?, ?, ?, ?)',
    [s2Res.insertId, 'REG2026CS102', 'Computer Science and Engineering', 3]
  );

  // Student 3 (Alex)
  const s3Res = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Alex Johnson', 'student.alex@evalhub.edu', pwHashStudent, 'student']
  );
  const stu3 = await db.execute(
    'INSERT INTO students (user_id, register_number, department, year) VALUES (?, ?, ?, ?)',
    [s3Res.insertId, 'REG2026CS103', 'Computer Science and Engineering', 3]
  );

  // Student 4 (Emma)
  const s4Res = await db.execute(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    ['Emma Watson', 'student.emma@evalhub.edu', pwHashStudent, 'student']
  );
  const stu4 = await db.execute(
    'INSERT INTO students (user_id, register_number, department, year) VALUES (?, ?, ?, ?)',
    [s4Res.insertId, 'REG2026IT204', 'Information Technology', 2]
  );

  // 2. Insert Assignments
  // Assignment 1: Python String & Math Checker
  const a1Res = await db.execute(
    `INSERT INTO assignments (title, description, instructions, programming_language, deadline, faculty_id, max_test_score, max_quality_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'Python Palindrome & Prime Validator',
      'Implement an automated string and number validator in Python that processes standard input tokens.',
      'Input format:\nLine 1: Command (PALINDROME or PRIME)\nLine 2: Target value\n\nOutput format:\nFor PALINDROME: "VALID_PALINDROME" or "NOT_PALINDROME"\nFor PRIME: "IS_PRIME" or "NOT_PRIME"',
      'python',
      '2026-12-31 23:59:59',
      fac1.insertId,
      60.00,
      40.00
    ]
  );
  const assign1Id = a1Res.insertId;

  // Test Cases for Assignment 1
  const testCasesA1 = [
    { input: 'PALINDROME\nracecar', expected: 'VALID_PALINDROME', marks: 15, isSample: 1 },
    { input: 'PALINDROME\nevaluationhub', expected: 'NOT_PALINDROME', marks: 15, isSample: 1 },
    { input: 'PRIME\n29', expected: 'IS_PRIME', marks: 15, isSample: 0 },
    { input: 'PRIME\n15', expected: 'NOT_PRIME', marks: 15, isSample: 0 }
  ];

  for (const tc of testCasesA1) {
    await db.execute(
      'INSERT INTO test_cases (assignment_id, input_data, expected_output, marks, is_sample) VALUES (?, ?, ?, ?, ?)',
      [assign1Id, tc.input, tc.expected, tc.marks, tc.isSample]
    );
  }

  // Assignment 2: C++ Two Sum Solver
  const a2Res = await db.execute(
    `INSERT INTO assignments (title, description, instructions, programming_language, deadline, faculty_id, max_test_score, max_quality_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'C++ Array Target Sum Evaluator',
      'Write a high-performance C++ solution to determine if any two numbers in an array sum to a target integer K.',
      'Input format:\nN (number of elements)\nN integers separated by spaces\nTarget sum K\n\nOutput format: "FOUND" or "NOT_FOUND"',
      'cpp',
      '2026-11-30 23:59:59',
      fac2.insertId,
      60.00,
      40.00
    ]
  );
  const assign2Id = a2Res.insertId;

  const testCasesA2 = [
    { input: '5\n10 15 3 7 2\n17', expected: 'FOUND', marks: 20, isSample: 1 },
    { input: '4\n1 2 3 9\n8', expected: 'NOT_FOUND', marks: 20, isSample: 1 },
    { input: '6\n-5 0 8 12 14 3\n7', expected: 'FOUND', marks: 20, isSample: 0 }
  ];

  for (const tc of testCasesA2) {
    await db.execute(
      'INSERT INTO test_cases (assignment_id, input_data, expected_output, marks, is_sample) VALUES (?, ?, ?, ?, ?)',
      [assign2Id, tc.input, tc.expected, tc.marks, tc.isSample]
    );
  }

  // 3. Create Sample Submissions & Files
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Submission 1 (John - Original Python Solution)
  const codeJohn = `import sys

def check_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

def check_prime(n):
    if n <= 1:
        return False
    for i in range(2, int(n**0.5) + 1):
        if n % i == 0:
            return False
    return True

def main():
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        return
    cmd = lines[0].strip()
    val = lines[1].strip() if len(lines) > 1 else ''

    if cmd == 'PALINDROME':
        if check_palindrome(val):
            print('VALID_PALINDROME')
        else:
            print('NOT_PALINDROME')
    elif cmd == 'PRIME':
        try:
            num = int(val)
            if check_prime(num):
                print('IS_PRIME')
            else:
                print('NOT_PRIME')
        except ValueError:
            print('NOT_PRIME')

if __name__ == '__main__':
    main()
`;
  const fileJohn = 'sub_john_palindrome.py';
  fs.writeFileSync(path.join(uploadsDir, fileJohn), codeJohn);

  const sub1 = await db.execute(
    'INSERT INTO submissions (assignment_id, student_id, file_path, original_filename, status) VALUES (?, ?, ?, ?, ?)',
    [assign1Id, stu1.insertId, fileJohn, 'palindrome_validator.py', 'evaluated']
  );

  // Submission 2 (Jane - Plagiarized Variant of John with renamed variables and comments)
  const codeJane = `# Student Project Submission: Jane Smith
import sys

def verify_is_palindrome(text_input):
    # Filter text and check reversed string
    filtered_text = ''.join(ch.lower() for ch in text_input if ch.isalnum())
    return filtered_text == filtered_text[::-1]

def verify_is_prime(target_val):
    # Prime verification algorithm
    if target_val <= 1:
        return False
    limit = int(target_val**0.5) + 1
    for factor in range(2, limit):
        if target_val % factor == 0:
            return False
    return True

def run():
    input_data = sys.stdin.read().strip().splitlines()
    if len(input_data) == 0:
        return
    instruction = input_data[0].strip()
    argument = input_data[1].strip() if len(input_data) > 1 else ''

    if instruction == 'PALINDROME':
        if verify_is_palindrome(argument):
            print('VALID_PALINDROME')
        else:
            print('NOT_PALINDROME')
    elif instruction == 'PRIME':
        try:
            n = int(argument)
            if verify_is_prime(n):
                print('IS_PRIME')
            else:
                print('NOT_PRIME')
        except ValueError:
            print('NOT_PRIME')

if __name__ == '__main__':
    run()
`;
  const fileJane = 'sub_jane_palindrome.py';
  fs.writeFileSync(path.join(uploadsDir, fileJane), codeJane);

  const sub2 = await db.execute(
    'INSERT INTO submissions (assignment_id, student_id, file_path, original_filename, status) VALUES (?, ?, ?, ?, ?)',
    [assign1Id, stu2.insertId, fileJane, 'my_solution.py', 'evaluated']
  );

  // Submission 3 (Alex - Another similar submission to form a DBSCAN cluster)
  const codeAlex = `import sys

def test_pal(word):
    norm = ''.join(c.lower() for c in word if c.isalnum())
    return norm == norm[::-1]

def test_pr(x):
    if x <= 1:
        return False
    for d in range(2, int(x**0.5) + 1):
        if x % d == 0:
            return False
    return True

def execute_solver():
    raw = sys.stdin.read().strip().splitlines()
    if not raw:
        return
    mode = raw[0].strip()
    data = raw[1].strip() if len(raw) > 1 else ''
    if mode == 'PALINDROME':
        print('VALID_PALINDROME' if test_pal(data) else 'NOT_PALINDROME')
    elif mode == 'PRIME':
        val = int(data) if data.isdigit() else 0
        print('IS_PRIME' if test_pr(val) else 'NOT_PRIME')

if __name__ == '__main__':
    execute_solver()
`;
  const fileAlex = 'sub_alex_palindrome.py';
  fs.writeFileSync(path.join(uploadsDir, fileAlex), codeAlex);

  const sub3 = await db.execute(
    'INSERT INTO submissions (assignment_id, student_id, file_path, original_filename, status) VALUES (?, ?, ?, ?, ?)',
    [assign1Id, stu3.insertId, fileAlex, 'checker.py', 'evaluated']
  );

  // Submission 4 (Emma - Syntax error to show error handling)
  const codeEmma = `import sys
def broken():
    print('Broken code
if __name__ == '__main__':
    broken()
`;
  const fileEmma = 'sub_emma_syntax_error.py';
  fs.writeFileSync(path.join(uploadsDir, fileEmma), codeEmma);

  const sub4 = await db.execute(
    'INSERT INTO submissions (assignment_id, student_id, file_path, original_filename, status) VALUES (?, ?, ?, ?, ?)',
    [assign1Id, stu4.insertId, fileEmma, 'broken_code.py', 'submitted']
  );

  // 4. Pre-populate Evaluations for John Doe (Full marks demo)
  const eval1 = await db.execute(
    `INSERT INTO evaluations (submission_id, compilation_status, execution_status, test_cases_passed, test_cases_failed, test_score, other_score, plagiarism_penalty, total_score, compilation_output)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [sub1.insertId, 'SUCCESS', 'SUCCESS', 4, 0, 60.00, 35.00, 0.00, 95.00, 'Compilation/Syntax check clean. All 4 test cases passed without warnings.']
  );

  // Pre-populate Plagiarism Results showing pairwise similarity between John, Jane, and Alex
  await db.execute(
    `INSERT INTO plagiarism_results (submission_id, compared_submission_id, similarity_score, detection_status, cluster_id)
     VALUES (?, ?, ?, ?, ?)`,
    [sub1.insertId, sub2.insertId, 88.50, 'HIGH_SIMILARITY', 1]
  );
  await db.execute(
    `INSERT INTO plagiarism_results (submission_id, compared_submission_id, similarity_score, detection_status, cluster_id)
     VALUES (?, ?, ?, ?, ?)`,
    [sub2.insertId, sub1.insertId, 88.50, 'HIGH_SIMILARITY', 1]
  );
  await db.execute(
    `INSERT INTO plagiarism_results (submission_id, compared_submission_id, similarity_score, detection_status, cluster_id)
     VALUES (?, ?, ?, ?, ?)`,
    [sub1.insertId, sub3.insertId, 79.20, 'HIGH_SIMILARITY', 1]
  );
  await db.execute(
    `INSERT INTO plagiarism_results (submission_id, compared_submission_id, similarity_score, detection_status, cluster_id)
     VALUES (?, ?, ?, ?, ?)`,
    [sub2.insertId, sub3.insertId, 84.10, 'HIGH_SIMILARITY', 1]
  );

  // Feedback for John
  await db.execute(
    'INSERT INTO feedback (submission_id, faculty_id, comments) VALUES (?, ?, ?)',
    [sub1.insertId, fac1.insertId, 'Outstanding algorithmic implementation and clear modular structure. Well done!']
  );

  // Report for John
  await db.execute(
    'INSERT INTO reports (submission_id, plagiarism_score, test_score, total_score, feedback) VALUES (?, ?, ?, ?, ?)',
    [sub1.insertId, 12.00, 60.00, 95.00, 'Outstanding algorithmic implementation and clear modular structure. Well done!']
  );

  console.log('✅ Default users, assignments, test cases, and submissions seeded successfully!');
  console.log('--------------------------------------------------');
  console.log('🔑 Credentials:');
  console.log('Admin:   admin@evalhub.edu       / admin123');
  console.log('Faculty: prof.alan@evalhub.edu   / faculty123');
  console.log('Student: student.john@evalhub.edu / student123');
  console.log('--------------------------------------------------');
}

if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization complete.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Database initialization error:', err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };
