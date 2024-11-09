// src/components/profile/__tests__/Profile.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import ProfilePage from "@/components/profile/Profile-page";
import "@testing-library/jest-dom";

// Mock fetch globally
beforeAll(() => {
  global.fetch = jest.fn((url) =>
    Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          id: 1,
          username: "Bret",
          email: "bret@example.com",
          phone: "123-456-7890",
          address: {
            zipcode: "12345",
          },
        }),
    } as Response)
  );
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe("ProfilePage", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Set 'currentUser' with 'id' in localStorage
    localStorage.setItem("currentUser", JSON.stringify({ id: 1 }));
  });

  it("should fetch the logged-in user's profile username", async () => {
    render(<ProfilePage />);

    // Wait for the username to appear in the document
    const usernameElement = await screen.findByText("Bret");
    expect(usernameElement).toBeInTheDocument();
  });
});
