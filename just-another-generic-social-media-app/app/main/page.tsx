// app/main/page.tsx
"use client";

import FriendsBar from "@/components/main/FriendsBar";
import NewPost from "@/components/main/NewPost";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Feed from "@/components/main/Feed";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { apiFetch } from "@/utils/api";

interface Article {
  id: number;
  userId: number;
  title: string;
  body: string;
  createdAt: string;
  author: string;
}

interface User {
  username: string;
  headline: string;
  avatarUrl?: string;
}

export default function Main() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [followedUsernames, setFollowedUsernames] = useState<string[]>([]);

  // Fetch current user's data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const [headlineRes, avatarRes] = await Promise.all([
            apiFetch({ endpoint: `/headline/${user.username}` }),
            apiFetch({ endpoint: `/avatar/${user.username}` }),
          ]);

          if (headlineRes.status === 200 && avatarRes.status === 200) {
            setCurrentUser({
              username: user.username,
              headline: headlineRes.data.headline,
              avatarUrl: avatarRes.data.avatar,
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };

    fetchUserData();
  }, [user]);

  // Fetch followed users
  useEffect(() => {
    const fetchFollowing = async () => {
      if (user) {
        try {
          const response = await apiFetch({ endpoint: "/following" });
          if (response.status === 200) {
            setFollowedUsernames(response.data.following);
          }
        } catch (error) {
          console.error("Error fetching following list:", error);
        }
      }
    };

    fetchFollowing();
  }, [user]);

  // Handle follow/unfollow
  const handleFollow = async (usernameToFollow: string) => {
    try {
      const response = await apiFetch({
        endpoint: `/following/${usernameToFollow}`,
        method: "PUT",
      });

      if (response.status === 200) {
        setFollowedUsernames(response.data.following);
      }
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleUnfollow = async (usernameToUnfollow: string) => {
    try {
      const response = await apiFetch({
        endpoint: `/following/${usernameToUnfollow}`,
        method: "DELETE",
      });

      if (response.status === 200) {
        setFollowedUsernames(response.data.following);
      }
    } catch (error) {
      console.error("Error unfollowing user:", error);
    }
  };

  // Update headline
  const updateHeadline = async (newHeadline: string) => {
    try {
      const response = await apiFetch({
        endpoint: "/headline",
        method: "PUT",
        body: { headline: newHeadline },
      });

      if (response.status === 200 && currentUser) {
        setCurrentUser({
          ...currentUser,
          headline: response.data.headline,
        });
      }
    } catch (error) {
      console.error("Error updating headline:", error);
    }
  };

  // Add new post handler
  const addNewPost = async (newPost: Article) => {
    try {
      const response = await apiFetch({
        endpoint: "/article",
        method: "POST",
        body: { title: newPost.title, body: newPost.body },
      });

      if (response.status === 200) {
        setArticles([response.data.article, ...articles]);
      }
    } catch (error) {
      console.error("Error adding new post:", error);
    }
  };

  if (!currentUser) {
    return <p>Loading...</p>;
  }

  return (
    <div className="flex">
      <SidebarProvider>
        <FriendsBar
          currentUser={currentUser}
          followedUsernames={followedUsernames}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          onUpdateHeadline={updateHeadline}
        />
        <SidebarTrigger />
        <div className="flex-1 p-4">
          <div className="my-3">
            <NewPost addNewPost={addNewPost} currentUser={currentUser} />
          </div>
          <div>
            <Feed
              articles={articles}
              followedUsernames={followedUsernames}
              currentUser={currentUser}
            />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
