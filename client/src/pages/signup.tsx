// src/components/Signup.tsx
import React, { useState, FormEvent } from 'react';
import { useRouter } from 'next/router'; // Or your preferred way to handle navigation/redirection
import styles from '../styles/Auth.module.css'; // Using the provided CSS module

import Home from './index'; 

// Assuming TodoApp is another component you want to show on success
// import TodoApp from './TodoApp';

const Signup: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false); // To optionally show success state or redirect

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Input Validation ---
  const validateField = (fieldName: string, value: string) => {
    let fieldErrors = { ...errors };

    switch (fieldName) {
      case 'name':
        if (!value.trim()) {
          fieldErrors.name = 'Name is required.';
        } else {
          delete fieldErrors.name;
        }
        break;
      case 'email':
        if (!value.trim()) {
          fieldErrors.email = 'Email is required.';
        } else if (!emailRegex.test(value)) {
          fieldErrors.email = 'Invalid email format.';
        } else {
          delete fieldErrors.email;
        }
        break;
      case 'password':
        if (!value) {
          fieldErrors.password = 'Password is required.';
        } else if (value.length < 8) {
          fieldErrors.password = 'Password must be at least 8 characters long.';
        // Add more complex strength checks if needed (e.g., regex for uppercase, number, symbol)
        } else {
          delete fieldErrors.password;
        }
        break;
      default:
        break;
    }
    setErrors(fieldErrors);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setApiError(null); // Clear API error on input change

    if (name === 'name') setName(value);
    else if (name === 'email') setEmail(value);
    else if (name === 'password') setPassword(value);

    // Real-time validation on blur or change
    validateField(name, value);
  };

   // --- Form Submission ---
   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setApiError(null); // Clear previous API errors

    // Final validation check before submit
    validateField('name', name);
    validateField('email', email);
    validateField('password', password);

    // Check if any validation errors exist
    if (Object.keys(errors).length > 0 || !name || !email || !password) {
        setApiError("Please fix the errors in the form.");
        return; // Don't submit if validation errors exist
    }

    setIsLoading(true);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;
      const registerEndpoint = `${backendUrl}${process.env.NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT as string}`;

      const response = await fetch(registerEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      // Success Case (Created)
      if (response.status === 201) {
        console.log('Signup successful!');
        setIsSuccess(true);

      } else {
        // Error Case (e.g., 400 Bad Request, 409 Conflict, 500 Server Error)
        const errorData = await response.json(); // Assuming the server sends back JSON with an error message
        setApiError(errorData.message || `Error: ${response.status} - ${response.statusText}`);
      }
    } catch (error) {
      console.error('Signup fetch error:', error);
      setApiError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Render Logic ---

  // If signup was successful, you might want to render a different component or message
  if (isSuccess) {
    return <Home />; // Render the TodoApp
  }

  return (
    <div className={styles.authContainer}> {/* */}
      <div className={styles.authCard}> {/* */}
        <h2>Signup</h2>
        {apiError && <div className={styles.error}>{apiError}</div>} {/* */}
        <form onSubmit={handleSubmit} className={styles.authForm}> {/* */}
          <div className={styles.formGroup}> {/* */}
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.name}
              aria-describedby="name-error"
              className={errors.name ? styles.inputError : ''} // Optional: Add specific error class
            />
            {errors.name && <span id="name-error" className={styles.error}>{errors.name}</span>} {/* */}
          </div>

          <div className={styles.formGroup}> {/* */}
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              required
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
               className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span id="email-error" className={styles.error}>{errors.email}</span>} {/* */}
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
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              className={errors.password ? styles.inputError : ''}
            />
            {errors.password && <span id="password-error" className={styles.error}>{errors.password}</span>} {/* */}
          </div>

          <button
            type="submit"
            className={styles.authButton} //
            disabled={isLoading || Object.keys(errors).length > 0}
          >
            {isLoading ? 'Signing up...' : 'Signup'}
          </button>
        </form>
        {/* Optional: Add a link to the Login page */}
        <div className={styles.authFooter}> {/* */}
          Already have an account? <a href="/login">Login</a> {/* Adjust link as needed */}
        </div>
      </div>
    </div>
  );
};

export default Signup;