const express = require('express');
const { body } = require('express-validator');
const { auth } = require('../middleware/auth');
const { 
  register, 
  login, 
  refreshToken, 
  getProfile 
} = require('../controllers/authController');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3-30 characters')
    .isAlphanumeric()
    .withMessage('Username must be alphanumeric'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Invalid role')
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, handleValidationErrors, register);
router.post('/login', loginValidation, handleValidationErrors, login);
router.post('/refresh-token', refreshToken);
router.get('/profile', auth, getProfile);

module.exports = router;