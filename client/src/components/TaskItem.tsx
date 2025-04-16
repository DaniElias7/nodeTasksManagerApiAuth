import React, { useState } from 'react';
import { useTodoContext } from '../context/TodoContext';
import styles from '../styles/TaskItem.module.css';

interface TaskItemProps {
  task: Task;
}

const TaskItem: React.FC<TaskItemProps> = ({ task }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const { dispatch } = useTodoContext();

  const handleComplete = () => {
    dispatch({ type: 'TOGGLE_COMPLETE', payload: task.id });
  };

  const handleDelete = () => {
    dispatch({ type: 'DELETE_TASK', payload: task.id });
  };

  const handleEdit = () => {
    if (editText.trim()) {
      dispatch({
        type: 'EDIT_TASK',
        payload: { ...task, text: editText },
      });
      setIsEditing(false);
    }
  };

  const getPriorityClass = () => {
    switch (task.priority) {
      case 'high':
        return styles.highPriority;
      case 'medium':
        return styles.mediumPriority;
      case 'low':
        return styles.lowPriority;
      default:
        return '';
    }
  };

  return (
    <li className={`${styles.taskItem} ${getPriorityClass()}`}>
      <div className={styles.taskContent}>
        <input
          type="checkbox"
          checked={task.completed}
          onChange={handleComplete}
          aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as complete'}
          className={styles.checkbox}
        />
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleEdit}
            onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
            autoFocus
            className={styles.editInput}
          />
        ) : (
          <span
            className={`${styles.taskText} ${task.completed ? styles.completed : ''}`}
            onClick={() => setIsEditing(true)}
          >
            {task.text}
          </span>
        )}
      </div>
      <div className={styles.taskActions}>
        <button
          onClick={() => setIsEditing(!isEditing)}
          aria-label={isEditing ? 'Cancel editing' : 'Edit task'}
          className={styles.editButton}
        >
          {isEditing ? 'Cancel' : 'Edit'}
        </button>
        <button
          onClick={handleDelete}
          aria-label="Delete task"
          className={styles.deleteButton}
        >
          Delete
        </button>
      </div>
    </li>
  );
};

export default TaskItem;