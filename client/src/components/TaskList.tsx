import { useEffect, useState } from 'react';
import { TaskService } from '../services/tasks';
import { Task } from '../types';

export const TaskList = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await TaskService.getAll();
        setTasks(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <div>Loading tasks...</div>;

  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id} className="task-item">
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {task.completed ? 'Completed' : 'Pending'}</p>
        </div>
      ))}
    </div>
  );
};