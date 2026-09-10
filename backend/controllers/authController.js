const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register User (Student or Faculty)
async function register(req, res, next) {
  try {
    const { name, email, password, role, registerNumber, department, year } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.'
      });
    }

    if (!['student', 'faculty'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be either student or faculty.'
      });
    }

    // Check if email already exists
    const existing = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const userResult = await db.execute(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, role]
    );
    const userId = userResult.insertId;

    // Insert role-specific profile
    if (role === 'student') {
      const regNo = registerNumber || `REG${Date.now().toString().slice(-6)}`;
      await db.execute(
        'INSERT INTO students (user_id, register_number, department, year) VALUES (?, ?, ?, ?)',
        [userId, regNo, department || 'General Engineering', year || 1]
      );
    } else if (role === 'faculty') {
      await db.execute(
        'INSERT INTO faculty (user_id, department) VALUES (?, ?)',
        [userId, department || 'Computer Science']
      );
    }

    // Generate JWT
    const token = jwt.sign(
      { userId, role, email },
      process.env.JWT_SECRET || 'evalhub_jwt_secret_key_2026min314_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        userId,
        name,
        email,
        role
      }
    });
  } catch (err) {
    next(err);
  }
}

// Login User
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    let roleDetails = {};
    if (user.role === 'student') {
      const stu = await db.query('SELECT * FROM students WHERE user_id = ?', [user.user_id]);
      if (stu.length > 0) {
        roleDetails = {
          studentId: stu[0].student_id,
          registerNumber: stu[0].register_number,
          department: stu[0].department,
          year: stu[0].year
        };
      }
    } else if (user.role === 'faculty') {
      const fac = await db.query('SELECT * FROM faculty WHERE user_id = ?', [user.user_id]);
      if (fac.length > 0) {
        roleDetails = {
          facultyId: fac[0].faculty_id,
          department: fac[0].department
        };
      }
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'evalhub_jwt_secret_key_2026min314_secure',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...roleDetails
      }
    });
  } catch (err) {
    next(err);
  }
}

// Current User Profile (/me)
async function getCurrentUser(req, res) {
  res.json({
    success: true,
    user: req.user
  });
}

// Logout User
async function logout(req, res) {
  res.json({
    success: true,
    message: 'Logged out successfully.'
  });
}

module.exports = {
  register,
  login,
  getCurrentUser,
  logout
};
