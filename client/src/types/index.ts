export interface User {
    _id: string;
    email: string;
    role: string;
    name: string;
  }
  
  export interface Task {
    _id: string;
    title: string;
    description: string;
    completed: boolean;
    createdAt: string;
    user: User | string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  export interface ApiError {
    message: string;
    statusCode?: number;
  }