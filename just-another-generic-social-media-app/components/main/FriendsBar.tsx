// components/main/FriendsBar.tsx
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FollowedUsers from "@/components/main/FollowedUsers";
import { useRef, useState, useEffect } from "react";
import { apiFetch } from "@/utils/api";

interface User {
  username: string;
  headline: string;
  avatarUrl?: string;
}

interface FriendsBarProps {
  currentUser: User;
  followedUsernames: string[];
  onUpdateHeadline: (newHeadline: string) => void;
  onFollow: (usernameToFollow: string) => void;
  onUnfollow: (usernameToUnfollow: string) => void;
}

export default function FriendsBar({
  currentUser,
  followedUsernames,
  onUpdateHeadline,
  onFollow,
  onUnfollow,
}: FriendsBarProps) {
  const headlineInputRef = useRef<HTMLInputElement | null>(null);
  const followInputRef = useRef<HTMLInputElement | null>(null);
  const [isUpdatingHeadline, setIsUpdatingHeadline] = useState<boolean>(false);
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch followed users' details
  useEffect(() => {
    const fetchFollowedUsersDetails = async () => {
      try {
        const usersDetails = await Promise.all(
          followedUsernames.map(async (username) => {
            const [headlineRes, avatarRes] = await Promise.all([
              apiFetch({ endpoint: `/headline/${username}` }),
              apiFetch({ endpoint: `/avatar/${username}` }),
            ]);

            return {
              username,
              headline: headlineRes.data?.headline || "No headline",
              avatarUrl: avatarRes.data?.avatar || "",
            };
          })
        );
        setFollowedUsers(usersDetails);
      } catch (error) {
        console.error("Error fetching followed users details:", error);
      }
    };

    if (followedUsernames.length > 0) {
      fetchFollowedUsersDetails();
    } else {
      setFollowedUsers([]);
    }
  }, [followedUsernames]);

  const handleUpdateHeadline = async () => {
    setErrorMessage(null); // Clear previous error
    if (headlineInputRef.current?.value) {
      const newHeadline = headlineInputRef.current.value.trim();
      if (!newHeadline) {
        setErrorMessage("Headline cannot be empty.");
        return;
      }

      setIsUpdatingHeadline(true);
      try {
        const res = await apiFetch({
          endpoint: "/headline",
          method: "PUT",
          body: { headline: newHeadline },
        });

        if (res.status === 200 && res.data.headline) {
          onUpdateHeadline(res.data.headline);
          headlineInputRef.current.value = "";
        } else {
          setErrorMessage(res.data.message || "Failed to update headline.");
        }
      } catch (error) {
        console.error("Error updating headline:", error);
        setErrorMessage("An error occurred while updating the headline.");
      } finally {
        setIsUpdatingHeadline(false);
      }
    }
  };

  const handleFollowClick = async () => {
    setErrorMessage(null); // Clear previous error
    const usernameToFollow = followInputRef.current?.value.trim();
    if (!usernameToFollow) return;

    try {
      const headlineRes = await apiFetch({
        endpoint: `/headline/${usernameToFollow}`,
      });

      if (headlineRes.status === 404) {
        setErrorMessage("User not found.");
        return;
      }

      if (usernameToFollow === currentUser.username) {
        setErrorMessage("You cannot follow yourself.");
        return;
      }

      if (followedUsernames.includes(usernameToFollow)) {
        setErrorMessage("You are already following this user.");
        return;
      }

      onFollow(usernameToFollow);
      if (followInputRef.current) {
        followInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error following user:", error);
      setErrorMessage("Failed to follow user. Please try again.");
    }
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="m-3 flex flex-col items-start">
          <Avatar className="mb-2">
            {currentUser.avatarUrl ? (
              <AvatarImage
                src={currentUser.avatarUrl}
                alt={`${currentUser.username}'s avatar`}
              />
            ) : (
              <AvatarFallback>
                {currentUser.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{currentUser.username}</h3>
            <p>{currentUser.headline}</p>
          </div>
          <Input
            placeholder="Update your headline"
            ref={headlineInputRef}
            className="mt-2"
            aria-label="Update your headline"
            disabled={isUpdatingHeadline}
          />
          <Button
            className="mt-3"
            onClick={handleUpdateHeadline}
            disabled={isUpdatingHeadline}
          >
            {isUpdatingHeadline ? "Updating..." : "Update Headline"}
          </Button>
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Following</SidebarGroupLabel>
          {followedUsers.length > 0 ? (
            followedUsers.map((user) => (
              <FollowedUsers
                key={user.username}
                userName={user.username}
                userHeadLine={user.headline}
                imageURL={user.avatarUrl || ""}
                onUnfollow={() => onUnfollow(user.username)}
              />
            ))
          ) : (
            <p className="text-sm text-gray-500">
              You are not following anyone yet.
            </p>
          )}
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Follow Users</SidebarGroupLabel>
          <Input
            className="mb-3"
            placeholder="Enter username to follow"
            ref={followInputRef}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleFollowClick();
              }
            }}
            aria-label="Follow users by username"
          />
          <Button className="mb-3" onClick={handleFollowClick}>
            Follow
          </Button>
          {/* If you want a separate error message for the follow section,
              you can either use the same errorMessage state or create another state variable. 
              For simplicity, we reuse the same errorMessage here. */}
          {errorMessage && (
            <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
          )}
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
