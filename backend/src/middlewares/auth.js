import { JwksClient } from 'jwks-rsa';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import { logger } from '../lib/logger.js';

const prisma = new PrismaClient();

// Initialize JWKS client
const JWKS_URI = process.env.SUPABASE_JWKS_URL || 'https://your-project.supabase.co/auth/v1/keys';
const jwksClient = new JwksClient({
  jwksUri: JWKS_URI,
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

// Derive default issuer from JWKS URL: .../auth/v1/(certs|keys) => .../auth/v1
const derivedIssuer = JWKS_URI.replace(/\/auth\/v1\/(certs|keys)$/, '/auth/v1');

// Build issuer list: always include derived issuer; include env or legacy as fallback
const envIssuer = process.env.SUPABASE_JWT_ISSUER || 'supabase';
const issuers = Array.from(new Set([derivedIssuer, envIssuer]));

// JWT verification options (RS256)
const verifyOptions = {
  issuer: issuers,
  algorithms: ['RS256'],
  ignoreExpiration: false, // Ensure tokens are not expired
  clockTolerance: 5, // 5 seconds clock tolerance
};
if (process.env.SUPABASE_AUD) {
  verifyOptions.audience = process.env.SUPABASE_AUD;
}

/**
 * Authentication middleware that verifies JWT token from Authorization header
 * and attaches the decoded user to the request object
 */
const auth = async (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      message: 'No token provided or invalid token format',
    });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Decide verification strategy based on token header.alg
    const decodedHeader = jwt.decode(token, { complete: true });
    const alg = decodedHeader?.header?.alg;
    const hdrIss = decodedHeader?.payload?.iss;
    const hdrAud = decodedHeader?.payload?.aud;
    logger.info(`Auth token header: alg=${alg}, iss=${hdrIss}, aud=${hdrAud}`);
    let decoded;

    if (alg === 'RS256') {
      // Verify with JWKS (RS256)
      decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, getKey, verifyOptions, (err, payload) => {
          if (err) return reject(err);
          resolve(payload);
        });
      });
    } else if (alg === 'HS256') {
      // Verify with Supabase JWT Secret (HS256)
      const secret = process.env.SUPABASE_JWT_SECRET;
      if (!secret) {
        logger.error('HS256 token received but SUPABASE_JWT_SECRET is not set in environment.');
        return res.status(StatusCodes.UNAUTHORIZED).json({
          status: 'error',
          message: 'Server missing JWT secret to verify token',
        });
      }
      const hsOptions = {
        issuer: ['supabase', ...issuers],
        algorithms: ['HS256'],
        ignoreExpiration: false,
        clockTolerance: 5,
      };
      if (process.env.SUPABASE_AUD) {
        hsOptions.audience = process.env.SUPABASE_AUD;
      }
      decoded = await new Promise((resolve, reject) => {
        jwt.verify(token, secret, hsOptions, (err, payload) => {
          if (err) return reject(err);
          resolve(payload);
        });
      });
    } else {
      logger.error(`Unsupported JWT alg: ${alg}`);
      return res.status(StatusCodes.UNAUTHORIZED).json({
        status: 'error',
        message: 'Unsupported token algorithm',
      });
    }

    // Get or create user from database
    let user;
    try {
      // First try to find the user by supabaseUid
      user = await prisma.user.findUnique({
        where: { supabaseUid: decoded.sub },
        select: { 
          id: true, 
          email: true, 
          role: true, 
          emailVerified: true 
        },
      });

      // If user doesn't exist, try to create one
      if (!user) {
        const name = decoded.user_metadata?.full_name || decoded.name || null;
        const phone = decoded.user_metadata?.phone || null;
        
        try {
          // Try to create user
          user = await prisma.user.create({
            data: {
              supabaseUid: decoded.sub,
              email: decoded.email,
              name,
              phone,
              emailVerified: decoded.email_confirmed_at ? true : false,
              lastSignInAt: new Date(),
              role: 'USER' // Default role
            },
            select: { 
              id: true, 
              email: true, 
              role: true, 
              emailVerified: true 
            },
          });
          logger.info(`Created new user from JWT: ${decoded.sub}`);
        } catch (createError) {
          // If user creation fails with unique constraint, try to find by email
          if (createError.code === 'P2002' && createError.meta?.target?.includes('email')) {
            logger.warn(`User with email ${decoded.email} already exists, trying to find by email`);
            user = await prisma.user.findUnique({
              where: { email: decoded.email },
              select: { 
                id: true, 
                email: true, 
                role: true, 
                emailVerified: true 
              },
            });
            
            if (user) {
              // Update the existing user with the new supabaseUid
              await prisma.user.update({
                where: { id: user.id },
                data: { 
                  supabaseUid: decoded.sub,
                  lastSignInAt: new Date()
                },
              });
              logger.info(`Updated existing user with new supabaseUid: ${decoded.sub}`);
            }
          } else {
            throw createError; // Re-throw if it's not a unique constraint error
          }
        }
      } else {
        // Update last sign-in time for existing user
        await prisma.user.update({
          where: { id: user.id },
          data: { lastSignInAt: new Date() },
        });
      }
    } catch (error) {
      logger.error('Database error during user lookup/creation:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        status: 'error',
        message: 'Error processing user authentication',
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      supabaseUid: decoded.sub,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error('JWT verification failed:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
    });
    return res.status(StatusCodes.UNAUTHORIZED).json({
      status: 'error',
      message: 'Invalid or expired token',
    });
  }
};

export { auth };
