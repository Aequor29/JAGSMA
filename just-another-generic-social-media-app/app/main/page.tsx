// /app/main/page.tsx

"use client";

import FriendsBar from "@/components/main/FriendsBar";
import NewPost from "@/components/main/NewPost";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import Feed from "@/components/main/Feed";
import { useState, useEffect } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { apiFetch } from "@/utils/api";
import { toast } from "react-toastify"; // Ensure react-toastify is installed

interface User {
  username: string;
  headline: string;
  avatarUrl?: string;
}

export default function Main() {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [followedUsernames, setFollowedUsernames] = useState<string[]>([]);
  const [refreshFeed, setRefreshFeed] = useState<boolean>(false);

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
          } else {
            throw new Error("Failed to fetch user data.");
          }
        } catch (error: any) {
          console.error("Error fetching user data:", error);
          toast.error(error.message || "Failed to fetch user data.");
        }
      }
    };

    fetchUserData();
  }, [user]);

  useEffect(() => {
    const fetchFollowing = async () => {
      if (user) {
        try {
          const response = await apiFetch({ endpoint: "/following" });
          if (response.status === 200) {
            // Include the current user's username to display their posts
            setFollowedUsernames(
              Array.from(new Set([...response.data.following, user.username]))
            );
          } else {
            throw new Error("Failed to fetch following list.");
          }
        } catch (error: any) {
          console.error("Error fetching following list:", error);
          toast.error(error.message || "Failed to fetch following list.");
        }
      }
    };

    fetchFollowing();
  }, [user]);

  const handleFollow = async (usernameToFollow: string) => {
    try {
      const response = await apiFetch({
        endpoint: `/following/${usernameToFollow}`,
        method: "PUT",
      });
      if (response.status === 200) {
        setFollowedUsernames(
          Array.from(new Set([...response.data.following, user?.username]))
        );
        toast.success(`Followed ${usernameToFollow} successfully!`);
      } else {
        throw new Error(response.data?.message || "Failed to follow user.");
      }
    } catch (error: any) {
      console.error("Error following user:", error);
      toast.error(error.message || "Failed to follow user.");
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
        toast.success(`Unfollowed ${usernameToUnfollow} successfully!`);
      } else {
        throw new Error(response.data?.message || "Failed to unfollow user.");
      }
    } catch (error: any) {
      console.error("Error unfollowing user:", error);
      toast.error(error.message || "Failed to unfollow user.");
    }
  };

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
        toast.success("Headline updated successfully!");
      } else {
        throw new Error(response.data?.message || "Failed to update headline.");
      }
    } catch (error: any) {
      console.error("Error updating headline:", error);
      toast.error(error.message || "Failed to update headline.");
    }
  };

  const addNewPost = async (title: string, text: string, image?: string) => {
    try {
      const response = await apiFetch({
        endpoint: "/articles",
        method: "POST",
        body: { title, text, image },
      });

      if (response.status === 201) {
        // Trigger feed refresh
        setRefreshFeed((prev) => !prev);
        toast.success("Post created successfully!");
      } else {
        throw new Error(response.data?.message || "Failed to create post.");
      }
    } catch (error: any) {
      console.error("Error adding new post:", error);
      toast.error(error.message || "Failed to create post. Please try again.");
      throw error; // Re-throw to allow NewPost component to handle it if needed
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
          followedUsernames={followedUsernames.filter(
            (username) => username !== currentUser.username
          )}
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
              followedUsernames={followedUsernames}
              currentUser={currentUser}
              refresh={refreshFeed}
            />
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
