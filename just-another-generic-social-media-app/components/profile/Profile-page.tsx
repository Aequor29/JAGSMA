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

  // Fetch user data from the server using the cookie stored in the browser
  useEffect(() => {
    const fetchUserData = async () => {
      let userData = {
        id: 1,
        username: "John Doe",
        email: "john.doe@example.com",
        phone: "000000000000",
        zipcode: "12345",
        avatarUrl: "https://example.com/avatar.jpg",
      };
      setUser(userData);
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
      // use cloudinary to upload the image and get the url
      // update the user to our server with new profile data
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
