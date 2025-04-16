import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import pool from '../config/db.js'; // Adjust the import based on your project structure

dotenv.config(); // Ensure environment variables are loaded

/**
 * Express middleware to authenticate requests using JWT.
 *
 * Verifies the JWT token found in the Authorization header.
 * If valid, attaches the decoded user payload to `req.user`.
 * Optionally checks if the user still exists in the database.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const  authenticateToken = async (req, res, next) => {
  // 1. Get token from header (e.g., "Bearer TOKEN_STRING")
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token part

  // 2. Check if token exists
  if (token == null) {
    // No token provided
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
      console.error("FATAL ERROR: JWT_SECRET is not defined.");
      // Don't proceed without a secret
      return res.status(500).json({ error: 'Internal Server Error: Authentication configuration missing' });
  }

  try {
    // 3. Verify token
    // jwt.verify throws an error if token is invalid (e.g., expired, wrong signature)
    const decodedPayload = jwt.verify(token, secret);

    // --- Optional but Recommended: Database Check ---
    // 4. Check if user from token still exists in the database
    // This prevents using tokens for users who have been deleted after token issuance.
    const userCheckQuery = 'SELECT id FROM users WHERE id = $1';
    const { rows } = await pool.query(userCheckQuery, [decodedPayload.id]);

    if (rows.length === 0) {
      // User associated with this valid token no longer exists
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    // --- End Optional Database Check ---

    // 5. Attach decoded user payload to request object
    // The payload typically contains { id: user.id, role: user.role, ... }
    // Adjust based on what you put into the token during generation
    req.user = decodedPayload;

    // 6. Call next middleware/route handler
    next();

  } catch (err) {
    // 7. Handle verification errors (invalid signature, expired token, etc.)
    console.error("Token Verification Error:", err.message);
    if (err instanceof jwt.TokenExpiredError) {
        return res.status(403).json({ error: 'Forbidden: Token expired' });
    }
    if (err instanceof jwt.JsonWebTokenError) {
        return res.status(403).json({ error: 'Forbidden: Invalid token' });
    }
    // Handle unexpected errors during verification or DB check
    return res.status(500).json({ error: 'Internal Server Error during token authentication' });
  }
};
