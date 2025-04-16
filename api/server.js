// server.js
import express from 'express';
import { testConnection } from './config/db.js'; 
import 'dotenv/config';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth/', authRoutes); // signup and login routes

app.use('/api/:user_id/', taskRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Testing the connection to PostgreSQL
app.get('/db-test', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        current_database() AS database,
        current_schema() AS schema,
        (SELECT to_regclass('public.users')) AS table_exists
    `);
    console.log("Resultado do teste:", result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Erro no teste:", error);
    res.status(500).json({ error: "Falha na conexão" });
  }
});

// Server Startup
const startServer = async () => {
  await testConnection
  app.listen(PORT, () => 
    console.log(`🚀 Server running on port http://localhost:${PORT}`)
  );
};

startServer();