import express from 'express';
import {
    getAllTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
} from '../controllers/taskController.js'; // We'll create this controller file

import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router({ mergeParams: true }); // Enable access to user_id param

// Protect these routes with authentication
router.use(authenticateToken);

router.get('/tasks', getAllTasks);
router.get('/tasks/:id', getTaskById);
router.post('/tasks', createTask);
router.put('/tasks/:id', updateTask);
router.delete('/tasks/:id', deleteTask);

export default router;