// components/profile/ProfilePage.tsx

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProfileForm } from "./ProfileForm";
import { useAuth } from "@/app/context/AuthContext";
import { apiFetch } from "@/utils/api";

type UserData = {
  username: string;
  email: string;
  phone: string;
  dob: Date;
  zipcode: string;
  avatarUrl?: string; // Made optional
};

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, isLoading: authLoading } = useAuth(); // Assuming useAuth provides isLoading
  console.log("we have user", user);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authLoading) {
        // Authentication status is still loading
        setLoading(true);
        return;
      }

      if (!user) {
        setError("User not authenticated");
        setLoading(false);
        return;
      }

      // Clear any previous errors when user is present
      setError(null);
      setLoading(true);

      try {
        // Fetch individual profile fields using the correct backend routes
        const [emailRes, phoneRes, dobRes, zipcodeRes, avatarRes] =
          await Promise.all([
            apiFetch({ endpoint: "/email" }),
            apiFetch({ endpoint: "/phone" }),
            apiFetch({ endpoint: "/dob" }),
            apiFetch({ endpoint: "/zipcode" }),
            apiFetch({ endpoint: "/avatar" }),
          ]);

        // Check for any failed fetches
        if (
          emailRes.status !== 200 ||
          phoneRes.status !== 200 ||
          dobRes.status !== 200 ||
          zipcodeRes.status !== 200 ||
          avatarRes.status !== 200
        ) {
          throw new Error("Failed to fetch some profile data");
        }

        const fetchedUserData: UserData = {
          username: user.username,
          email: emailRes.data.email,
          phone: phoneRes.data.phone,
          dob: new Date(dobRes.data.dob),
          zipcode: zipcodeRes.data.zipcode,
          avatarUrl: avatarRes.data.avatar || undefined, // Optional
        };

        setUserData(fetchedUserData);
      } catch (err) {
        setError("Failed to load profile data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user, authLoading]);

  /**
   * Updates the user's profile, including avatar upload if a file is provided.
   * @param formData - The FormData object containing profile updates.
   */
  const updateProfile = async (formData: FormData) => {
    if (!userData) return;

    try {
      setLoading(true);
      setError(null);

      // Handle avatar upload first, if a file is present
      const avatarFile = formData.get("avatar") as File | null;
      let avatarUrl: string | undefined = undefined;

      if (avatarFile && avatarFile.size > 0) {
        const avatarFormData = new FormData();
        avatarFormData.append("avatar", avatarFile);

        const uploadResponse = await apiFetch({
          endpoint: "/avatar",
          method: "PUT",
          body: avatarFormData,
          isFormData: true, // Indicate that this is a FormData request
        });

        if (uploadResponse.status === 200 && uploadResponse.data.avatar) {
          avatarUrl = uploadResponse.data.avatar;
        } else {
          throw new Error(
            uploadResponse.data.message || "Failed to upload avatar."
          );
        }
      }

      // Prepare update requests for other profile fields
      const updates: Partial<UserData> = {};

      const email = formData.get("email") as string;
      const phone = formData.get("phone") as string;
      const zipcode = formData.get("zipcode") as string;
      const password = formData.get("password") as string;

      const updatePromises = [];

      if (email && email !== userData.email) {
        updatePromises.push(
          apiFetch({
            endpoint: "/email",
            method: "PUT",
            body: { email },
          })
        );
        updates.email = email;
      }

      if (phone && phone !== userData.phone) {
        updatePromises.push(
          apiFetch({
            endpoint: "/phone",
            method: "PUT",
            body: { phone },
          })
        );
        updates.phone = phone;
      }

      if (zipcode && zipcode !== userData.zipcode) {
        updatePromises.push(
          apiFetch({
            endpoint: "/zipcode",
            method: "PUT",
            body: { zipcode },
          })
        );
        updates.zipcode = zipcode;
      }

      if (password) {
        updatePromises.push(
          apiFetch({
            endpoint: "/password",
            method: "PUT",
            body: { password },
          })
        );
      }

      if (avatarUrl) {
        updates.avatarUrl = avatarUrl;
      }

      if (updatePromises.length > 0) {
        const responses = await Promise.all(updatePromises);

        // Check for any failed updates
        const failedUpdates = responses.filter((res) => res.status !== 200);
        if (failedUpdates.length > 0) {
          throw new Error("One or more profile updates failed");
        }
      }

      // Update the local state with the new data
      setUserData((prev) => ({
        ...prev!,
        ...updates,
      }));

      setLoading(false);
      alert("Profile updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      console.error(err);
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userData) {
    return <div>No user data available.</div>;
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
              {userData.avatarUrl ? (
                <AvatarImage src={userData.avatarUrl} alt={userData.username} />
              ) : (
                <AvatarFallback>
                  {userData.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{userData.username}</h2>
              <p className="text-gray-500">{userData.email}</p>
              <p className="text-gray-500">{userData.phone}</p>
              <p className="text-gray-500">{userData.zipcode}</p>
            </div>
          </div>
          <ProfileForm user={userData} updateProfile={updateProfile} />
        </div>
      </CardContent>
    </Card>
  );
}
