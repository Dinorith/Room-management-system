import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api } from "../lib/api";

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const token = api.getToken();
  const isAuthenticated = !!user && !!token;

  useEffect(() => {
    // Check if there's a stored token and fetch user
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.getMe();
          setUser(response.data);
        } catch {
          api.setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.login(email, password);
    setUser(response.data.user);
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string) => {
    const response = await api.register(name, email, password, passwordConfirmation);
    setUser(response.data.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Even if logout fails on server, clear local state
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
