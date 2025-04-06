export interface User {
    id: string;
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
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    token: string;
  }
  
  export interface ApiError {
    message: string;
    statusCode?: number;
  }