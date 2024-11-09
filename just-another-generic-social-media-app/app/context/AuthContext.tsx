// context/AuthContext.tsx
"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  username: string;
  headline: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (username: string, password: string) => Promise<string | null>;
  updateHeadline: (headline: string) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Login Function
  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Fetch users from JSONPlaceholder
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/users`
      );
      const users = await response.json();

      // Find user with matching username and password (using address.street as password)
      const foundUser = users.find(
        (u: any) => u.username === username && u.address.street === password
      );

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          username: foundUser.username,
          headline: foundUser.company.catchPhrase, // Set headline to company catchPhrase
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setUser(userData);
        return true;
      }

      // Check registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const foundRegisteredUser = registeredUsers.find(
        (u: any) => u.username === username && u.address.street === password
      );

      if (foundRegisteredUser) {
        const userData: User = {
          id: foundRegisteredUser.id,
          username: foundRegisteredUser.username,
          headline: foundRegisteredUser.headline,
        };
        localStorage.setItem("currentUser", JSON.stringify(userData));
        setUser(userData);
        return true;
      }

      return false; // User not found
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  // Register Function
  const register = async (
    username: string,
    password: string
  ): Promise<string | null> => {
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if username already exists
    const usernameExists =
      existingUsers.some(
        (user: { username: string }) => user.username === username
      ) || false;

    if (usernameExists) {
      return "Username already exists. Please choose a different one.";
    }

    // Create new user with default headline
    const newUser: User & { address: { street: string } } = {
      id: Date.now(),
      username,
      headline: "Welcome to my profile!", // Default headline for new users
      address: { street: password }, // Using address.street as password
    };

    existingUsers.push(newUser);
    localStorage.setItem("users", JSON.stringify(existingUsers));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setUser({
      id: newUser.id,
      username: newUser.username,
      headline: newUser.headline,
    });

    router.push("/main"); // Redirect to main page after registration
    return null;
  };

  // Logout Function
  const logout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    router.push("/");
  };

  // Update Headline Function
  const updateHeadline = (headline: string) => {
    if (user) {
      const updatedUser: User = { ...user, headline };
      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));

      // Update in registered users if applicable
      const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = existingUsers.map(
        (u: User & { address: { street: string } }) =>
          u.id === user.id ? { ...u, headline } : u
      );
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, register, updateHeadline }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
