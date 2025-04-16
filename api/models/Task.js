import pool from '../config/db.js';

/**
 * Represents a Task model providing static methods for database operations
 * related to tasks.
 */
class Task {

  /**
 * Creates a new task in the database.
 *
 * @param {number|string} userId - The ID of the user creating the task.
 * @param {string} title - The title of the task (required).
 * @param {string|null} [description=null] - The optional description of the task.
 * @param {boolean} [completed=false] - Indicates if the task is completed or not. Defaults to false.
 * @returns {Promise<object>} A promise that resolves to the newly created task object.
 * @throws {Error} Throws an error if the database query fails.
 */
  static async create(userId, title, description = null, completed = false) {
    // Define the SQL query for inserting a new task, including the 'completed' column.
    // Using parameterized queries ($1, $2, $3, $4) to prevent SQL injection.
    // RETURNING * returns the complete row of the newly inserted task.
    const sql = `
      INSERT INTO tasks (user_id, title, description, completed)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    // Define the values to be inserted, matching the parameters ($1, $2, $3, $4).
    const params = [userId, title, description, completed];

    try {
      // Execute the query using the connection pool.
      const result = await pool.query(sql, params);
      console.log(`Task created successfully for user ${userId}`);
      return result.rows[0];

    } catch (err) {
      console.error(`Error creating task for user ${userId}:`, err.message, err.stack);
      throw new Error('Failed to create task due to database error.');
    }
  }

  /**
   * Retrieves all tasks belonging to a specific user.
   *
   * @param {number|string} userId - The ID of the user whose tasks are to be retrieved.
   * @returns {Promise<Array<object>>} A promise that resolves to an array of task objects.
   * Returns an empty array if the user has no tasks.
   * @throws {Error} Throws an error if the database query fails.
   */
  static async getAll(userId) {
    // Define the SQL query to select all tasks for a given user_id.
    // Using a parameterized query ($1) for the user_id.
    // Ordering by creation date (newest first) is often helpful.
    const sql = `
      SELECT * FROM tasks
      WHERE user_id = $1
      ORDER BY created_at DESC;
    `;
    // Define the parameter value for the query.
    const params = [userId];

    try {
      // Execute the query.
      const result = await pool.query(sql, params);
      // result.rows contains an array of all matching tasks.
      console.log(`Retrieved ${result.rows.length} tasks for user ${userId}`);
      return result.rows;
    } catch (err) {
      console.error(`Error retrieving tasks for user ${userId}:`, err.message, err.stack);
      throw new Error('Failed to retrieve tasks due to database error.');
    }
  }

  /**
   * Retrieves a single task by its ID, ensuring it belongs to the specified user.
   *
   * @param {number|string} id - The ID of the task to retrieve.
   * @param {number|string} userId - The ID of the user who owns the task.
   * @returns {Promise<object|null>} A promise that resolves to the task object if found,
   * or null if no task matches the ID and userId.
   * @throws {Error} Throws an error if the database query fails.
   */
  static async getById(id, userId) {
    // Define the SQL query to select a specific task by its id AND user_id.
    // This ensures users can only access their own tasks.
    // Using parameterized queries ($1, $2).
    const sql = `
      SELECT * FROM tasks
      WHERE id = $1 AND user_id = $2;
    `;
    // Define the parameter values.
    const params = [id, userId];

    try {
      const result = await pool.query(sql, params);
      // Check if a task was found (result.rows will have one item or be empty).
      if (result.rows.length > 0) {
        console.log(`Task with ID ${id} found for user ${userId}`);
        return result.rows[0]; // Return the found task object.
      } else {
        console.log(`Task with ID ${id} not found for user ${userId}`);
        return null; // Return null if no matching task was found.
      }
    } catch (err) {
      console.error(`Error retrieving task ${id} for user ${userId}:`, err.message, err.stack);
      throw new Error('Failed to retrieve task due to database error.');
    }
  }

  /**
   * Updates an existing task identified by its ID and user ID.
   * Allows updating title, description, and completed status.
   *
   * @param {number|string} id - The ID of the task to update.
   * @param {number|string} userId - The ID of the user who owns the task.
   * @param {object} updates - An object containing the fields to update.
   * Example: { title?: string, description?: string|null, completed?: boolean }
   * @returns {Promise<object|null>} A promise that resolves to the updated task object if successful,
   * or null if the task was not found for the given user.
   * @throws {Error} Throws an error if the database query fails or if no update fields are provided.
   */
  static async update(id, userId, updates) {
    // Get the keys of the fields provided in the 'updates' object.
    const updateFields = Object.keys(updates);

    // Filter out keys where the value is undefined (optional, depends on desired behavior)
    const validFields = updateFields.filter(key => updates[key] !== undefined && ['title', 'description', 'completed'].includes(key));

    // If no valid fields to update are provided, throw an error or return early.
    if (validFields.length === 0) {
      console.log(`No valid fields provided for updating task ${id}`);
      // Option 1: Throw an error
      // throw new Error('No valid fields provided for update.');
      // Option 2: Return null or indicate no change (depends on desired API)
       return null; // Indicating no update occurred or was necessary
    }

    // Dynamically construct the SET part of the SQL query.
    // Start parameter index from 3 because $1 is id and $2 is userId.
    const setClauses = validFields
      .map((field, index) => `${field} = $${index + 3}`)
      .join(', '); // e.g., "title = $3, completed = $4"

    // Construct the full SQL query.
    // RETURNING * returns the updated task row.
    const sql = `
      UPDATE tasks
      SET ${setClauses}
      WHERE id = $1 AND user_id = $2
      RETURNING *;
    `;

    // Construct the parameters array.
    // The order must match the SQL query: [id, userId, valueForField1, valueForField2, ...]
    const params = [
        id,
        userId,
        ...validFields.map(field => updates[field])
    ];

    try {
      // Execute the update query.
      const result = await pool.query(sql, params);

      // Check if any row was actually updated and returned.
      if (result.rows.length > 0) {
        console.log(`Task ${id} updated successfully for user ${userId}`);
        return result.rows[0]; // Return the updated task object.
      } else {
        // This means the WHERE clause (id = $1 AND user_id = $2) didn't match any row.
        console.log(`Task ${id} not found for update for user ${userId}`);
        return null; // Return null indicating the task wasn't found or didn't belong to the user.
      }
    } catch (err) {
      // Log the error.
      console.error(`Error updating task ${id} for user ${userId}:`, err.message, err.stack);
      // Handle potential data type mismatches or other DB errors.
      // Re-throw the error.
      throw new Error('Failed to update task due to database error.');
    }
  }

  /**
   * Deletes a task identified by its ID, ensuring it belongs to the specified user.
   *
   * @param {number|string} id - The ID of the task to delete.
   * @param {number|string} userId - The ID of the user who owns the task.
   * @returns {Promise<boolean>} A promise that resolves to true if the task was successfully deleted,
   * false if the task was not found for the given user.
   * @throws {Error} Throws an error if the database query fails.
   */
  static async delete(id, userId) {
    // Define the SQL query to delete a task by id AND user_id.
    // Using parameterized queries ($1, $2).
    const sql = `
      DELETE FROM tasks
      WHERE id = $1 AND user_id = $2;
    `;
    // Define the parameter values.
    const params = [id, userId];

    try {
      // Execute the delete query.
      const result = await pool.query(sql, params);

      // Check if any row was actually deleted. result.rowCount provides this.
      if (result.rowCount > 0) {
        console.log(`Task ${id} deleted successfully for user ${userId}`);
        return true; // Return true indicating successful deletion.
      } else {
        // This means the WHERE clause (id = $1 AND user_id = $2) didn't match any row.
        console.log(`Task ${id} not found for deletion for user ${userId}`);
        return false; // Return false indicating the task wasn't found or didn't belong to the user.
      }
    } catch (err) {
      // Log the error.
      console.error(`Error deleting task ${id} for user ${userId}:`, err.message, err.stack);
      // Re-throw the error.
      throw new Error('Failed to delete task due to database error.');
    }
  }
}

// Export the Task class to be used by controllers.
export default Task;