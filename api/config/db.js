import pkg from 'pg';
const { Pool } = pkg;

import 'dotenv/config';

const pool = new Pool({
  user: process.env.DB_USER,  
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,  
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // schema: process.env.DB_SCHEMA,
  searchPath: [process.env.DB_SCHEMA]
});

// Test the connection
export async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL database!');
    client.release();
  } catch (err) {
    console.error('Error acquiring client', err.stack);
  }
}

testConnection();

export default pool;