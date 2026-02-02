const { validationResult } = require('express-validator');
const User = require('../models/User');

const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email, isActive: true });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    req.session.user = user;

    res.json({
      message: 'Login successful',
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, role, employeeId, department } = req.body;

    const existingUser = await User.findOne({ 
      $or: [{ email }, { employeeId }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User with this email or employee ID already exists' 
      });
    }

    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role: role || 'employee',
      employeeId,
      department
    });

    await user.save();

    req.session.user = user;

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.user._id).populate('manager', 'firstName lastName email employeeId');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error during logout' });
      }
      res.json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  logout
};
