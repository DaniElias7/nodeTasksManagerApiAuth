import express from 'express';
import { register, login, checkAuthCookie, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authenticateToken.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout)

router.get('/me', authenticateToken, checkAuthCookie)

export default router;