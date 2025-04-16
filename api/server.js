import express from 'express';
import { testConnection } from './config/db.js'; 
import 'dotenv/config';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

const clientOrigin = process.env.NEXT_PUBLIC_FRONTEND_URL;

// Middlewares
app.use(cookieParser())
app.use(express.json());

const corsOptions = {
  origin: clientOrigin, // Allow requests from the client origin
  credentials: true, // This is important for allowing cookies to be sent and received
};

app.use(cors(corsOptions));

// Routes
app.use('/api/auth/', authRoutes); // signup and login routes

app.use('/api/:user_id/', taskRoutes);

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