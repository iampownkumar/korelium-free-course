const { Admin } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET || 'korelium';

// Admin Login
const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { username } });
    if (!admin) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare password (Assumes passwords are hashed)
    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT
    const token = jwt.sign({ adminId: admin.id, username: admin.username }, SECRET_KEY, { expiresIn: '1h' });

    res.json({
      message: 'Login successful',
      username: admin.username,
      token: token
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = {
  login
};
