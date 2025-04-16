import { useEffect } from 'react';
import { useTodoContext } from '../context/TodoContext';

export const useLocalStorage = () => {
  const { state, dispatch } = useTodoContext();

  // Load tasks from localStorage on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        dispatch({ type: 'LOAD_TASKS', payload: parsedTasks });
      } catch (error) {
        console.error('Failed to parse tasks from localStorage', error);
      }
    }
  }, [dispatch]);

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
  }, [state.tasks]);
};