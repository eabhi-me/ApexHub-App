const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    if (token === 'demo-jwt-token-sample') {
      let demoUser = await User.findOne({ email: 'demo@example.com' }).select('-password');
      if (!demoUser) {
        demoUser = await User.create({
          username: 'Alex Carter',
          email: 'demo@example.com',
          password: 'password123'
        });
      }
      req.user = demoUser;
      return next();
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'apexhub_jwt_secret_dev_key_2026';
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;
