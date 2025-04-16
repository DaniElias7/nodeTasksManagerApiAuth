import pool from '../config/db'; // Import the pre-configured pg.Pool instance
/**
 * Middleware factory function to generate permission-checking middleware.
 * It uses an imported, pre-configured pg.Pool instance.
 *
 * @param {string} requiredPermission - The name of the permission required to access the route
 * (e.g., 'read:users', 'write:posts'). This should match
 * a 'name' value in your 'permissions' table.
 *
 * @returns {Function} An Express middleware function `(req, res, next) => void`.
 *
 * @throws {Error} If requiredPermission is not provided when calling the factory.
 */

export const checkPermission = (requiredPermission) => {
  // Ensure a permission name was actually passed when setting up the middleware
  if (!requiredPermission) {
    throw new Error('Required permission must be provided to checkPermission middleware');
  }

  /**
   * The actual Express middleware function.
   *
   * @input req {object} - The Express request object. Expected to have `req.user.id` populated
   * by a preceding authentication middleware.
   * req.user {object} - Object containing authenticated user data.
   * req.user.id {number | string} - The ID of the authenticated user.
   *
   * @input res {object} - The Express response object. Used to send error responses.
   *
   * @input next {function} - The callback function to pass control to the next middleware
   * or route handler if the permission check is successful.
   *
   * @output Calls `next()` if the user has the required permission.
   * @output Sends a 403 Forbidden response if the user lacks the permission.
   * @output Sends a 401 Unauthorized response if `req.user` or `req.user.id` is missing.
   * @output Sends a 500 Internal Server Error response for database or other unexpected errors.
   */
  return async (req, res, next) => {
    // --- Input Validation: Check for authenticated user ---
    if (!req.user || typeof req.user.id === 'undefined') {
      console.warn('Permission Check Middleware: req.user or req.user.id is missing. Ensure authentication middleware runs first.');
      return res.status(401).json({
        status: 'error',
        message: 'Unauthorized: User information not found.',
      });
    }

    const userId = req.user.id;
    let client; // Declare client variable outside try block for access in finally

    try {
      // Database Interaction: Check Permission using the imported pool ---
      // Get a client connection from the *imported* pool
      client = await pool.connect(); // Uses the pool imported at the top

      // Prepare the SQL query (same as before)
      const permissionCheckQuery = `
        SELECT 1 -- Select a constant value (1) just to check for existence
        FROM user_permissions up
        JOIN permissions p ON up.permission_id = p.id
        WHERE up.user_id = $1 AND p.name = $2
        LIMIT 1; -- Optimization: We only need to know if at least one row exists
      `;

      // Execute the query with the userId and requiredPermission as parameters
      const result = await client.query(permissionCheckQuery, [userId, requiredPermission]);

      // Process Result (same as before) ---
      if (result.rowCount > 0) {
        // User has the required permission
        next();
      } else {
        // User does NOT have the required permission
        console.warn(`Permission Denied: User ID ${userId} lacks permission '${requiredPermission}' for ${req.method} ${req.originalUrl}`);
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: You do not have permission to perform this action.',
        });
      }

    } catch (error) {
      // Error Handling (same as before) 
      console.error(`Permission Check Error: Failed to check permission '${requiredPermission}' for user ID ${userId}.`, error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal Server Error: Could not verify permissions.',
      });

    } finally {
      // Cleanup (same as before)
      // Release the client connection back to the pool
      if (client) {
        client.release();
      }
    }
  };
};


// Export the middleware factory function
