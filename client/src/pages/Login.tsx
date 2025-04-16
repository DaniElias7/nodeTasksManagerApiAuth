// src/components/Login.tsx
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router'; // For redirection after successful login
import styles from '../styles/Auth.module.css'; // Using the provided CSS module

import { useAuth } from '../context/AuthContext'; // Importing AuthContext for authentication

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter(); // Initialize router for navigation

  const { login } = useAuth(); // Using the login function from AuthContext

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validateForm = (): boolean => {
    if (!email.trim() || !password.trim()) {
        setApiError('Email and password are required.');
        return false;
    }
    if (!emailRegex.test(email)) {
        setApiError('Invalid email format.');
        return false;
    }
    
    setApiError(null); // Clear error if validation passes
    return true;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiError(null); // Clear API error on input change

    if (name === 'email') setEmail(value);
    else if (name === 'password') setPassword(value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return; // Stop submission if basic validation fails
    }

    setIsLoading(true);

    try {
      await login(email, password); // Call the login function from AuthContext
      router.push('/'); 

    }  catch (err: any) {
      console.error('Login error:', err);
      setApiError(err.message || 'Failed to login. Please try again.'); // Handle any error thrown by the context's login function
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}> {/* */}
      <div className={styles.authCard}> {/* */}
        <h2>Login</h2>
        {apiError && <div className={styles.error}>{apiError}</div>} {/* */}
        <form onSubmit={handleSubmit} className={styles.authForm}> {/* */}
          <div className={styles.formGroup}> {/* */}
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              required
              aria-describedby="login-error" // Describe relation to the main error display
            />
          </div>

          <div className={styles.formGroup}> {/* */}
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              required
              aria-describedby="login-error"
            />
          </div>

          <button
            type="submit"
            className={styles.authButton} //
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <div className={styles.authFooter}> {/* */}
          Don't have an account? <a href="/signup">Signup</a> {/* Adjust link as needed */}
        </div>
      </div>
    </div>
  );
};

export default Login;