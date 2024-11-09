"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroupLabel,
  SidebarGroup,
} from "@/components/ui/sidebar";
import { Avatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FollowedUsers from "@/components/main/FollowedUsers";
import { useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";

interface User {
  id: number;
  username: string;
  headline: string;
}

interface FriendsBarProps {
  currentUser: User;
  users: User[];
  followedUserIds: number[];
  onFollow: (userId: number) => void;
  onUnfollow: (userId: number) => void;
}

export default function FriendsBar({
  currentUser,
  users,
  followedUserIds,
  onFollow,
  onUnfollow,
}: FriendsBarProps) {
  const { updateHeadline } = useAuth();
  const headlineInputRef = useRef<HTMLInputElement | null>(null);
  const followInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpdateHeadline = () => {
    if (headlineInputRef.current?.value) {
      const newHeadline = headlineInputRef.current.value;
      updateHeadline(newHeadline);
      headlineInputRef.current.value = "";
    }
  };

  const handleFollowClick = () => {
    const usernameToFollow = followInputRef.current?.value;
    if (usernameToFollow) {
      const userToFollow = users.find(
        (user) => user.username === usernameToFollow
      );
      if (
        userToFollow &&
        userToFollow.id !== currentUser.id &&
        !followedUserIds.includes(userToFollow.id)
      ) {
        onFollow(userToFollow.id);
      }
      if (followInputRef.current) {
        followInputRef.current.value = "";
      }
    }
  };

  const handleUnfollow = (userId: number) => {
    onUnfollow(userId);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="m-3">
          <Avatar>
            <img src="https://placehold.co/100x100" alt="User avatar" />
          </Avatar>
          <div>
            <h3 className="text-lg font-semibold">{currentUser.username}</h3>
            <p>{currentUser.headline}</p> {/* Displaying user's headline */}
          </div>
          <Input
            placeholder="Update your headline"
            ref={headlineInputRef}
            className="mt-2"
          />
          <Button className="mt-3" onClick={handleUpdateHeadline}>
            Update Headline
          </Button>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Following</SidebarGroupLabel>
          {followedUserIds.length > 0 ? (
            followedUserIds.map((userId) => {
              const user = users.find((u) => u.id === userId);
              if (!user) return null;
              return (
                <FollowedUsers
                  key={user.id}
                  userName={user.username}
                  userHeadLine={user.headline} // Use user's headline
                  imageURL="https://placehold.co/100x100"
                  onUnfollow={() => handleUnfollow(user.id)}
                />
              );
            })
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
                handleFollowClick();
              }
            }}
            aria-label="Follow users by username"
          />
          <Button className="mb-3" onClick={handleFollowClick}>
            Follow
          </Button>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
