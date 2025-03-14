import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../styles/Register.module.css';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    
    try {
      // Aquí iría la llamada a tu API de registro
      // await api.post('/auth/register', { name, email, password });
      alert('Registro exitoso! Por favor inicia sesión');
      navigate('/login');
    } catch (error) {
      alert('Error en el registro');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className={styles.loginContainer}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Crear Cuenta</h2>
        
        <input
          type="text"
          className={styles.inputField}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre completo"
          required
        />
        
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
          placeholder="Contraseña"
          required
        />
        
        <input
          type="password"
          className={styles.inputField}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirmar contraseña"
          required
        />

        <div className={styles.buttonContainer}>
          <button type="submit" className={styles.submitButton}>
            Registrarse
          </button>
          <button 
            type="button" 
            className={styles.signUpButton}
            onClick={handleLoginRedirect}
          >
            ¿Ya tienes cuenta? Inicia Sesión
          </button>
        </div>
      </form>
    </div>
  );
};