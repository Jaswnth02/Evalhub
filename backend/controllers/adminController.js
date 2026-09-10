const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Admin Dashboard Overview
async function getAdminDashboard(req, res, next) {
  try {
    const userCount = await db.query('SELECT COUNT(*) as count FROM users');
    const studentCount = await db.query('SELECT COUNT(*) as count FROM students');
    const facultyCount = await db.query('SELECT COUNT(*) as count FROM faculty');
    const assignCount = await db.query('SELECT COUNT(*) as count FROM assignments');
    const subCount = await db.query('SELECT COUNT(*) as count FROM submissions');
    const evalCount = await db.query("SELECT COUNT(*) as count FROM submissions WHERE status = 'evaluated'");
    const plagCount = await db.query('SELECT COUNT(*) as count FROM plagiarism_results WHERE similarity_score >= 60');

    // Recent system activity (latest users and submissions)
    const recentUsers = await db.query(
      'SELECT user_id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );

    const recentSubmissions = await db.query(
      `SELECT 
        s.submission_id, s.submitted_at, s.status, s.original_filename,
        a.title as assignment_title, u.name as student_name
       FROM submissions s
       JOIN assignments a ON s.assignment_id = a.assignment_id
       JOIN students st ON s.student_id = st.student_id
       JOIN users u ON st.user_id = u.user_id
       ORDER BY s.submitted_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalUsers: userCount[0].count || 0,
        totalStudents: studentCount[0].count || 0,
        totalFaculty: facultyCount[0].count || 0,
        totalAssignments: assignCount[0].count || 0,
        totalSubmissions: subCount[0].count || 0,
        totalEvaluated: evalCount[0].count || 0,
        suspiciousCollusions: plagCount[0].count || 0
      },
      recentUsers,
      recentSubmissions
    });
  } catch (err) {
    next(err);
  }
}

// Get All Users
async function getAllUsers(req, res, next) {
  try {
    const users = await db.query(
      `SELECT 
        u.user_id, u.name, u.email, u.role, u.created_at,
        st.register_number, st.department as student_dept, st.year,
        f.department as faculty_dept
       FROM users u
       LEFT JOIN students st ON u.user_id = st.user_id
       LEFT JOIN faculty f ON u.user_id = f.user_id
       ORDER BY u.created_at DESC`
    );

    res.json({
      success: true,
      users
    });
  } catch (err) {
    next(err);
  }
}

// Admin Create User (Student, Faculty, or Admin)
async function createUser(req, res, next) {
  try {
    const { name, email, password, role, registerNumber, department, year } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'All core fields are required.' });
    }

    const existing = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email address already in use.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userRes = await db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, hash, role]
    );
    const userId = userRes.insertId;

    if (role === 'student') {
      const reg = registerNumber || `REG${Date.now().toString().slice(-6)}`;
      await db.execute(
        'INSERT INTO students (user_id, register_number, department, year) VALUES (?, ?, ?, ?)',
        [userId, reg, department || 'Computer Science', year || 1]
      );
    } else if (role === 'faculty') {
      await db.execute(
        'INSERT INTO faculty (user_id, department) VALUES (?, ?)',
        [userId, department || 'Computer Science']
      );
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      userId
    });
  } catch (err) {
    next(err);
  }
}

// Admin Delete User
async function deleteUser(req, res, next) {
  try {
    const userId = req.params.id;
    if (Number(userId) === req.user.user_id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own admin account.' });
    }

    await db.execute('DELETE FROM users WHERE user_id = ?', [userId]);

    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAdminDashboard,
  getAllUsers,
  createUser,
  deleteUser
};
