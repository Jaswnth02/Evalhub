# Database Schema Documentation: Automated Student Project Evaluation Hub
**Project ID:** 2026MIN314  

---

## 1. Relational Tables

### 1. `users`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `name` | VARCHAR(100) | NOT NULL | User's full name |
| `email` | VARCHAR(120) | NOT NULL, UNIQUE | User email address (login credential) |
| `password_hash`| VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `role` | VARCHAR(20) | CHECK ('student', 'faculty', 'admin') | Access control role |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Registration timestamp |

### 2. `students`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `student_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Student profile identifier |
| `user_id` | INTEGER | UNIQUE, FOREIGN KEY -> `users` | Referenced user account |
| `register_number`| VARCHAR(50) | UNIQUE, NOT NULL | University student registration number |
| `department` | VARCHAR(100) | NOT NULL | Academic department |
| `year` | INTEGER | NOT NULL | Academic year (1-4) |

### 3. `faculty`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `faculty_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Faculty profile identifier |
| `user_id` | INTEGER | UNIQUE, FOREIGN KEY -> `users` | Referenced user account |
| `department` | VARCHAR(100) | NOT NULL | Academic department |

### 4. `assignments`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `assignment_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Assignment unique ID |
| `title` | VARCHAR(200) | NOT NULL | Assignment title |
| `description` | TEXT | | Overview of project requirements |
| `instructions`| TEXT | | Input/output formatting instructions |
| `programming_language` | VARCHAR(50) | NOT NULL | python, c, cpp, java, javascript |
| `deadline` | DATETIME | NOT NULL | Submission deadline |
| `faculty_id` | INTEGER | FOREIGN KEY -> `faculty` | Creator faculty |
| `max_test_score` | DECIMAL(5,2)| DEFAULT 60.00 | Maximum test case score |
| `max_quality_score` | DECIMAL(5,2)| DEFAULT 40.00 | Maximum code quality score |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

### 5. `test_cases`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `test_case_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Test case unique ID |
| `assignment_id` | INTEGER | FOREIGN KEY -> `assignments` | Associated assignment |
| `input_data` | TEXT | | Data provided via standard input (stdin) |
| `expected_output` | TEXT | NOT NULL | Expected standard output (stdout) |
| `marks` | DECIMAL(5,2)| DEFAULT 10.00 | Marks awarded for passing |
| `is_sample` | BOOLEAN | DEFAULT 0 | 1 if visible to students as a sample |

### 6. `submissions`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `submission_id`| INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique submission record |
| `assignment_id`| INTEGER | FOREIGN KEY -> `assignments` | Target assignment |
| `student_id` | INTEGER | FOREIGN KEY -> `students` | Submitting student |
| `file_path` | VARCHAR(255)| NOT NULL | Uploaded filename in `uploads/` |
| `original_filename`| VARCHAR(255)| NOT NULL | Original submitted filename |
| `submitted_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Submission timestamp |
| `status` | VARCHAR(20) | CHECK ('submitted', 'evaluating', 'evaluated', 'error') | Current state |

### 7. `evaluations`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `evaluation_id`| INTEGER | PRIMARY KEY, AUTOINCREMENT | Evaluation unique record |
| `submission_id`| INTEGER | UNIQUE, FOREIGN KEY -> `submissions` | Evaluated submission |
| `compilation_status` | VARCHAR(50) | NOT NULL | SUCCESS, COMPILATION_ERROR, etc. |
| `execution_status` | VARCHAR(50) | NOT NULL | SUCCESS, RUNTIME_ERROR, TIMEOUT |
| `test_cases_passed`| INTEGER | DEFAULT 0 | Count of passed test cases |
| `test_cases_failed`| INTEGER | DEFAULT 0 | Count of failed test cases |
| `test_score` | DECIMAL(5,2)| DEFAULT 0.00 | Scaled marks earned from test cases |
| `other_score` | DECIMAL(5,2)| DEFAULT 0.00 | Marks for code quality/criteria |
| `plagiarism_penalty`| DECIMAL(5,2)| DEFAULT 0.00 | Penalty deducted for collusion |
| `total_score` | DECIMAL(5,2)| DEFAULT 0.00 | Final mark out of 100 |
| `compilation_output`| TEXT | | Compiler / interpreter stderr output |
| `evaluated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Timestamp of evaluation |

### 8. `test_case_results`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `result_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Result row ID |
| `evaluation_id`| INTEGER | FOREIGN KEY -> `evaluations` | Associated evaluation |
| `test_case_id` | INTEGER | FOREIGN KEY -> `test_cases` | Target test case |
| `actual_output`| TEXT | | Actual stdout captured |
| `status` | VARCHAR(20) | CHECK ('PASS', 'FAIL', 'TIMEOUT', 'ERROR') | Case status |
| `marks_awarded`| DECIMAL(5,2)| | Marks earned |
| `execution_time_ms`| INTEGER | | Execution time in milliseconds |

### 9. `plagiarism_results`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `plagiarism_id`| INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique plagiarism match record |
| `submission_id`| INTEGER | FOREIGN KEY -> `submissions` | Source submission |
| `compared_submission_id`| INTEGER | FOREIGN KEY -> `submissions` | Compared target submission |
| `similarity_score`| DECIMAL(5,2)| NOT NULL | Percentage similarity (0.00 - 100.00%) |
| `detection_status`| VARCHAR(30)| CHECK ('LOW_SIMILARITY', 'MODERATE_SIMILARITY', 'HIGH_SIMILARITY') | Risk status |
| `cluster_id` | INTEGER | DEFAULT NULL | DBSCAN detected collusion cluster ID |

### 10. `feedback`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `feedback_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Feedback record |
| `submission_id`| INTEGER | UNIQUE, FOREIGN KEY -> `submissions` | Associated submission |
| `faculty_id` | INTEGER | FOREIGN KEY -> `faculty` | Reviewing faculty member |
| `comments` | TEXT | NOT NULL | Qualitative faculty comments |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Feedback timestamp |

### 11. `reports`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `report_id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Generated report ID |
| `submission_id`| INTEGER | UNIQUE, FOREIGN KEY -> `submissions` | Target submission |
| `plagiarism_score`| DECIMAL(5,2)| DEFAULT 0.00 | Highest similarity percentage |
| `test_score` | DECIMAL(5,2)| DEFAULT 0.00 | Marks earned from test cases |
| `total_score` | DECIMAL(5,2)| DEFAULT 0.00 | Final score out of 100 |
| `feedback` | TEXT | | Summary feedback |
| `generated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Report creation timestamp |
