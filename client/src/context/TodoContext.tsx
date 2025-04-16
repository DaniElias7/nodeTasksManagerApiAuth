// src/context/TodoContext.tsx
import React, { createContext, useReducer, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext'; // 

export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: Priority;
  createdAt: string;
}

interface TodoState {
  tasks: Task[];
  filter: 'all' | 'active' | 'completed';
  searchQuery: string;
}

type TodoAction =
  | { type: 'ADD_TASK'; payload: Task }
  | { type: 'EDIT_TASK'; payload: Task }
  | { type: 'DELETE_TASK'; payload: string }
  | { type: 'TOGGLE_COMPLETE'; payload: string }
  | { type: 'SET_FILTER'; payload: 'all' | 'active' | 'completed' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'LOAD_TASKS'; payload: Task[] };

const TodoContext = createContext<{
  state: TodoState;
  dispatch: React.Dispatch<TodoAction>;
} | undefined>(undefined);

const initialState: TodoState = {
  tasks: [],
  filter: 'all',
  searchQuery: '',
};

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TASK': // We'll handle this via API call and refetch
      return state;
    case 'EDIT_TASK': // We'll handle this via API call and refetch
      return state;
    case 'DELETE_TASK': // We'll handle this via API call and refetch
      return state;
    case 'TOGGLE_COMPLETE': // We'll handle this via API call and refetch
      return state;
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'LOAD_TASKS':
      return {
        ...state,
        tasks: action.payload,
      };
    default:
      return state;
  }
};

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(todoReducer, initialState);
  const { user, isAuthenticated } = useAuth();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;

  const fetchTasks = useCallback(async () => {
    if (isAuthenticated && user?.id) {
      try {
        const response = await fetch(`${backendUrl}/api/${user.id}/tasks`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          dispatch({ type: 'LOAD_TASKS', payload: data });
        } else {
          console.error('Failed to fetch tasks:', response);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    } else {
      dispatch({ type: 'LOAD_TASKS', payload: [] });
    }
  }, [isAuthenticated, user?.id, backendUrl, dispatch]);

  const addTask = async (text: string, priority: Priority) => {
    if (isAuthenticated && user?.id) {
      try {
        const response = await fetch(`${backendUrl}/api/${user.id}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, priority }),
          credentials: 'include',
        });
        if (response.ok) {
          fetchTasks(); // Re-fetch tasks to update the list
        } else {
          console.error('Failed to add task:', response);
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const updateTask = async (id: string, updatedTask: Partial<Task>) => {
    if (isAuthenticated && user?.id) {
      try {
        const response = await fetch(`${backendUrl}/api/${user.id}/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedTask),
          credentials: 'include',
        });
        if (response.ok) {
          fetchTasks(); // Re-fetch tasks to update the list
        } else {
          console.error('Failed to update task:', response);
        }
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  const deleteTask = async (id: string) => {
    if (isAuthenticated && user?.id) {
      try {
        const response = await fetch(`${backendUrl}/api/${user.id}/tasks/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          fetchTasks(); // Re-fetch tasks to update the list
        } else {
          console.error('Failed to delete task:', response);
        }
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  const toggleCompleteTask = async (id: string) => {
    const taskToUpdate = state.tasks.find(task => task.id === id);
    if (taskToUpdate) {
      await updateTask(id, { completed: !taskToUpdate.completed });
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  return (
    <TodoContext.Provider value={{ state, dispatch, addTask, updateTask, deleteTask, toggleCompleteTask, setFilter: (filter) => dispatch({ type: 'SET_FILTER', payload: filter }), setSearchQuery: (query) => dispatch({ type: 'SET_SEARCH_QUERY', payload: query }) }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodoContext = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error('useTodoContext must be used within a TodoProvider');
  }
  return context;
};