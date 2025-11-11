const Post = require('../models/Post');
const { validationResult } = require('express-validator');

const getAllPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query based on ownership filter
    let query = {};
    if (req.ownershipFilter) {
      query = { ...req.ownershipFilter, isPublished: true };
    } else {
      query = { isPublished: true };
    }

    const posts = await Post.find(query)
      .populate('author', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate('author', 'username email role');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags, isPublished } = req.body;

    const post = new Post({
      title,
      content,
      tags: tags || [],
      isPublished: isPublished !== undefined ? isPublished : true,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'username email role');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updatePost = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content, tags, isPublished } = req.body;
    const post = req.resource;

    // Store old values for audit
    req.oldValues = post.toObject();

    // Update fields
    if (title) post.title = title;
    if (content) post.content = content;
    if (tags) post.tags = tags;
    if (typeof isPublished === 'boolean') post.isPublished = isPublished;

    await post.save();
    await post.populate('author', 'username email role');

    // Store new values for audit
    req.newValues = post.toObject();

    res.json({
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deletePost = async (req, res) => {
  try {
    const post = req.resource;
    await Post.findByIdAndDelete(post._id);

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost
};