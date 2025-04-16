import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

import pool from '../config/db.js'; // Adjust the import based on your project structure

dotenv.config(); // Ensure environment variables are loaded

/**
 * Express middleware to authenticate requests using JWT from an httpOnly cookie.
 *
 * Verifies the JWT token found in the 'authToken' cookie.
 * If valid, attaches the decoded user payload to `req.user`.
 * Optionally checks if the user still exists in the database.
 *
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
export const authenticateToken = async (req, res, next) => {
  console.log("Authenticating token...");

  // 1. Get token from cookies
  const token = req.cookies.authToken;
  console.log("COOKIES: ", req.cookies)
  // 2. Check if token exists in cookies
  if (!token) {
    // No token provided in cookies
    console.error("No token found in cookies.");
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

    // Database Check
    // 4. Check if user from token still exists in the database
    // This prevents using tokens for users who have been deleted after token issuance.
    const userCheckQuery = 'SELECT id FROM users WHERE id = $1';
    const { rows } = await pool.query(userCheckQuery, [decodedPayload.id]);

    if (rows.length === 0) {
      // User associated with this valid token no longer exists
      console.error("User not found in database:", decodedPayload.id);
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    // --- End Optional Database Check ---

    // 5. Attach decoded user payload to request object
    req.user = decodedPayload;

    console.log("Token verified successfully:", req.user); // Log the decoded user data
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
}