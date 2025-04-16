import React from 'react';
import { useTodoContext } from '../context/TodoContext';
import styles from '../styles/ProgressBar.module.css';

const ProgressBar = () => {
  const { state } = useTodoContext();
  const { tasks } = state;

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressInfo}>
        <span>
          {completedTasks} of {totalTasks} tasks completed
        </span>
        <span>{progress}%</span>
      </div>
      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${progress}%` }}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;