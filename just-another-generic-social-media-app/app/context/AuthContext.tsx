// app/context/AuthContext.tsx
"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { apiFetch } from "@/utils/api";

interface AuthEntry {
  provider: string;
  id: string;
  email: string;
}

interface User {
  username: string;
  email?: string;
  dob?: string;
  phone?: string;
  zipcode?: string;
  avatar?: string;
  auth?: AuthEntry[]; // Added auth array to keep track of linked providers
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  registerUser: (data: RegisterData) => Promise<string | null>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>; // New helper to refresh user data after linking/unlinking
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  phone: string;
  zipcode: string;
  dob: string;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  isLoading: true,
  login: async () => false,
  registerUser: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      const { status, data } = await apiFetch({
        endpoint: "/api/user",
        method: "GET",
      });
      if (status === 200) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refreshUser = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const { status, data } = await apiFetch({
        endpoint: "/login",
        method: "POST",
        body: { username, password },
      });

      if (status === 200) {
        const currUser: User = { username: data.username };
        setUser(currUser);
        return true;
      } else {
        console.error("Login failed:", data.message);
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (data: RegisterData): Promise<string | null> => {
    setIsLoading(true);
    try {
      const { status, data: response } = await apiFetch({
        endpoint: "/register",
        method: "POST",
        body: data,
      });

      if (status === 201) {
        const loginSuccess = await login(data.username, data.password);
        if (loginSuccess) {
          return null;
        } else {
          return "Registration successful, but automatic login failed.";
        }
      } else {
        if (response.errors) {
          const messages = response.errors
            .map((err: any) => err.msg)
            .join(", ");
          return messages;
        }
        return response.message || "Registration failed.";
      }
    } catch (error) {
      return String(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { status, data } = await apiFetch({
        endpoint: "/logout",
        method: "PUT",
      });

      if (status === 200) {
        document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        setUser(null);
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, registerUser, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
