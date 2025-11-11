const AuditLog = require('../models/AuditLog');

// Generate correlation ID
const generateCorrelationId = () => {
  return `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

const requestLogger = async (req, res, next) => {
  const correlationId = generateCorrelationId();
  req.correlationId = correlationId;
  
  // Log request start
  console.log({
    correlationId,
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    console.log({
      correlationId,
      statusCode: res.statusCode,
      response: data,
      timestamp: new Date().toISOString()
    });
    originalJson.call(this, data);
  };

  next();
};

const auditLogger = (action, resource) => {
  return async (req, res, next) => {
    // Store the original end method
    const originalEnd = res.end;
    
    // Override end method to log after response
    res.end = async function(chunk, encoding) {
      // Restore original end method
      res.end = originalEnd;
      
      // Call original end method
      res.end(chunk, encoding);

      // Log audit trail
      if (req.user) {
        try {
          await AuditLog.create({
            action,
            resource,
            resourceId: req.params.id || null,
            userId: req.user._id,
            userRole: req.user.role,
            previousValues: req.oldValues,
            newValues: req.newValues,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
          });
        } catch (error) {
          console.error('Audit logging failed:', error);
        }
      }
    };
    
    next();
  };
};

module.exports = {
  requestLogger,
  auditLogger
};