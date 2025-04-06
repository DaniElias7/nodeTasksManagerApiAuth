import express from 'express';
import { authenticate, adminOnly } from '../middlewares/auth.js';
import { getUsers, getUserProfile } from '../controllers/userController.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', getUserProfile);
router.get('/all', adminOnly, getUsers);

export default router;