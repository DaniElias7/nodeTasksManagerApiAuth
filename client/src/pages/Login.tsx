import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Login.module.css';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      let {user, token} = await login(email, password);
      console.log("User authenticated: ", user);
    } catch (error) {
      console.log(error);
      alert('Error al iniciar sesión');
    }
  };

  const handleSignUp = () => {
    navigate('/register'); // Asume que tienes una ruta '/register' configurada
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <input
          type="email"
          className={styles.inputField}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className={styles.inputField}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitButton} onClick={handleSubmit}>
            Login
          </button>
          <button 
            type="button" 
            className={styles.signUpButton}
            onClick={handleSignUp}
          >
            Sign Up
          </button>
        </div>
      </form>
    </div>
  );
};