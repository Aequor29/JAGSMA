// components/main/FollowedUsers.tsx
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

interface FollowedUsersProps {
  userName: string;
  userHeadLine: string;
  imageURL: string;
  onUnfollow: () => void;
}

export default function FollowedUsers({
  userName,
  userHeadLine,
  imageURL,
  onUnfollow,
}: FollowedUsersProps) {
  const [isUnfollowing, setIsUnfollowing] = useState(false);

  const handleUnfollow = async () => {
    setIsUnfollowing(true);
    try {
      await onUnfollow();
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsUnfollowing(false);
    }
  };

  return (
    <div className="flex justify-between items-center p-2 hover:bg-gray-100 rounded-md">
      <div className="flex items-center space-x-2">
        <Avatar className="h-8 w-8">
          {imageURL ? (
            <AvatarImage src={imageURL} alt={`${userName}'s avatar`} />
          ) : (
            <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
          )}
        </Avatar>
        <div>
          <h4 className="font-semibold">{userName}</h4>
          <p className="text-sm text-gray-500">{userHeadLine}</p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUnfollow}
        disabled={isUnfollowing}
      >
        {isUnfollowing ? "Unfollowing..." : "Unfollow"}
      </Button>
    </div>
  );
}
