const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'korelium';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  // JWT is typically sent as: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token.' });
    }
    req.user = decoded; // decoded = JWT payload
    next();
  });
};

module.exports = authenticateToken;
