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

    res.cookie('authToken', token, {
      path: '/'
    });
    
    // 5. Send Response
    res.status(201).json({
        id: newUser.id, // Use id from PG
        name: newUser.name,
        email: newUser.email
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

  console.log("Starting to login user: ", { email, password });

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
    console.log("Generated Token:", token);

    console.log("Attempting to set cookie...");
    
    res.cookie('authToken', token, {
      path: '/'
    });
    console.log("Cookie set attempt completed.");

    console.log("Response Headers before sending:", res.getHeaders());

    // 5. Send Response
    res.status(201).json({
      id: user.id, // Use id from PG
      name: user.name,
      email: user.email
    });

    console.log("User logged in successfully: ", user); // Log the user data

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: 'Server error during login.' });
  }
};

// --- Logout Route ---
export const logout = async (req, res) => {
  try {
    // Clear the authToken cookie
    res.clearCookie('authToken', { path: '/' });

    // Send a success response
    res.status(200).json({ message: 'Logged out successfully.' });

    console.log("User logged out.");

  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: 'Server error during logout.' });
  }
};

// --- Auth me Route --- Check Auth Cookie
export const checkAuthCookie = async (req, res) => {
  console.log("Checking auth cookie...");

  try {
    // The authenticateToken middleware has already verified the token
    // and attached the decoded payload to req.user.
    const userId = req.user.id; // Assuming your JWT payload has a 'id' property

    // Fetch the user from the database
    const userQuery = 'SELECT id, name, email FROM users WHERE id = $1'; // Adjust the columns you want to return
    const { rows } = await pool.query(userQuery, [userId]);

    if (rows.length === 1) {
      // User found, send back the user data
      const user = rows[0];
      res.status(200).json(user);
    } else {
      // This should ideally not happen if your authenticateToken middleware
      // includes the optional database check.
      return res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
