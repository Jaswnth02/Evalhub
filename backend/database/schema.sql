-- ==========================================================
-- Automated Student Project Evaluation Hub
-- Project ID: 2026MIN314
-- Relational Database Schema (MySQL & SQLite Compatible DDL)
-- ==========================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    student_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    register_number VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    year INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. FACULTY TABLE
CREATE TABLE IF NOT EXISTS faculty (
    faculty_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 4. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    assignment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    instructions TEXT,
    programming_language VARCHAR(50) NOT NULL,
    deadline DATETIME NOT NULL,
    faculty_id INTEGER NOT NULL,
    max_test_score DECIMAL(5,2) DEFAULT 60.00,
    max_quality_score DECIMAL(5,2) DEFAULT 40.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- 5. TEST CASES TABLE
CREATE TABLE IF NOT EXISTS test_cases (
    test_case_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    input_data TEXT,
    expected_output TEXT NOT NULL,
    marks DECIMAL(5,2) DEFAULT 10.00,
    is_sample BOOLEAN DEFAULT 0,
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE
);

-- 6. SUBMISSIONS TABLE
CREATE TABLE IF NOT EXISTS submissions (
    submission_id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('submitted', 'evaluating', 'evaluated', 'error')),
    FOREIGN KEY (assignment_id) REFERENCES assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE
);

-- 7. EVALUATIONS TABLE
CREATE TABLE IF NOT EXISTS evaluations (
    evaluation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL UNIQUE,
    compilation_status VARCHAR(50) NOT NULL,
    execution_status VARCHAR(50) NOT NULL,
    test_cases_passed INTEGER DEFAULT 0,
    test_cases_failed INTEGER DEFAULT 0,
    test_score DECIMAL(5,2) DEFAULT 0.00,
    other_score DECIMAL(5,2) DEFAULT 0.00,
    plagiarism_penalty DECIMAL(5,2) DEFAULT 0.00,
    total_score DECIMAL(5,2) DEFAULT 0.00,
    compilation_output TEXT,
    evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- 8. TEST CASE RESULTS TABLE
CREATE TABLE IF NOT EXISTS test_case_results (
    result_id INTEGER PRIMARY KEY AUTOINCREMENT,
    evaluation_id INTEGER NOT NULL,
    test_case_id INTEGER NOT NULL,
    actual_output TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PASS', 'FAIL', 'TIMEOUT', 'ERROR')),
    marks_awarded DECIMAL(5,2) DEFAULT 0.00,
    execution_time_ms INTEGER DEFAULT 0,
    FOREIGN KEY (evaluation_id) REFERENCES evaluations(evaluation_id) ON DELETE CASCADE,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(test_case_id) ON DELETE CASCADE
);

-- 9. PLAGIARISM RESULTS TABLE
CREATE TABLE IF NOT EXISTS plagiarism_results (
    plagiarism_id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    compared_submission_id INTEGER NOT NULL,
    similarity_score DECIMAL(5,2) NOT NULL,
    detection_status VARCHAR(30) NOT NULL CHECK (detection_status IN ('LOW_SIMILARITY', 'MODERATE_SIMILARITY', 'HIGH_SIMILARITY')),
    cluster_id INTEGER DEFAULT NULL,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (compared_submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- 10. FEEDBACK TABLE
CREATE TABLE IF NOT EXISTS feedback (
    feedback_id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL UNIQUE,
    faculty_id INTEGER NOT NULL,
    comments TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES faculty(faculty_id) ON DELETE CASCADE
);

-- 11. REPORTS TABLE
CREATE TABLE IF NOT EXISTS reports (
    report_id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL UNIQUE,
    plagiarism_score DECIMAL(5,2) DEFAULT 0.00,
    test_score DECIMAL(5,2) DEFAULT 0.00,
    total_score DECIMAL(5,2) DEFAULT 0.00,
    feedback TEXT,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(submission_id) ON DELETE CASCADE
);

-- INDEXES FOR QUERY OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_assignments_faculty ON assignments(faculty_id);
CREATE INDEX IF NOT EXISTS idx_submissions_assignment ON submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student ON submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_assignment ON test_cases(assignment_id);
CREATE INDEX IF NOT EXISTS idx_plagiarism_submission ON plagiarism_results(submission_id);
