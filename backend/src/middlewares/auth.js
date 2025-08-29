import { JwksClient } from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../lib/logger.js';

// Initialize JWKS client
const jwksClient = new JwksClient({
  jwksUri: process.env.SUPABASE_JWKS_URL || 'https://your-project.supabase.co/auth/v1/certs',
  cache: true,
  rateLimit: true,
  jwksRequestsPerMinute: 10,
  cacheMaxAge: process.env.JWT_PUBLIC_KEYS_CACHE_TTL 
    ? parseInt(process.env.JWT_PUBLIC_KEYS_CACHE_TTL, 10) 
    : 15 * 60 * 1000, // 15 minutes default
});

// Get RSA signing key
const getKey = (header, callback) => {
  jwksClient.getSigningKey(header.kid, (err, key) => {
    if (err) {
      logger.error('Error getting signing key:', err);
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

// JWT verification options
const verifyOptions = {
  audience: process.env.SUPABASE_AUD || 'authenticated',
  issuer: process.env.SUPABASE_JWT_ISSUER || 'supabase',
  algorithms: ['RS256'],
};

/**
 * Authentication middleware that verifies JWT token from Authorization header
 * and attaches the decoded user to the request object
 */
const auth = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      message: 'No token provided or invalid token format',
    });
  }

  const token = authHeader.split(' ')[1];

  // Verify token
  jwt.verify(token, getKey, verifyOptions, (err, decoded) => {
    if (err) {
      logger.error('JWT verification error:', err);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Invalid or expired token',
      });
    }

    // Attach user to request object
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.user_metadata?.role || 'USER',
    };

    next();
  });
};

export { auth };
