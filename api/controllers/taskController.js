import pool from '../config/db.js';

// Get all tasks for a user
export const getAllTasks = async (req, res) => {
    const userId = req.user.id; // User ID from the JWT
    try {
        const query = 'SELECT id, text, completed, priority, created_at FROM public.tasks WHERE user_id = $1 ORDER BY created_at DESC';
        const { rows } = await pool.query(query, [userId]);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Server error fetching tasks.' });
    }
};

// Get a specific task by ID for a user
export const getTaskById = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    try {
        const query = 'SELECT id, text, completed, priority, created_at FROM public.tasks WHERE id = $1 AND user_id = $2';
        const { rows } = await pool.query(query, [taskId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Task not found.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).json({ error: 'Server error fetching task.' });
    }
};

// Create a new task for a user
export const createTask = async (req, res) => {
    const userId = req.user.id;
    const { text, priority = 'medium' } = req.body;
    try {
        const query = 'INSERT INTO public.tasks (user_id, text, priority) VALUES ($1, $2, $3) RETURNING id, text, completed, priority, created_at';
        const { rows } = await pool.query(query, [userId, text, priority]);

        console.log("Task created successfully:", rows[0]); // Log the created task
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Server error creating task.' });
    }
};

// Update an existing task by ID for a user
export const updateTask = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    const { text, completed, priority } = req.body;
    const updates = {};
    if (text !== undefined) updates.text = text;
    if (completed !== undefined) updates.completed = completed;
    if (priority !== undefined) updates.priority = priority;

    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) {
        return res.status(400).json({ message: 'No fields to update.' });
    }

    const updateValues = updateKeys.map(key => updates[key]);
    const setClause = updateKeys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    const query = `UPDATE public.tasks SET ${setClause} WHERE id = $${updateKeys.length + 1} AND user_id = $${updateKeys.length + 2} RETURNING id, text, completed, priority, created_at`;

    try {
        const { rows } = await pool.query(query, [...updateValues, taskId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Task not found or not belonging to user.' });
        }
        res.status(200).json(rows[0]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Server error updating task.' });
    }
};

// Delete a task by ID for a user
export const deleteTask = async (req, res) => {
    const userId = req.user.id;
    const taskId = req.params.id;
    try {
        const query = 'DELETE FROM public.tasks WHERE id = $1 AND user_id = $2 RETURNING id';
        const { rows } = await pool.query(query, [taskId, userId]);
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Task not found or not belonging to user.' });
        }
        res.status(200).json({ message: 'Task deleted successfully.', id: rows[0].id });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Server error deleting task.' });
    }
};