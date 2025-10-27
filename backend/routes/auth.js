// auth.js

const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Import JWT
const router = express.Router();

/* ==========================
   Validation Patterns
   ========================== */
const patterns = {
  fullName: /^[a-zA-Z\s]{2,50}$/,  // Letters and spaces only, 2-50 chars
  idNumber: /^\d{13}$/,  // Exactly 13 digits for SA ID
  username: /^[a-zA-Z0-9_]{3,20}$/,  // Alphanumeric and underscore, 3-20 chars
  accountNumber: /^\d{10,12}$/,  // 10-12 digits for account number
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/  // Strong password
};

/* ==========================
   Helper Functions
   ========================== */

// Validate field against regex pattern
const validateInput = (field, value, pattern) => {
  if (!value || !pattern.test(value)) {
    return false;
  }
  return true;
};

// Sanitize user input to avoid injection / XSS
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/[<>]/g, '');
};

/* ==========================
   Signup Route
   ========================== */
router.post('/signup', async (req, res) => {
  try {
    // Sanitize inputs
    const fullName = sanitizeInput(req.body.fullName);
    const idNumber = sanitizeInput(req.body.idNumber);
    const username = sanitizeInput(req.body.username);
    const accountNumber = sanitizeInput(req.body.accountNumber);
    const password = req.body.password; // Don't sanitize password

    // Validate inputs
    const validationErrors = [];
    if (!validateInput('fullName', fullName, patterns.fullName)) {
      validationErrors.push('Full name must be 2-50 characters, letters and spaces only');
    }
    if (!validateInput('idNumber', idNumber, patterns.idNumber)) {
      validationErrors.push('ID number must be exactly 13 digits');
    }
    if (!validateInput('username', username, patterns.username)) {
      validationErrors.push('Username must be 3-20 characters, alphanumeric and underscore only');
    }
    if (!validateInput('accountNumber', accountNumber, patterns.accountNumber)) {
      validationErrors.push('Account number must be 10-12 digits');
    }
    if (!validateInput('password', password, patterns.password)) {
      validationErrors.push('Password must be 8-20 characters with at least one uppercase, lowercase, digit, and special character');
    }

    // If validation failed
    if (validationErrors.length > 0) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { username: username },
        { idNumber: idNumber },
        { accountNumber: accountNumber }
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this username, ID number, or account number already exists'
      });
    }

    // Create new user
    const user = new User({
      fullName,
      idNumber,
      username,
      accountNumber,
      password
    });

    await user.save();

    // Store user in session
    req.session.user = {
      id: user._id,
      username: user.username,
      type: 'customer'
    };


    // Return response
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        accountNumber: user.accountNumber
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error creating user',
      error: error.message
    });
  }
});

/* ==========================
   Login Route
   ========================== */
router.post('/login', async (req, res) => {
  try {
    // Sanitize inputs
    const username = sanitizeInput(req.body.username);
    const accountNumber = sanitizeInput(req.body.accountNumber);
    const password = req.body.password; // Don't sanitize password

    // Validate inputs
    if (!username && !accountNumber) {
      return res.status(400).json({
        message: 'Username or account number is required'
      });
    }
    if (username && !patterns.username.test(username)) {
      return res.status(400).json({
        message: 'Invalid username format'
      });
    }
    if (accountNumber && !patterns.accountNumber.test(accountNumber)) {
      return res.status(400).json({
        message: 'Invalid account number format'
      });
    }
    if (!password) {
      return res.status(400).json({
        message: 'Password is required'
      });
    }

    // Find user by username or account number
    const query = {};
    if (username) query.username = username;
    if (accountNumber) query.accountNumber = accountNumber;

    const user = await User.findOne(query);

    if (!user) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: 'Invalid credentials'
      });
    }

    // Store user in session
    req.session.user = {
      id: user._id,
      username: user.username,
      type: 'customer'
    };

    // Return response
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        accountNumber: user.accountNumber
      }
    });

  } catch (error) {
    res.status(500).json({
      message: 'Error during login',
      error: error.message
    });
  }
});

module.exports = router;
