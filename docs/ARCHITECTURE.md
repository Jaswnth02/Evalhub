# Architecture Documentation: Automated Student Project Evaluation Hub
**Project ID:** 2026MIN314  
**Project Type:** Individual Mini Project – Full Stack Web Development  

---

## 1. System Overview
The **Automated Student Project Evaluation Hub** is an academic platform designed to automate project submissions, untrusted code compilation and execution against standardized test cases, source-code plagiarism analysis (with tokenization and density-based clustering), score calculation, and evaluation report generation.

---

## 2. Three-Layer Architecture

```
+-------------------------------------------------------------------------+
|                          PRESENTATION LAYER                             |
|       React.js Single Page Application (Vite, React Router v6)          |
|       - Student Portal: Assignments, Upload, Results & Reports          |
|       - Faculty Portal: Assignment Creation, Evaluation, Plagiarism Hub  |
|       - Admin Portal: User, Faculty, Student & Assignment Governance    |
+-------------------------------------------------------------------------+
                                    |
                                    | RESTful JSON APIs + JWT Auth
                                    v
+-------------------------------------------------------------------------+
|                          APPLICATION LAYER                              |
|                       Node.js + Express.js Engine                       |
|  +---------------------+  +----------------------+  +----------------+  |
|  |  Auth & Role Guard  |  | Plagiarism Detector  |  |  Code Runner   |  |
|  |  (JWT, bcryptjs)    |  | Tokenization, Winnow |  |  Sandboxed     |  |
|  |                     |  | DBSCAN Clustering    |  |  Timeout Limit |  |
|  +---------------------+  +----------------------+  +----------------+  |
|  +---------------------+  +----------------------+  +----------------+  |
|  |  Assignment Manager |  | Test Case Evaluator  |  | Score & Report |  |
|  +---------------------+  +----------------------+  +----------------+  |
+-------------------------------------------------------------------------+
                                    |
                                    | Parameterized SQL Queries
                                    v
+-------------------------------------------------------------------------+
|                             DATA LAYER                                  |
|         MySQL Relational Database (with Resilient Adapter)              |
|         - users, students, faculty, assignments                         |
|         - submissions, test_cases, evaluations                          |
|         - test_case_results, plagiarism_results, feedback, reports      |
+-------------------------------------------------------------------------+
```

---

## 3. Plagiarism Analysis Pipeline

1. **Source Code Preprocessing**:
   - Strips single-line and multi-line comments across languages.
   - Normalizes whitespace and indentation.
   - Replaces literal strings with `STR` and numbers with `NUM`.
2. **Lexical Tokenization**:
   - Preserves language keywords (`def`, `if`, `while`, `return`, `class`...).
   - Abstracts identifiers (variables, functions) into canonical symbol identifiers (`ID_1`, `ID_2`...).
   - Normalizes operators and control symbols.
3. **Fingerprinting & Similarity Analysis**:
   - Generates k-grams (k=4) over token sequences.
   - Applies the Winnowing fingerprinting algorithm to select robust structural hashes.
   - Computes Jaccard Similarity on fingerprint sets blended with token frequency cosine overlap.
4. **DBSCAN Density-Based Clustering**:
   - Computes distance `d(A, B) = 1.0 - (similarity / 100)`.
   - Applies DBSCAN with `epsilon = 0.40` (similarity >= 60%) and `minPts = 2`.
   - Automatically groups submissions that collude together into high-risk collusion clusters while marking independent work as outliers/noise.

---

## 4. Sandboxed Code Execution & Security Measures

- **Ephemeral Execution Sandbox**: Each submission runs in an isolated directory `temp_execution/<run_id>/` that is automatically deleted after evaluation.
- **Process Timeout**: Hard 5000ms timeout prevents infinite loops and denial-of-service hanging processes.
- **Buffer Limits**: Output capture is capped at 10,000 characters to prevent memory exhaustion from infinite print loops.
- **Environment Sanitation**: Spawned child processes run with sanitized environment variables, preventing exposure of database passwords or server secrets.
