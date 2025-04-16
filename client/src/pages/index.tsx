import ProtectedRoute from '../components/ProtectedRoute';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import FilterBar from '../components/FilterBar';
import ProgressBar from '../components/ProgressBar';
import Head from 'next/head';
import styles from '../styles/Home.module.css';

const Home = () => {
  return (
    <ProtectedRoute>
      <TodoApp />
    </ProtectedRoute>
  );
};

const TodoApp = () => {
  useLocalStorage();
  const { logout } = useAuth();

  return (
    <div className={styles.container}>
      <Head>
        <title>Todo App</title>
      </Head>

      <header className={styles.header}>
        <h1>Task Manager</h1>
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </header>

      <main className={styles.main}>
        <TaskForm />
        <ProgressBar />
        <FilterBar />
        <TaskList />
      </main>
    </div>
  );
};

export default Home;