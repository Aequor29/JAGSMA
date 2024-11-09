import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import SignUp from "@/components/registration/SignUp";
import { AuthProvider, useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

// Mock useRouter from next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock the useAuth hook
jest.mock("@/app/context/AuthContext", () => ({
  ...jest.requireActual("@/app/context/AuthContext"),
  useAuth: jest.fn(),
}));

describe("SignUp Component", () => {
  const mockRegister = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    // Mock the router push function
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

    // Mock the useAuth hook's register method
    (useAuth as jest.Mock).mockReturnValue({
      register: mockRegister,
    });

    // Reset mocks before each test
    mockRegister.mockReset();
    mockPush.mockReset();
  });

  it("should register a new user with valid input", async () => {
    // Simulate successful registration
    mockRegister.mockImplementation(async (username, password) => {
      // Simulate the push call within register
      mockPush("/main");
      return null; // No error message
    });

    render(
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    );

    // Fill in form fields
    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "newUser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "123-456-7890" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your ZIP code"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[0], {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[1], {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Wait for register function to be called
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith("newUser", "password123");
    });

    // Confirm that push was called with the correct path
    expect(mockPush).toHaveBeenCalledWith("/main");
  });

  it("should show an error if username already exists", async () => {
    mockRegister.mockResolvedValue("Username already exists"); // Simulate duplicate username error

    render(
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    );

    // Fill in form fields
    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "existingUser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "existinguser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "123-456-7890" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your ZIP code"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[0], {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[1], {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Expect error message
    await waitFor(() =>
      expect(screen.getByText("Username already exists")).toBeInTheDocument()
    );
    expect(mockRegister).toHaveBeenCalledWith("existingUser", "password123");
  });

  it("should show validation error on invalid email", async () => {
    render(
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "newUser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "invalid-email" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "123-456-7890" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your ZIP code"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[0], {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[1], {
      target: { value: "password123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(screen.getByText("Invalid email address")).toBeInTheDocument()
    );
  });

  it("should show password mismatch error", async () => {
    render(
      <AuthProvider>
        <SignUp />
      </AuthProvider>
    );

    fireEvent.change(screen.getByPlaceholderText("Enter your username"), {
      target: { value: "newUser" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your email"), {
      target: { value: "newuser@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your phone number"), {
      target: { value: "123-456-7890" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter your ZIP code"), {
      target: { value: "12345" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[0], {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getAllByPlaceholderText("********")[1], {
      target: { value: "differentPassword" },
    });

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() =>
      expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
    );
  });
});
