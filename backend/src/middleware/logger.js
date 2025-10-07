// ============================================================================
// backend/src/middleware/logger.js
// ============================================================================

/**
 * Request logging middleware for audit trail
 */
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    
    // Log after response
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      const logData = {
        timestamp: new Date().toISOString(),
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        userId: req.userId || 'anonymous'
      };
      
      // In production, send to logging service (e.g., Winston, CloudWatch)
      console.log(JSON.stringify(logData));
    });
    
    next();
  };