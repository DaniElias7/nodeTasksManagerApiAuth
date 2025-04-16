import express from 'express';
import TaskController from '../controllers/taskController.js';

import { authenticateToken } from '../middlewares/authenticateToken.js'; // Middleware to authenticate user tokens

// This router will handle all routes starting with the base path defined in server.js (e.g., /api/:user_id/).
const router = express.Router();

// --- Route Definitions ---

/*
 * @route   POST /api/:user_id/tasks
 * @desc    Create a new task for the authenticated user.
 * @access  Private (Requires Authentication - Assuming middleware like authenticateToken)
 * @input   Request body should contain { title: string, description?: string }
 * @output  JSON object of the newly created task or error object.
 * @errors  Handles errors from the controller (e.g., validation, database errors).
 */
router.post(
  '/tasks',
  authenticateToken, 
  TaskController.createTask // Maps the route to the createTask function in the controller
);

/*
 * @route   GET /api/:user_id/tasks
 * @desc    Get all tasks for the authenticated user.
 * @access  Private (Requires Authentication)
 * @input   None (User ID typically extracted from auth token in middleware/controller).
 * @output  JSON array of task objects or error object.
 * @errors  Handles errors from the controller.
 */
router.get(
  '/tasks',
  authenticateToken, 
  TaskController.getAllTasks // Maps the route to the getAllTasks function
);

/*
 * @route   GET /api/:user_id/tasks/:id
 * @desc    Get a specific task by its ID, belonging to the authenticated user.
 * @access  Private (Requires Authentication)
 * @input   Task ID from URL parameter (`req.params.id`).
 * @output  JSON object of the specific task or error object (e.g., 404 Not Found).
 * @errors  Handles errors from the controller (e.g., task not found, database errors).
 */
router.get(
  '/tasks/:id', // ':id' defines a URL parameter named 'id'
  authenticateToken, 
  TaskController.getTaskById // Maps the route to the getTaskById function
);

/*
 * @route   PUT /api/:user_id/tasks/:id
 * @desc    Update a specific task by its ID, belonging to the authenticated user.
 * @access  Private (Requires Authentication)
 * @input   Task ID from URL parameter (`req.params.id`).
 * Request body should contain fields to update, e.g., { title?: string, description?: string, completed?: boolean }
 * @output  JSON object of the updated task or error object (e.g., 404 Not Found).
 * @errors  Handles errors from the controller (e.g., validation, task not found).
 */
router.put(
  '/tasks/:id', // Uses the ':id' URL parameter
  authenticateToken, 
  TaskController.updateTask // Maps the route to the updateTask function
);

/*
 * @route   DELETE /api/:user_id/tasks/:id
 * @desc    Delete a specific task by its ID, belonging to the authenticated user.
 * @access  Private (Requires Authentication)
 * @input   Task ID from URL parameter (`req.params.id`).
 * @output  Success message (e.g., 200 OK or 204 No Content) or error object (e.g., 404 Not Found).
 * @errors  Handles errors from the controller (e.g., task not found).
 */
router.delete(
  '/tasks/:id', // Uses the ':id' URL parameter
  authenticateToken, 
  TaskController.deleteTask // Maps the route to the deleteTask function
);

// Export the configured router instance to be used by the main server file (server.js).
export default router;