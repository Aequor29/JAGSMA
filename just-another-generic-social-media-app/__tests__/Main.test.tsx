// __tests__/Main.test.tsx
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  within,
} from "@testing-library/react";
import Main from "@/app/main/page";
import { AuthContext } from "@/app/context/AuthContext";
import fetchMock from "jest-fetch-mock";

describe("Main Component", () => {
  const mockUser = {
    id: 1,
    username: "Bret",
    headline: "Multi-layered client-server neural-net",
  };

  const renderWithAuth = (ui: React.ReactElement) => {
    return render(
      <AuthContext.Provider
        value={{
          user: mockUser,
          login: jest.fn(),
          logout: jest.fn(),
          register: jest.fn(),
          updateHeadline: jest.fn(),
        }}
      >
        {ui}
      </AuthContext.Provider>
    );
  };

  beforeEach(() => {
    fetchMock.resetMocks();
    localStorage.clear();
  });

  it("should fetch all articles for current logged in user (posts state is set)", async () => {
    const mockUsers = [
      {
        id: 1,
        username: "Bret",
        company: { catchPhrase: "Multi-layered client-server neural-net" },
      },
      {
        id: 2,
        username: "Antonette",
        company: { catchPhrase: "Proactive didactic contingency" },
      },
    ];

    const mockPosts = [
      { userId: 1, id: 1, title: "Post 1", body: "Body of post 1" },
      { userId: 2, id: 2, title: "Post 2", body: "Body of post 2" },
    ];

    fetchMock
      .mockResponseOnce(JSON.stringify(mockUsers), { status: 200 })
      .mockResponseOnce(JSON.stringify(mockPosts), { status: 200 });

    localStorage.setItem("followedUserIds_1", JSON.stringify([2]));

    renderWithAuth(<Main />);

    // Wait for fetch calls
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // Verify that both posts are rendered
    expect(await screen.findByText("Post 1")).toBeInTheDocument();
    expect(await screen.findByText("Post 2")).toBeInTheDocument();
  });

  it("should fetch subset of articles for current logged in user given search keyword (posts state is filtered)", async () => {
    const mockUsers = [
      {
        id: 1,
        username: "Bret",
        company: { catchPhrase: "Multi-layered client-server neural-net" },
      },
      {
        id: 2,
        username: "Antonette",
        company: { catchPhrase: "Proactive didactic contingency" },
      },
    ];

    const mockPosts = [
      {
        userId: 1,
        id: 1,
        title: "React Testing",
        body: "Testing with Jest and RTL",
      },
      {
        userId: 2,
        id: 2,
        title: "Next.js Guide",
        body: "Building apps with Next.js",
      },
      {
        userId: 1,
        id: 3,
        title: "JavaScript Tips",
        body: "Improve your JS skills",
      },
    ];

    fetchMock
      .mockResponseOnce(JSON.stringify(mockUsers), { status: 200 })
      .mockResponseOnce(JSON.stringify(mockPosts), { status: 200 });

    localStorage.setItem("followedUserIds_1", JSON.stringify([2]));

    renderWithAuth(<Main />);

    // Wait for fetch calls
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // Initially, all posts should be visible
    expect(await screen.findByText("React Testing")).toBeInTheDocument();
    expect(await screen.findByText("Next.js Guide")).toBeInTheDocument();
    expect(await screen.findByText("JavaScript Tips")).toBeInTheDocument();

    // Perform search
    const searchInput = screen.getByPlaceholderText(
      "Search posts or authors..."
    );
    fireEvent.change(searchInput, { target: { value: "React" } });

    // Wait for debounce and rendering
    await waitFor(() => {
      expect(screen.getByText("React Testing")).toBeInTheDocument();
      expect(screen.queryByText("Next.js Guide")).not.toBeInTheDocument();
      expect(screen.queryByText("JavaScript Tips")).not.toBeInTheDocument();
    });
  });

  it("should add articles when adding a follower (posts state is larger)", async () => {
    const mockUsers = [
      {
        id: 1,
        username: "Bret",
        company: { catchPhrase: "Multi-layered client-server neural-net" },
      },
      {
        id: 2,
        username: "Antonette",
        company: { catchPhrase: "Proactive didactic contingency" },
      },
      {
        id: 3,
        username: "Samantha",
        company: { catchPhrase: "Implemented secondary concept" },
      },
    ];

    const mockPosts = [
      { userId: 1, id: 1, title: "Post 1", body: "Body of post 1" },
      { userId: 2, id: 2, title: "Post 2", body: "Body of post 2" },
      { userId: 3, id: 3, title: "Post 3", body: "Body of post 3" },
    ];

    fetchMock
      .mockResponseOnce(JSON.stringify(mockUsers), { status: 200 })
      .mockResponseOnce(JSON.stringify(mockPosts), { status: 200 });

    // Initially, user 1 follows user 2
    localStorage.setItem("followedUserIds_1", JSON.stringify([2]));

    renderWithAuth(<Main />);

    // Wait for fetch calls
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // Verify initial posts
    expect(await screen.findByText("Post 1")).toBeInTheDocument();
    expect(await screen.findByText("Post 2")).toBeInTheDocument();
    expect(screen.queryByText("Post 3")).not.toBeInTheDocument();

    // Simulate adding a follower (user 3)
    const followInput = screen.getByPlaceholderText("Enter username to follow");
    const followButton = screen.getByRole("button", { name: /^Follow$/i });

    fireEvent.change(followInput, { target: { value: "Samantha" } });
    fireEvent.click(followButton);

    // Verify Post 3 is now visible
    expect(await screen.findByText("Post 3")).toBeInTheDocument();
  });

  it("should remove articles when removing a follower (posts state is smaller)", async () => {
    const mockUsers = [
      {
        id: 1,
        username: "Bret",
        company: { catchPhrase: "Multi-layered client-server neural-net" },
      },
      {
        id: 2,
        username: "Antonette",
        company: { catchPhrase: "Proactive didactic contingency" },
      },
      {
        id: 3,
        username: "Samantha",
        company: { catchPhrase: "Implemented secondary concept" },
      },
    ];

    const mockPosts = [
      { userId: 1, id: 1, title: "Post 1", body: "Body of post 1" },
      { userId: 2, id: 2, title: "Post 2", body: "Body of post 2" },
      { userId: 3, id: 3, title: "Post 3", body: "Body of post 3" },
    ];

    fetchMock
      .mockResponseOnce(JSON.stringify(mockUsers), { status: 200 })
      .mockResponseOnce(JSON.stringify(mockPosts), { status: 200 });

    // Initially, user 1 follows user 2 and 3
    localStorage.setItem("followedUserIds_1", JSON.stringify([2, 3]));

    renderWithAuth(<Main />);

    // Wait for fetch calls
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));

    // Verify initial posts
    expect(await screen.findByText("Post 1")).toBeInTheDocument();
    expect(await screen.findByText("Post 2")).toBeInTheDocument();
    expect(await screen.findByText("Post 3")).toBeInTheDocument();

    // Simulate removing a follower (user 3)
    const unfollowButtons = screen.getAllByRole("button", {
      name: /^Unfollow$/i,
    });
    const samanthaUnfollowButton = unfollowButtons.find((button) =>
      button.parentElement?.textContent?.includes("Samantha")
    );

    expect(samanthaUnfollowButton).toBeDefined();

    if (samanthaUnfollowButton) {
      fireEvent.click(samanthaUnfollowButton);
    }

    // Verify Post 3 is no longer visible
    await waitFor(() => {
      expect(screen.queryByText("Post 3")).not.toBeInTheDocument();
    });

    // Verify other posts are still visible
    expect(screen.getByText("Post 1")).toBeInTheDocument();
    expect(screen.getByText("Post 2")).toBeInTheDocument();
  });
});
