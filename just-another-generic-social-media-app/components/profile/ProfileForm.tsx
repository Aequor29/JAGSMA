// components/profile/ProfileForm.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserData = {
  username: string;
  email: string;
  phone: string;
  zipcode: string;
  dob: Date;
  avatarUrl?: string;
};

type ProfileFormProps = {
  user: UserData;
  updateProfile: (formData: FormData) => Promise<void>;
};

export function ProfileForm({ user, updateProfile }: ProfileFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  const validateForm = (formData: FormData) => {
    const newErrors: Record<string, string> = {};
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const zipcode = formData.get("zipcode") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (phone && !/^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(phone)) {
      newErrors.phone = "Invalid phone number format. Use 10 digit number";
    }
    if (zipcode && !/^\d{5}$/.test(zipcode)) {
      newErrors.zipcode = "Invalid zipcode. Must be 5 digits";
    }
    if (password && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    const formData = new FormData(e.currentTarget);
    if (validateForm(formData)) {
      await updateProfile(formData);
      setSuccessMessage("Profile updated successfully!");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username field is disabled since it should not be updated */}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          name="username"
          defaultValue={user.username}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" defaultValue={user.email} />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" defaultValue={user.phone} />
        {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="zipcode">Zipcode</Label>
        <Input id="zipcode" name="zipcode" defaultValue={user.zipcode} />
        {errors.zipcode && (
          <p className="text-red-500 text-sm">{errors.zipcode}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label>Date of Birth</Label>
        <Input
          id="dob"
          name="dob"
          type="date"
          defaultValue={user.dob.toISOString().split("T")[0]}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="Enter new password"
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="avatar" className="cursor-pointer">
            Upload New Picture
          </Label>
          <Input type="file" id="avatar" name="avatar" accept="image/*" />
        </div>
        <Button type="submit">Update Profile</Button>
        {successMessage && (
          <p className="text-green-500 text-sm">{successMessage}</p>
        )}
      </div>
    </form>
  );
}
