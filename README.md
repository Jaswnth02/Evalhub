# Automated Student Project Evaluation Hub
**Project ID:** 2026MIN314  
**Project Type:** Individual Mini Project – Full Stack Web Development  

[![Live Demo](https://img.shields.io/badge/Live_Demo-GitHub_Pages-6366f1?style=for-the-badge&logo=github)](https://jaswnth02.github.io/Evalhub/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-purple?style=flat&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat&logo=node.js)](https://nodejs.org)
[![License](https://img.shields.io/badge/License-Academic_Evaluation-orange?style=flat)](#)

> 🌐 **Live Web Preview**: [https://jaswnth02.github.io/Evalhub/](https://jaswnth02.github.io/Evalhub/)  
> Anyone can click the live link and test the complete system (Student, Faculty, and Admin portals) with instant 1-click demo logins!

> **Academic Positioning:**  
> A lightweight, customizable, and secure full-stack academic project evaluation platform that integrates automated untrusted code compilation and execution with source-code similarity detection and density-based collusion clustering.


---

## 🚀 Key Features

1. **Role-Based Workflows & Authentication**:
   - **Student Portal**: View assignments, submit code files, monitor execution results, inspect plagiarism scores, and view printable evaluation reports.
   - **Faculty Portal**: Author assignments, configure test benchmarks and scoring weights, trigger automated code compilation in sandboxed runners, inspect compilation outputs, review pairwise plagiarism matrices, inspect DBSCAN collusion clusters, and publish qualitative feedback.
   - **Admin Portal**: System-wide governance, user registration, role assignments, and platform audit metrics.

2. **Automated Code Compilation & Sandboxed Execution**:
   - Supports **Python (.py)**, **C++ (.cpp)**, **C (.c)**, **Java (.java)**, and **JavaScript (.js)**.
   - Ephemeral sandbox execution folders (`temp_execution/<run_id>/`) with strict process timeouts (5000ms), memory limits, output buffering caps, and automatic directory cleanup.
   - Standard input injection (`stdin`) and standard output (`stdout`) comparison against expected benchmark outputs.

3. **Source-Code Plagiarism & DBSCAN Density Clustering**:
   - Multi-stage pipeline: Comment stripping &rarr; Whitespace normalization &rarr; Lexical tokenization & identifier abstraction (`ID_1`, `ID_2`, `NUM`, `STR`) &rarr; Winnowing k-gram structural fingerprinting &rarr; Blended Jaccard and token frequency cosine similarity.
   - **DBSCAN Clustering**: Identifies collusion groups sharing high mutual similarity (&ge;60%) while separating independent, authentic student submissions as outliers.

4. **Configurable Scoring & Official Reports**:
   - Weighted marks calculation: Test Cases Benchmarks + Code Quality Criteria - Plagiarism Collusion Penalties.
   - Official academic evaluation report sheet with printable styling (`window.print()`).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite), React Router v6, Lucide React, Custom CSS Design System |
| **Backend** | Node.js, Express.js, RESTful APIs |
| **Authentication** | JWT (JSON Web Tokens) & `bcryptjs` password hashing |
| **Database** | MySQL (with seamless zero-configuration SQLite resilience adapter) |
| **Plagiarism** | Tokenization, identifier normalization, Winnowing fingerprints & DBSCAN clustering |
| **Execution** | Child process sandboxing, execution timeouts, memory ceilings |
| **API Testing** | Postman Collection (`docs/POSTMAN_COLLECTION.json`) |

---

## 🔑 Default Demo Accounts

For instant grading and demonstration, the database includes pre-seeded accounts:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student.john@evalhub.edu` | `student123` | John Doe (Reg: REG2026CS101, Year 3) |
| **Student** | `student.jane@evalhub.edu` | `student123` | Jane Smith (Reg: REG2026CS102, Year 3) |
| **Faculty** | `prof.alan@evalhub.edu` | `faculty123` | Prof. Alan Turing (Computer Science) |
| **Faculty** | `prof.grace@evalhub.edu` | `faculty123` | Dr. Grace Hopper (Software Eng.) |
| **Admin** | `admin@evalhub.edu` | `admin123` | System Administrator |

---

## ⚡ Quick Start Instructions

### 1. Initialize Database & Seed Sample Data
```bash
npm run init-db
```
*Note: If MySQL server is running locally on port 3306 with credentials in `backend/.env`, it populates MySQL. If MySQL is not active, it automatically initializes a local SQLite relational database (`backend/database/evalhub.sqlite`) so you can run and test instantly without setup bottlenecks.*

### 2. Run Backend Unit & Integration Tests
```bash
npm run test:backend
```
Verifies tokenizer, plagiarism similarity calculations, DBSCAN cluster formation, and sandboxed code execution.

### 3. Start Backend API Server
```bash
npm run start:backend
```
Server runs at: `http://localhost:5000` (Health check: `http://localhost:5000/api/health`).

### 4. Start React Frontend
In a second terminal:
```bash
npm run start:frontend
```
Frontend runs at: `http://localhost:5173`.

---

## 📁 Project Structure

```
Automated Evaluation Hub/
├── backend/
│   ├── config/
│   │   └── db.js                 # Unified database connector (MySQL / SQLite)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── studentController.js
│   │   ├── facultyController.js
│   │   ├── adminController.js
│   │   ├── assignmentController.js
│   │   ├── submissionController.js
│   │   ├── evaluationController.js
│   │   ├── plagiarismController.js
│   │   ├── feedbackController.js
│   │   └── reportController.js
│   ├── database/
│   │   ├── schema.sql            # Relational DDL
│   │   ├── dbInit.js             # Seeder & table initializer
│   │   └── evalhub.sqlite        # Local relational database
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role guards
│   │   ├── uploadMiddleware.js   # Multer file validation
│   │   └── errorHandler.js       # Centralized error responses
│   ├── services/
│   │   ├── execution/
│   │   │   └── runner.js         # Sandboxed process execution
│   │   ├── plagiarism/
│   │   │   ├── preprocessor.js   # Comment & whitespace cleanup
│   │   │   ├── tokenizer.js      # Identifier abstraction
│   │   │   ├── similarity.js     # Winnowing fingerprinting
│   │   │   └── clustering.js     # DBSCAN clustering algorithm
│   │   └── evaluation/
│   │       ├── evaluator.js      # End-to-end evaluation pipeline
│   │       └── scoreCalculator.js# Configurable marks calculation
│   ├── uploads/                  # Submitted source files
│   ├── temp_execution/           # Ephemeral sandbox runs
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/           # Reusable cards, badges, modals, tables, report view
│   │   ├── pages/                # Student, Faculty, Admin, Auth pages
│   │   ├── services/api.js       # Authenticated REST API client
│   │   ├── context/AuthContext.jsx
│   │   └── styles/               # Design tokens, components, dashboard CSS
│   └── vite.config.js
├── docs/
│   ├── ARCHITECTURE.md           # Three-layer full-stack architecture
│   ├── DATABASE.md               # Database schema and relational tables
│   ├── API_DOCUMENTATION.md      # REST endpoints catalogue
│   └── POSTMAN_COLLECTION.json   # Ready-to-import Postman collection
└── README.md
```
