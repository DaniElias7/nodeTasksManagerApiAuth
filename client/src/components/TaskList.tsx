import React from 'react';
import { useTodoContext } from '../context/TodoContext';
import TaskItem from './TaskItem';
import styles from '../styles/TaskList.module.css';

const TaskList = () => {
  const { state } = useTodoContext();
  const { tasks, filter, searchQuery } = state;

  const filteredTasks = tasks.filter(task => {
    // Apply filter
    if (filter === 'completed' && !task.completed) return false;
    if (filter === 'active' && task.completed) return false;

    // Apply search
    if (searchQuery && !task.text.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <ul className={styles.taskList}>
      {filteredTasks.length > 0 ? (
        filteredTasks.map(task => (
          <TaskItem key={task.id} task={task} />
        ))
      ) : (
        <li className={styles.emptyMessage}>No tasks found. Add a new task!</li>
      )}
    </ul>
  );
};

export default TaskList;