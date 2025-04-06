// server.js
import express from 'express';
import { testConnection } from './config/db.js'; 
import 'dotenv/config';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Server Startup
const startServer = async () => {
  await testConnection
  app.listen(PORT, () => 
    console.log(`🚀 Server running on port http://localhost:${PORT}`)
  );
};

startServer();