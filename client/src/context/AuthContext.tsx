import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean; // Add loading to the interface
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // Initialize loading state
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string;
  const signUpEndpoint = process.env.NEXT_PUBLIC_AUTH_REGISTER_ENDPOINT as string;
  const loginEndpoint = process.env.NEXT_PUBLIC_AUTH_LOGIN_ENDPOINT as string;
  const logoutEndpoint = process.env.NEXT_PUBLIC_AUTH_LOGOUT_ENDPOINT as string;
  const getUserData = process.env.NEXT_PUBLIC_AUTH_GET_USER_DATA_FROM_COOKIE as string;


  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${backendUrl}${loginEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Include cookies in the request
      });

      if (response.ok) {
        await fetchUser();
      } else {
        console.error('Login failed');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false); // Set loading to false on failure
      }
    } catch (error) {
      console.error('Login error:', error);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false); // Set loading to false on error
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${backendUrl}${signUpEndpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        credentials: 'include', // Include cookies in the request
      });

      if (response.status === 201) {
        await fetchUser();
        router.push('/');
      } else {
        console.error('Signup failed');
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false); // Set loading to false on failure
      }
    } catch (error) {
      console.error('Signup error:', error);
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false); // Set loading to false on error
    }
  };

  const logout = async () => {
    setLoading(true);
    try {

      const response = await fetch(`${backendUrl}${logoutEndpoint}`, {
        method: 'POST',
        credentials: 'include', // Make sure to include credentials
      });

      if (response.ok) {
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login'); // Redirect to the login page after logout
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async () => {
    setLoading(true); // Set loading to true before fetching
    try {
      const response = await fetch(`${backendUrl}${getUserData}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false); // Set loading to false after fetching
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};