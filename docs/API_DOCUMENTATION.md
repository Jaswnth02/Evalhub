# REST API Documentation: Automated Student Project Evaluation Hub
**Base URL:** `http://localhost:5000/api`

---

## Authentication (`/api/auth`)

### 1. User Registration
- **POST** `/api/auth/register`
- **Body (JSON):**
  ```json
  {
    "name": "Jane Smith",
    "email": "student.jane@evalhub.edu",
    "password": "student123",
    "role": "student",
    "registerNumber": "REG2026CS102",
    "department": "Computer Science and Engineering",
    "year": 3
  }
  ```

### 2. User Login
- **POST** `/api/auth/login`
- **Body (JSON):**
  ```json
  {
    "email": "student.john@evalhub.edu",
    "password": "student123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOi...",
    "user": { "userId": 4, "name": "John Doe", "email": "student.john@evalhub.edu", "role": "student", "studentId": 1 }
  }
  ```

### 3. Current User Profile
- **GET** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

---

## Assignments (`/api/assignments`)

### 1. List Assignments
- **GET** `/api/assignments`
- **Headers:** `Authorization: Bearer <token>`

### 2. Get Assignment Details
- **GET** `/api/assignments/:id`
- **Headers:** `Authorization: Bearer <token>`

### 3. Create Assignment (Faculty/Admin)
- **POST** `/api/assignments`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "title": "Python Palindrome & Prime Validator",
    "description": "Implement palindrome and prime number validation.",
    "instructions": "Read standard input and write to standard output.",
    "programmingLanguage": "python",
    "deadline": "2026-12-31 23:59:59",
    "maxTestScore": 60,
    "maxQualityScore": 40,
    "testCases": [
      { "inputData": "PALINDROME\nracecar", "expectedOutput": "VALID_PALINDROME", "marks": 15, "isSample": true }
    ]
  }
  ```

---

## Submissions (`/api/submissions`)

### 1. Submit Code File (Student)
- **POST** `/api/submissions`
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
- **Form Data:**
  - `assignmentId`: 1
  - `codeFile`: file (`.py`, `.c`, `.cpp`, `.java`, `.js`)

### 2. List Submissions
- **GET** `/api/submissions?assignmentId=1`
- **Headers:** `Authorization: Bearer <token>`

### 3. Get Submission Details & Source Code
- **GET** `/api/submissions/:id`
- **Headers:** `Authorization: Bearer <token>`

---

## Evaluation (`/api/evaluation`)

### 1. Trigger Automated Evaluation (Faculty/Admin)
- **POST** `/api/evaluation/:submissionId`
- **Headers:** `Authorization: Bearer <token>`

### 2. Get Evaluation Results
- **GET** `/api/evaluation/:submissionId`
- **Headers:** `Authorization: Bearer <token>`

---

## Plagiarism Detection (`/api/plagiarism`)

### 1. Single Submission Plagiarism Breakdown
- **GET** `/api/plagiarism/:submissionId`
- **Headers:** `Authorization: Bearer <token>`

### 2. Assignment Plagiarism Hub (Pairwise Matrix & DBSCAN Clusters)
- **GET** `/api/plagiarism/assignment/:assignmentId`
- **Headers:** `Authorization: Bearer <token>`

---

## Feedback & Reports (`/api/feedback` & `/api/reports`)

### 1. Add/Update Feedback (Faculty)
- **POST** `/api/feedback`
- **Headers:** `Authorization: Bearer <token>`
- **Body (JSON):**
  ```json
  {
    "submissionId": 1,
    "comments": "Great modular code and correct time complexity."
  }
  ```

### 2. Get Comprehensive Evaluation Report
- **GET** `/api/reports/:submissionId`
- **Headers:** `Authorization: Bearer <token>`
