// =================================================================
//  Authentication Middleware (isAuthenticated.js)
// =================================================================
//  This middleware verifies the JWT token from the Authorization header.
// =================================================================

const jwt = require('jsonwebtoken');

// This MUST be the same secret key used in authController.js
const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

function isAuthenticated(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Add user payload to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
}

module.exports = isAuthenticated;
