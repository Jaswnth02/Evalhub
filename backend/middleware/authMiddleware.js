const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Verify JWT Token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.substring(7) 
    : null;

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access denied. No authentication token provided.' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'evalhub_jwt_secret_key_2026min314_secure');
    
    // Fetch fresh user details from database
    const users = await db.query(
      'SELECT user_id, name, email, role, created_at FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token. User no longer exists.' 
      });
    }

    const user = users[0];

    // If student, attach student_id
    if (user.role === 'student') {
      const students = await db.query('SELECT student_id, register_number, department, year FROM students WHERE user_id = ?', [user.user_id]);
      if (students.length > 0) {
        user.student_id = students[0].student_id;
        user.register_number = students[0].register_number;
        user.department = students[0].department;
        user.year = students[0].year;
      }
    }

    // If faculty, attach faculty_id
    if (user.role === 'faculty') {
      const faculty = await db.query('SELECT faculty_id, department FROM faculty WHERE user_id = ?', [user.user_id]);
      if (faculty.length > 0) {
        user.faculty_id = faculty[0].faculty_id;
        user.department = faculty[0].department;
      }
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token. Please log in again.' 
    });
  }
}

// Restrict access by role(s)
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. This resource requires one of the following roles: ${allowedRoles.join(', ')}` 
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole
};
