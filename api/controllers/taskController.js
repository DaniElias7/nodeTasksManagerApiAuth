// Import the Task model which contains the database logic
import Task from '../models/Task.js';

/**
 * TaskController handles incoming HTTP requests related to tasks,
 * interacts with the Task model, and sends back appropriate HTTP responses.
 *
 * It assumes that authentication middleware has run beforehand and populated
 * `req.user` with the authenticated user's information (specifically `req.user.id`).
 */
class TaskController {

  /**
   * Handles the creation of a new task.
   * @param {object} req - Express request object. Expected properties:
   * - req.body: { title: string, description?: string }
   * - req.user: { id: number|string } (populated by auth middleware)
   * @param {object} res - Express response object. Used to send back the response.
   * @returns {Promise<void>} Sends a JSON response (new task or error).
   */
  async createTask(req, res) {
    try {
      // Extract required 'title' and optional 'description' from the request body.
      const { title, description } = req.body;
      // Extract the user ID from the request object (populated by authentication middleware).
      // If req.user or req.user.id is not present, auth middleware likely hasn't run or failed.
      const userId = req.user?.id;

      // --- Input Validation ---
      // Basic validation: Ensure title is provided.
      if (!title) {
        console.log('Create task attempt failed: Title missing.');
        // Send a 400 Bad Request response if validation fails.
        return res.status(400).json({ message: 'Title is required.' });
      }

       // Ensure userId was actually found (indicating successful authentication prior)
      if (!userId) {
          console.error('Create task failed: User ID not found in request. Check authentication middleware.');
          // This should technically not be reachable if auth middleware is enforced correctly on the route
          return res.status(401).json({ message: 'Authentication required.' });
      }

      // --- Model Interaction ---
      // Call the static 'create' method on the Task model to insert the new task.
      const newTask = await Task.create(userId, title, description);

      // --- Response ---
      // Send a 201 Created status code along with the newly created task object.
      console.log(`Task created successfully with ID: ${newTask.id} for user: ${userId}`);
      res.status(201).json(newTask);

    } catch (error) {
      console.error('Error in createTask controller:', error.message, error.stack);
      // Send a generic 500 Internal Server Error response to the client.
      // Avoid sending detailed error messages to the client in production.
      res.status(500).json({ message: 'Failed to create task due to server error.' });
    }
  }

  /**
   * Handles retrieving all tasks for the authenticated user.
   * @param {object} req - Express request object. Expected properties:
   * - req.user: { id: number|string } (populated by auth middleware)
   * @param {object} res - Express response object. Used to send back the response.
   * @returns {Promise<void>} Sends a JSON response (array of tasks or error).
   */
  async getAllTasks(req, res) {
    try {
      // Extract the user ID from the authenticated user's information.
      const userId = req.user?.id;

       // Ensure userId was found
      if (!userId) {
          console.error('Get all tasks failed: User ID not found in request. Check authentication middleware.');
          return res.status(401).json({ message: 'Authentication required.' });
      }

      // --- Model Interaction ---
      // Call the static 'getAll' method on the Task model to fetch tasks for this user.
      const tasks = await Task.getAll(userId);

      // --- Response ---
      // Send a 200 OK status code with the array of tasks.
      // If the user has no tasks, this will correctly send back an empty array ([]).
      console.log(`Retrieved ${tasks.length} tasks for user: ${userId}`);
      res.status(200).json(tasks);

    } catch (error) {
      // --- Error Handling ---
      console.error('Error in getAllTasks controller:', error.message, error.stack);
      res.status(500).json({ message: 'Failed to retrieve tasks due to server error.' });
    }
  }

  /**
   * Handles retrieving a single task by its ID for the authenticated user.
   * @param {object} req - Express request object. Expected properties:
   * - req.params: { id: string } (task ID from URL)
   * - req.user: { id: number|string } (populated by auth middleware)
   * @param {object} res - Express response object. Used to send back the response.
   * @returns {Promise<void>} Sends a JSON response (single task, 404, or error).
   */
  async getTaskById(req, res) {
    try {
      // Extract the task ID from URL parameters.
      const taskIdParam = req.params.id;
      // Extract the user ID from the authenticated user.
      const userId = req.user?.id;

      // --- Input Validation ---
      // Attempt to parse the taskId as an integer.
      // Use appropriate validation if your IDs are UUIDs (e.g., regex or a library).
      const taskId = parseInt(taskIdParam, 10);
      if (isNaN(taskId)) {
        console.log(`Get task by ID failed: Invalid ID format received - ${taskIdParam}`);
        return res.status(400).json({ message: 'Invalid task ID format.' });
      }

      // Ensure userId was found
      if (!userId) {
          console.error('Get task by ID failed: User ID not found in request. Check authentication middleware.');
          return res.status(401).json({ message: 'Authentication required.' });
      }


      // --- Model Interaction ---
      // Call the static 'getById' method, passing both task and user IDs
      // to ensure the user owns the task.
      const task = await Task.getById(taskId, userId);

      // --- Response ---
      if (task) {
        // Task found and belongs to the user, send 200 OK with the task data.
        console.log(`Retrieved task ID: ${taskId} for user: ${userId}`);
        res.status(200).json(task);
      } else {
        // Task not found for this user (either doesn't exist or belongs to someone else).
        console.log(`Task ID: ${taskId} not found for user: ${userId}`);
        res.status(404).json({ message: 'Task not found.' });
      }
    } catch (error) {
      // --- Error Handling ---
      console.error('Error in getTaskById controller:', error.message, error.stack);
      res.status(500).json({ message: 'Failed to retrieve task due to server error.' });
    }
  }

  /**
   * Handles updating an existing task by its ID for the authenticated user.
   * @param {object} req - Express request object. Expected properties:
   * - req.params: { id: string } (task ID from URL)
   * - req.body: object containing fields to update (e.g., { title?, description?, completed? })
   * - req.user: { id: number|string } (populated by auth middleware)
   * @param {object} res - Express response object. Used to send back the response.
   * @returns {Promise<void>} Sends a JSON response (updated task, 404, or error).
   */
  async updateTask(req, res) {
    try {
      // Extract task ID and validate format.
      const taskIdParam = req.params.id;
      const taskId = parseInt(taskIdParam, 10);
       // Extract user ID.
      const userId = req.user?.id;
       // Extract the updates object from the request body.
      const updates = req.body;

      // --- Input Validation ---
      if (isNaN(taskId)) {
        console.log(`Update task failed: Invalid ID format received - ${taskIdParam}`);
        return res.status(400).json({ message: 'Invalid task ID format.' });
      }

      // Ensure userId was found
      if (!userId) {
          console.error('Update task failed: User ID not found in request. Check authentication middleware.');
          return res.status(401).json({ message: 'Authentication required.' });
      }

      // Optional: Check if the updates object is empty or contains invalid fields here,
      // although the Model currently handles empty/invalid fields gracefully by returning null.
      // if (Object.keys(updates).length === 0) {
      //   return res.status(400).json({ message: 'No update data provided.' });
      // }


      // --- Model Interaction ---
      // Call the static 'update' method on the Task model.
      // The model handles checking ownership (via userId) and applying valid updates.
      const updatedTask = await Task.update(taskId, userId, updates);

      // --- Response ---
      if (updatedTask) {
        // Task found, updated, and returned by the model. Send 200 OK.
         console.log(`Updated task ID: ${taskId} for user: ${userId}`);
        res.status(200).json(updatedTask);
      } else {
        // Task not found for this user, or no valid fields were provided for update.
        console.log(`Task ID: ${taskId} not found for update for user: ${userId}`);
        // Sending 404 is appropriate as the resource identified by the URL wasn't found *for this user* to update.
        res.status(404).json({ message: 'Task not found or no valid update fields provided.' });
      }
    } catch (error) {
      // --- Error Handling ---
      console.error('Error in updateTask controller:', error.message, error.stack);
      res.status(500).json({ message: 'Failed to update task due to server error.' });
    }
  }

  /**
   * Handles deleting a task by its ID for the authenticated user.
   * @param {object} req - Express request object. Expected properties:
   * - req.params: { id: string } (task ID from URL)
   * - req.user: { id: number|string } (populated by auth middleware)
   * @param {object} res - Express response object. Used to send back the response.
   * @returns {Promise<void>} Sends a 204 No Content response on success, or 404/error.
   */
  async deleteTask(req, res) {
    try {
      // Extract task ID and validate format.
      const taskIdParam = req.params.id;
      const taskId = parseInt(taskIdParam, 10);
      // Extract user ID.
      const userId = req.user?.id;

      // --- Input Validation ---
      if (isNaN(taskId)) {
         console.log(`Delete task failed: Invalid ID format received - ${taskIdParam}`);
        return res.status(400).json({ message: 'Invalid task ID format.' });
      }

       // Ensure userId was found
      if (!userId) {
          console.error('Delete task failed: User ID not found in request. Check authentication middleware.');
          return res.status(401).json({ message: 'Authentication required.' });
      }

      // --- Model Interaction ---
      // Call the static 'delete' method on the Task model.
      // The model handles checking ownership (via userId).
      const wasDeleted = await Task.delete(taskId, userId);

      // --- Response ---
      if (wasDeleted) {
        // Deletion successful. Send 204 No Content status.
        console.log(`Deleted task ID: ${taskId} for user: ${userId}`);
        res.status(204).send();
      } else {
        // Task not found for this user.
        console.log(`Task ID: ${taskId} not found for deletion for user: ${userId}`);
        res.status(404).json({ message: 'Task not found.' });
      }
    } catch (error) {
      // --- Error Handling ---
      console.error('Error in deleteTask controller:', error.message, error.stack);
      res.status(500).json({ message: 'Failed to delete task due to server error.' });
    }
  }
}

// This instance will be used in the route definitions (e.g., routes/taskRoutes.js).
export default new TaskController();