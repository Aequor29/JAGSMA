"use client";

import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { apiFetch } from "@/utils/api";
import { cookies } from "next/headers";

interface User {
  username: string;
  email?: string;
  dob?: string;
  phone?: string;
  zipcode?: string;
  avatar?: string;
}

interface AuthContextProps {
  user: User | null;
  isLoading: boolean; // Renamed from 'loading' to 'isLoading'
  login: (username: string, password: string) => Promise<boolean>;
  registerUser: (data: RegisterData) => Promise<string | null>;
  logout: () => Promise<void>;
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
  isLoading: true, // Updated default value
  login: async () => false,
  registerUser: async () => null,
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Renamed state

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
      setIsLoading(false); // Updated state
    }
  };

  useEffect(() => {
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setIsLoading(true); // Start loading
    try {
      const { status, data } = await apiFetch({
        endpoint: "/login",
        method: "POST",
        body: { username, password },
      });

      if (status === 200) {
        const currUser: User = { username: data.username };
        console.log(currUser);
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
      setIsLoading(false); // End loading
    }
  };

  const registerUser = async (data: RegisterData): Promise<string | null> => {
    setIsLoading(true); // Start loading
    try {
      const { status, data: response } = await apiFetch({
        endpoint: "/register",
        method: "POST",
        body: data,
      });

      if (status === 201) {
        // Automatically log in the user after successful registration
        const loginSuccess = await login(data.username, data.password);
        if (loginSuccess) {
          return null;
        } else {
          return "Registration successful, but automatic login failed.";
        }
      } else {
        // Handle validation errors or other errors from the backend
        if (response.errors) {
          // Aggregate error messages
          const messages = response.errors
            .map((err: any) => err.msg)
            .join(", ");
          return messages;
        }
        return response.message || "Registration failed.";
      }
    } catch (error) {
      console.error("Registration error:", error);
      return "Registration failed due to a server error.";
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true); // Start loading
    try {
      const { status, data } = await apiFetch({
        endpoint: "/logout",
        method: "PUT",
      });

      if (status === 200) {
        // Clear cookie
        document.cookie = "sid=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
        setUser(null);
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, registerUser, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for accessing the AuthContext
export const useAuth = () => useContext(AuthContext);
