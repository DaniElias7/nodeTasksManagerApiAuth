# To Develop the App

## Backend
-------------
[ ] **Step 1: Set up the Task Model (`models/Task.js`)**
    * Define functions to interact with the `tasks` table in your PostgreSQL database.
    * Include functions for:
        * Creating a new task (taking `userId`, `title`, and `description` as parameters).
        * Getting all tasks for a specific user.
        * Getting a specific task by its ID for a user.
        * Updating an existing task (taking `id`, `userId`, and fields to update as parameters).
        * Deleting a task by its ID for a user.
    * Ensure these functions use the `pool` object from `config/db.js` to execute SQL queries.

[ ] **Step 2: Set up the Task Routes (`routes/taskRoutes.js`)**
    * Create a new file in your `routes` directory (if it doesn't exist).
    * Define the following API endpoints for tasks using Express Router:
        * `POST /api/tasks`: To create a new task.
        * `GET /api/tasks`: To get all tasks for the authenticated user (you'll need to think about how to identify the user later, for now you can skip this and just fetch all).
        * `GET /api/tasks/:id`: To get a specific task by ID.
        * `PUT /api/tasks/:id`: To update a task.
        * `DELETE /api/tasks/:id`: To delete a task.
    * Map these routes to the corresponding functions in your `TaskController`.

[ ] **Step 3: Set up the Task Controller (`controllers/taskController.js`)**
    * Create a new file in your `controllers` directory (if it doesn't exist).
    * Implement the following controller functions:
        * `createTask(req, res)`: Extracts task data from the request body and uses the `Task` Model to save it to the database. Returns an appropriate response (e.g., the newly created task).
        * `getAllTasks(req, res)`: Uses the `Task` Model to retrieve all tasks from the database and returns them in the response.
        * `getTaskById(req, res)`: Extracts the task ID from the request parameters and uses the `Task` Model to fetch the task. Returns the task or a "not found" error.
        * `updateTask(req, res)`: Extracts the task ID and updated data from the request. Uses the `Task` Model to update the task in the database and returns a success message or an error.
        * `deleteTask(req, res)`: Extracts the task ID from the request and uses the `Task` Model to delete the task from the database. Returns a success message or an error.

[ ] **Step 4: Integrate Task Routes with the Server (`server.js`)**
    * In your `server.js` file, import the `taskRoutes` from `routes/taskRoutes.js`.
    * Mount the task routes to a specific path (e.g., `/api`). This will make your task endpoints accessible under `/api/tasks`, `/api/tasks/:id`, etc.

[ ] **Step 5: Test Your API Endpoints**
    * Start your backend server using `npm start` or `node server.js`.
    * Use a tool like Postman, Insomnia, or `curl` to send requests to your API endpoints and verify that they are working correctly (creating, reading, updating, and deleting tasks).

[ ] **Step 6: Implement Basic User Authentication (Optional)**
    * Create a `User` model and a `UserController` for handling user registration and login.
    * Implement middleware for authentication to protect your task routes so only logged-in users can access them.
    * Update your task model and controller to associate tasks with specific users.

[ ] **Step 7: Add Input Validation (Optional)**
    * Use a library like `express-validator` or implement your own validation functions to ensure that the data sent to your API is valid before processing it.

[ ] **Step 8: Implement Error Handling (Optional)**
    * Add middleware to handle errors that occur in your API and send appropriate error responses to the client.

## Frontend
--------------
[ ] **Step 1: Set up the Basic UI**
    * Create the main React components for your To-Do list:
        * `TaskList`: To display the list of tasks.
        * `AddTask`: To allow users to input and add new tasks.
        * `TodoItem`: To represent an individual task in the list, with options to mark as complete/incomplete and delete.

[ ] **Step 2: Implement API Integration**
    * Use the `Workspace` API or a library like Axios to make HTTP requests to your backend API endpoints from your React components.

[ ] **Step 3: Implement Task Display**
    * In your `TaskList` component, fetch the list of tasks from the `/api/tasks` endpoint on your backend and display them.

[ ] **Step 4: Implement Adding New Tasks**
    * In your `AddTask` component, create a form that allows users to enter a task title (and optionally a description).
    * When the user submits the form, send a `POST` request to the `/api/tasks` endpoint with the task data.
    * Update the task list to display the newly added task.

[ ] **Step 5: Implement Updating Tasks**
    * In your `TodoItem` component, add functionality to mark tasks as complete or incomplete. This should send a `PUT` request to the `/api/tasks/:id` endpoint on your backend to update the `completed` status.
    * Optionally, add functionality to edit the task title and description, also sending a `PUT` request.

[ ] **Step 6: Implement Deleting Tasks**
    * In your `TodoItem` component, add a button to delete a task. When clicked, send a `DELETE` request to the `/api/tasks/:id` endpoint on your backend.
    * Update the task list to remove the deleted task.

[ ] **Step 7: Implement Basic Styling**
    * Add some CSS styles to make your To-Do application look presentable.

[ ] **Step 8: Implement User Authentication UI (Optional)**
    * If you implemented authentication on the backend, create login and signup forms in your frontend and handle the API calls to authenticate users.
    * Store the authentication token (e.g., using local storage or cookies) and include it in subsequent requests to protected API endpoints.