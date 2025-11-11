const express = require('express');
const { body } = require('express-validator');
const { auth, can } = require('../middleware/auth');
const { checkOwnership, filterByOwnership } = require('../middleware/ownership');
const { auditLogger } = require('../middleware/logger');
const { 
  getAllPosts, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost 
} = require('../controllers/postController');
const { handleValidationErrors } = require('../middleware/validation');
const Post = require('../models/Post');

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('title')
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1-200 characters')
    .trim(),
  body('content')
    .isLength({ min: 1 })
    .withMessage('Content is required')
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

const updatePostValidation = [
  body('title')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1-200 characters')
    .trim(),
  body('content')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Content cannot be empty')
    .trim(),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

// Routes
router.get('/', auth, filterByOwnership(Post), getAllPosts);
router.get('/:id', auth, getPostById);
router.post(
  '/', 
  auth, 
  can('posts:create'), 
  createPostValidation, 
  handleValidationErrors,
  auditLogger('CREATE_POST', 'posts'),
  createPost
);
router.put(
  '/:id', 
  auth, 
  can('posts:update'), 
  checkOwnership(Post, 'id'), 
  updatePostValidation, 
  handleValidationErrors,
  auditLogger('UPDATE_POST', 'posts'),
  updatePost
);
router.delete(
  '/:id', 
  auth, 
  can('posts:delete'), 
  checkOwnership(Post, 'id'),
  auditLogger('DELETE_POST', 'posts'),
  deletePost
);

module.exports = router;