// components/profile/ProfilePage.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "./ProfileForm";

type UserData = {
  id: number;
  username: string;
  email: string;
  phone: string;
  zipcode: string;
  avatarUrl: string;
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [userID, setUserID] = useState<number | null>(null);

  // Fetch userID from localStorage on component mount
  useEffect(() => {
    const currentUser = localStorage.getItem("currentUser");
    const id = currentUser ? JSON.parse(currentUser).id : null;
    setUserID(id);
  }, []);

  // Fetch user data from Placeholder API based on userID
  useEffect(() => {
    const fetchUserData = async () => {
      if (userID && userID < 10) {
        try {
          const response = await fetch(
            `https://jsonplaceholder.typicode.com/users/${userID}`
          );
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const data = await response.json();
          setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            phone: data.phone,
            zipcode: data.address.zipcode,
            avatarUrl: `https://placekitten.com/200/200?image=${data.id}`,
          });
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setUser(null);
        }
      } else if (userID) {
        const storedUser = localStorage.getItem("currentUser");
        if (storedUser) {
          const parsedUser: UserData = JSON.parse(storedUser);
          setUser({
            id: parsedUser.id,
            username: parsedUser.username,
            email: "default@gmail.com",
            phone: "1234567890",
            zipcode: "12345",
            avatarUrl: "https://placekitten.com/200/200?image=${data.id}",
          });
        } else {
          console.warn("No userID found in localStorage.");
          setUser(null);
        }
      }
    };

    fetchUserData();
  }, [userID]);

  const updateProfile = async (formData: FormData) => {
    if (user) {
      const updatedUser: UserData = { ...user };
      const newUserData = Object.fromEntries(formData.entries());

      if (newUserData.email) updatedUser.email = newUserData.email as string;
      if (newUserData.phone) updatedUser.phone = newUserData.phone as string;
      if (newUserData.zipcode)
        updatedUser.zipcode = newUserData.zipcode as string;

      // Handle avatar update
      const avatarFile = formData.get("avatar") as File | null;
      if (avatarFile && avatarFile.type.startsWith("image/")) {
        // For simplicity, we'll use a local URL. In a real app, you'd upload the image.
        const avatarUrl = URL.createObjectURL(avatarFile);
        updatedUser.avatarUrl = avatarUrl;
      }

      setUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          <div className="flex items-center space-x-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{user.username}</h2>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-gray-500">{user.phone}</p>
              <p className="text-gray-500">{user.zipcode}</p>
            </div>
          </div>
          <ProfileForm user={user} updateProfile={updateProfile} />
        </div>
      </CardContent>
    </Card>
  );
}
