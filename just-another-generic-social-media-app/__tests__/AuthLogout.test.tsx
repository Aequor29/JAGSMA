import { renderHook } from "@testing-library/react-hooks";
import { act } from "react";
import { AuthProvider, useAuth } from "../app/context/AuthContext";
import { useRouter } from "next/navigation";

// Mock useRouter for tests
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

describe("AuthContext - Logout Functionality", () => {
  beforeEach(() => {
    // Mocking useRouter to return a fake router
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(), // mock push function if used
    });

    // Set up initial localStorage state to simulate a logged-in user
    window.localStorage.setItem(
      "currentUser",
      JSON.stringify({ id: 1, username: "testUser" })
    );
  });

  afterEach(() => {
    // Clear localStorage after each test to prevent test leakage
    window.localStorage.clear();
  });

  it("should log out a user (login state should be cleared)", () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    // Check initial state is logged-in
    expect(JSON.parse(window.localStorage.getItem("currentUser")!)).toEqual({
      id: 1,
      username: "testUser",
    });

    // Perform logout action
    act(() => {
      result.current.logout();
    });

    // Validate that logout cleared user state and localStorage
    expect(result.current.user).toBeNull();
    expect(window.localStorage.getItem("currentUser")).toBeNull();
  });
});
