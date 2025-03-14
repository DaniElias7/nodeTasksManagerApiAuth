import express from 'express';
import { 
  createTask,
  getTasks,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { authenticate, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(authenticate);

router.route('/')
  .post(createTask)
  .get(getTasks);

router.route('/:id')
  .put(updateTask)
  .delete(authorize('admin'), deleteTask);

export default router;