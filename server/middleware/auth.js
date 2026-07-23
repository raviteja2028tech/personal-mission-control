const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    let token = null;

    // Check cookies first
    if (req.cookies && (req.cookies.pmc_token || req.cookies.token)) {
      token = req.cookies.pmc_token || req.cookies.token;
    } 
    // Fallback to Bearer header
    else {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '').trim();
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token, authorization denied' });
    }

    const secret = process.env.JWT_SECRET || 'fallback_secret_for_development';
    const decoded = jwt.verify(token, secret);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found or session invalid' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

module.exports = auth;
