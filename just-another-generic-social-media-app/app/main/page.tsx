// app/main/page.tsx
"use client";

import FriendsBar from "@/components/main/FriendsBar";
import NewPost from "@/components/main/NewPost";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Feed from "@/components/main/Feed";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext"; // Adjust the path as needed

interface Article {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
  author: string;
}

interface User {
  id: number;
  username: string;
  headline: string;
}

export default function Main() {
  const { user } = useAuth();
  const currentUser = user;

  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<number[]>([]);

  // Fetch users and posts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users from JSONPlaceholder
        const resUsers = await fetch(
          "https://jsonplaceholder.typicode.com/users"
        );
        const dataUsers: any[] = await resUsers.json();

        // Fetch registered users from localStorage
        const registeredUsers = JSON.parse(
          localStorage.getItem("users") || "[]"
        );
        const formattedRegisteredUsers: User[] = registeredUsers.map(
          (u: any) => ({
            id: u.id,
            username: u.username,
            headline: u.headline,
          })
        );

        const combinedUsers = [...dataUsers, ...formattedRegisteredUsers];
        setUsers(combinedUsers);

        // Fetch posts from JSONPlaceholder
        const resPosts = await fetch(
          "https://jsonplaceholder.typicode.com/posts"
        );
        const dataPosts: Omit<Article, "createdAt" | "author">[] =
          await resPosts.json();

        const randomDate = (): string => {
          const end = new Date();
          const start = new Date();
          start.setMonth(start.getMonth() - 1); // Posts from the past month
          const randomTime = new Date(
            start.getTime() + Math.random() * (end.getTime() - start.getTime())
          );
          return randomTime.toISOString();
        };

        const articlesWithMeta: Article[] = dataPosts.map((article) => {
          const user = combinedUsers.find((u) => u.id === article.userId);
          return {
            ...article,
            createdAt: randomDate(),
            author: user ? user.username : "Unknown",
          };
        });

        setArticles(articlesWithMeta);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  // Load followedUserIds per user
  useEffect(() => {
    // if the current user is the placeholder user, set 2 and 3 to be followed by default
    if (currentUser && currentUser.id === 1) {
      setFollowedUserIds([2, 3]);
    }
    if (currentUser) {
      const storedFollowed = localStorage.getItem(
        `followedUserIds_${currentUser.id}`
      );
      if (storedFollowed) {
        setFollowedUserIds(JSON.parse(storedFollowed));
      } else {
        setFollowedUserIds([]); // No followed users for new registrations
      }
    }
  }, [currentUser]);

  // Persist followedUserIds to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(
        `followedUserIds_${currentUser.id}`,
        JSON.stringify(followedUserIds)
      );
    }
  }, [followedUserIds, currentUser]);

  // Function to add new post to feed
  const addNewPost = (newPost: Article) => {
    setArticles([newPost, ...articles]); // Add the new post to the articles
  };

  // Function to handle following/unfollowing users
  const handleFollow = (userId: number) => {
    if (
      currentUser &&
      !followedUserIds.includes(userId) &&
      userId !== currentUser.id
    ) {
      setFollowedUserIds((prev) => [...prev, userId]);
    }
  };

  const handleUnfollow = (userId: number) => {
    setFollowedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  if (!currentUser) {
    // Show a loading state or redirect to login
    return <p>Loading...</p>;
  }

  return (
    <div className="flex">
      <SidebarProvider>
        <FriendsBar
          currentUser={currentUser}
          users={users}
          followedUserIds={followedUserIds}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
        />
        <SidebarTrigger />
        <div className="flex-1 p-4">
          <div className="my-3">
            <NewPost addNewPost={addNewPost} currentUser={currentUser} />
          </div>

          <div>
            <Feed
              articles={articles}
              followedUserIds={followedUserIds}
              currentUser={currentUser}
            />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
