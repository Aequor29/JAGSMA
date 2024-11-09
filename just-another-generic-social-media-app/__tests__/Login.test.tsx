// __tests__/Login.test.tsx
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Login from "@/components/registration/Login";
import { AuthContext } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import fetchMock from "jest-fetch-mock";

// Mock useRouter
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("Login Component", () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
    // Set up the mock router
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  it("should log in with valid credentials and redirect", async () => {
    // Mock user data from JSONPlaceholder
    const mockUsers = [
      {
        id: 1,
        username: "Bret",
        address: { street: "Kulas Light" }, // Using address.street as password
        company: { catchPhrase: "Multi-layered client-server neural-net" },
      },
    ];

    fetchMock.mockResponseOnce(JSON.stringify(mockUsers));

    // Render the Login component within AuthContext
    const mockLogin = jest.fn().mockResolvedValue(true);
    render(
      <AuthContext.Provider
        value={{
          user: null,
          login: mockLogin,
          logout: jest.fn(),
          register: jest.fn(),
          updateHeadline: jest.fn(),
        }}
      >
        <Login />
      </AuthContext.Provider>
    );

    // Fill in the username and password
    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "Bret" } });
    fireEvent.change(passwordInput, { target: { value: "Kulas Light" } });
    fireEvent.click(loginButton);

    // Wait for the login function to be called
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith("Bret", "Kulas Light")
    );

    // Wait for the redirect to be called
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith("/main"));
  });

  it("should display error on invalid credentials", async () => {
    // Mock empty user data
    fetchMock.mockResponseOnce(JSON.stringify([]));

    // Render the Login component within AuthContext
    const mockLogin = jest.fn().mockResolvedValue(false);
    render(
      <AuthContext.Provider
        value={{
          user: null,
          login: mockLogin,
          logout: jest.fn(),
          register: jest.fn(),
          updateHeadline: jest.fn(),
        }}
      >
        <Login />
      </AuthContext.Provider>
    );

    // Fill in the username and password
    const usernameInput = screen.getByPlaceholderText("Enter your username");
    const passwordInput = screen.getByPlaceholderText("Enter your password");
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "InvalidUser" } });
    fireEvent.change(passwordInput, { target: { value: "WrongPassword" } });
    fireEvent.click(loginButton);

    // Wait for the login function to be called
    await waitFor(() =>
      expect(mockLogin).toHaveBeenCalledWith("InvalidUser", "WrongPassword")
    );

    // Check for error message
    expect(
      await screen.findByText("Invalid username or password")
    ).toBeInTheDocument();

    // Ensure no redirect occurs
    expect(mockPush).not.toHaveBeenCalled();
  });
});
