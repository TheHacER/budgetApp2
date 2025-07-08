const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-key-that-is-long-and-random';

class AuthController {
  static async register(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: 'User with this email already exists.' });
      }

      const newUser = await User.create(email, password);
      res.status(201).json({ message: 'User created successfully.', userId: newUser.id });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ message: 'Internal server error during registration.' });
    }
  }

  static async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const isMatch = await User.comparePasswords(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' } 
      );

      res.status(200).json({
        message: 'Login successful.',
        token,
        user: { id: user.id, email: user.email }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error during login.' });
    }
  }
}

module.exports = AuthController;
