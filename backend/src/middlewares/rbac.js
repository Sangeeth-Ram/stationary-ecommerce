import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/logger.js';

/**
 * Middleware factory that creates a role-based access control middleware
 * @param {string[]} allowedRoles - Array of roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
  // Ensure allowedRoles is an array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  // Normalize roles to uppercase
  const normalizedRoles = roles.map(role => role.toUpperCase());
  
  return (req, res, next) => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: 'error',
          message: 'Authentication required',
        });
      }

      // Check if user has required role
      const userRole = req.user.role?.toUpperCase();
      
      // SUPER_ADMIN has access to everything
      if (userRole === 'SUPER_ADMIN') {
        return next();
      }
      
      // Check if user has one of the allowed roles
      if (!normalizedRoles.includes(userRole)) {
        logger.warn(
          `Access denied for user ${req.user.id} with role ${userRole} to ${req.method} ${req.originalUrl}`
        );
        
        return res.status(StatusCodes.FORBIDDEN).json({
          status: 'error',
          message: 'Insufficient permissions',
        });
      }
      
      next();
    } catch (error) {
      logger.error('RBAC middleware error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'An error occurred while checking permissions',
      });
    }
  };
};

export { requireRole };
