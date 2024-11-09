// components/main/FollowedUsers.tsx
import { Button } from "@/components/ui/button";

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
  return (
    <div className="flex justify-between items-center p-2">
      <div className="flex items-center space-x-2">
        <img
          src={imageURL}
          alt={`${userName}'s avatar`}
          className="h-8 w-8 rounded-full"
        />
        <div>
          <h4 className="font-semibold">{userName}</h4>
          <p className="text-sm text-gray-500">{userHeadLine}</p>{" "}
          {/* Displaying user's headline */}
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onUnfollow}>
        Unfollow
      </Button>
    </div>
  );
}
