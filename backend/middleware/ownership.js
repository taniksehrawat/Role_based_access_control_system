const Post = require('../models/Post');
const { ROLES } = require('../config/roles');

// Middleware to check if user owns the resource or is admin
const checkOwnership = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      const resource = await model.findById(resourceId);

      if (!resource) {
        return res.status(404).json({ error: 'Resource not found' });
      }

      // Admin can access all resources
      if (req.user.role === ROLES.ADMIN) {
        req.resource = resource;
        return next();
      }

      // Check if user owns the resource
      const isOwner = resource.author && resource.author.toString() === req.user._id.toString();
      
      if (!isOwner) {
        return res.status(403).json({ 
          error: 'Access denied. You do not own this resource.',
          code: 'NOT_OWNER'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      res.status(500).json({ error: 'Ownership check failed' });
    }
  };
};

// Middleware to filter queries based on ownership
const filterByOwnership = (model) => {
  return async (req, res, next) => {
    try {
      // Admin can see all resources
      if (req.user.role === ROLES.ADMIN) {
        return next();
      }

      // For non-admins, filter by ownership
      req.ownershipFilter = { author: req.user._id };
      next();
    } catch (error) {
      res.status(500).json({ error: 'Ownership filter failed' });
    }
  };
};

module.exports = {
  checkOwnership,
  filterByOwnership
};