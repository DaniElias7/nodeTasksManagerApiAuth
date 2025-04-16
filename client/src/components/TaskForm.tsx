import React, { useState } from 'react';
import { Priority, useTodoContext } from '../context/TodoContext';
import styles from '../styles/TaskForm.module.css';

const TaskForm = () => {
  const [taskText, setTaskText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const { addTask } = useTodoContext(); // Get the addTask function from the context

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    addTask(taskText, priority); // Call the addTask function with the form values
    setTaskText('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Add a new task..."
        aria-label="Add a new task"
        className={styles.input}
        required
      />
      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value as Priority)}
        className={styles.prioritySelect}
        aria-label="Select task priority"
      >
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit" className={styles.addButton}>
        Add Task
      </button>
    </form>
  );
};

export default TaskForm;