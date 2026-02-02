const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Access denied. Please login.' });
    }

    const user = await User.findById(req.session.user._id).select('-password');
    
    if (!user || !user.isActive) {
      req.session.destroy();
      return res.status(401).json({ message: 'Invalid session or user not active.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid session.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { auth, authorize };
