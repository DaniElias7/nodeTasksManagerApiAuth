import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // For password hashing
import dotenv from 'dotenv';

import pool from '../config/db.js'; // Import the PostgreSQL connection pool

dotenv.config(); // Load environment variables from .env file

// --- JWT Generation ---
// Adjusted to use user.id from PostgreSQL
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    console.error("FATAL ERROR: JWT_SECRET is not defined.");
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return jwt.sign(
    { id: user.id }, // Use id from PG
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};


// --- Registration Route ---
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  console.log("Starting to register user: ", { name, email, password });

  // Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  try {
    // 1. Check if user already exists
    const checkUserQuery = 'SELECT email FROM public.users WHERE email = $1';
    const existingUser = await pool.query(checkUserQuery, [email]);

    if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Email already in use.' });
    }

    // --- Email Format Validation ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email format.' });
    }
    // --- End Email Format Validation ---

    // 2. Hash the password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Insert the new user
    // Assuming your table is named 'users' and columns are 'name', 'email', 'password_hash'
    // The RETURNING clause gets the newly created user's data
    const insertQuery = `
        INSERT INTO public.users (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email;
    `;
    const values = [name, email, hashedPassword];
    const result = await pool.query(insertQuery, values);
    const newUser = result.rows[0]; // The user data returned by RETURNING

    // 4. Generate JWT
    const token = generateToken(newUser);

    // 5. Send Response
    res.status(201).json({
        id: newUser.id, // Use id from PG
        name: newUser.name,
        email: newUser.email,
        token: token
    });

    console.log("User created Succesfully: ", newUser); // Log the new user data

  } catch (error) {
      console.error("Registration Error:", error);
      // Handle specific DB errors if needed (e.g., unique constraint violation)
      if (error.code === '23505') { // PostgreSQL unique violation error code
          return res.status(400).json({ error: 'Email already exists.' });
      }
      res.status(500).json({ error: 'Server error during registration.' }); // Generic error for others
  }
};

// --- Login Route ---
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Find user by email
    // Select necessary fields including the password hash for comparison
    const selectQuery = `
      SELECT id, name, email, password_hash 
      FROM public.users 
      WHERE email = $1;
    `;
    const result = await pool.query(selectQuery, [email]);
    const user = result.rows[0]; // Get the first row (user)

    // 2. Check if user exists
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' }); // Generic message
    }

    // 3. Compare provided password with stored hash
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' }); // Generic message
    }

    // 4. Generate JWT
    const token = generateToken(user);

    // 5. Send Response
    res.json({
      id: user.id, // Use id from PG
      name: user.name,
      email: user.email,
      token: token
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

