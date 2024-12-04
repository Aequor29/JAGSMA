// components/Navbar.tsx

"use client";

import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/app/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/dark-mode/ModeToggle";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";

export default function Navbar() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState<boolean>(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    router.push("/registration");
  };

  useEffect(() => {
    const fetchAvatar = async () => {
      if (user) {
        setAvatarLoading(true);
        setAvatarError(null);
        try {
          const response = await apiFetch({ endpoint: "/avatar" });
          if (response.status === 200 && response.data.avatar) {
            setAvatarUrl(response.data.avatar);
          } else {
            // Handle case where avatar is not available
            setAvatarUrl(null);
          }
        } catch (error) {
          console.error("Failed to fetch avatar:", error);
          setAvatarError("Failed to load avatar");
          setAvatarUrl(null);
        } finally {
          setAvatarLoading(false);
        }
      } else {
        setAvatarUrl(null);
      }
    };

    fetchAvatar();
  }, [user]);

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/main" className="flex items-center space-x-2">
          <span className="font-bold">JAGSMA</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {avatarLoading ? (
                    <AvatarFallback>U</AvatarFallback>
                  ) : avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={user?.username || "User"}
                    />
                  ) : (
                    <AvatarFallback>
                      {user ? user.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {user ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/registration">Login</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
