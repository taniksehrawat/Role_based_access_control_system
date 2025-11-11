const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid token or user inactive.',
        code: 'INVALID_TOKEN'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ 
      error: 'Invalid token.',
      code: 'TOKEN_INVALID'
    });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      AuditLog.create({
        action: 'UNAUTHORIZED_ACCESS',
        resource: req.route?.path || 'unknown',
        userId: req.user._id,
        userRole: req.user.role,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });

      return res.status(403).json({ 
        error: 'Insufficient permissions',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};

const can = (permission) => {
  return async (req, res, next) => {
    try {
      const { hasPermission } = require('../config/roles');
      
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!hasPermission(req.user.role, permission)) {
        AuditLog.create({
          action: 'PERMISSION_DENIED',
          resource: permission,
          userId: req.user._id,
          userRole: req.user.role,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        });

        return res.status(403).json({ 
          error: `Permission denied: ${permission}`,
          code: 'PERMISSION_DENIED'
        });
      }
      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization check failed' });
    }
  };
};

module.exports = {
  auth,
  requireRole,
  can
};