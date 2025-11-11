const express = require('express');
const { body } = require('express-validator');
const { auth, requireRole, can } = require('../middleware/auth');
const { auditLogger } = require('../middleware/logger');
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser 
} = require('../controllers/userController');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Validation rules
const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3-30 characters'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('role')
    .optional()
    .isIn(['admin', 'editor', 'viewer'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// Routes
router.get('/', can('users:read'), getAllUsers);
router.get('/:id', can('users:read'), getUserById);
router.put(
  '/:id', 
  can('users:update'), 
  updateUserValidation, 
  handleValidationErrors, 
  auditLogger('UPDATE_USER', 'users'),
  updateUser
);
router.delete(
  '/:id', 
  can('users:delete'), 
  auditLogger('DELETE_USER', 'users'),
  deleteUser
);

module.exports = router;