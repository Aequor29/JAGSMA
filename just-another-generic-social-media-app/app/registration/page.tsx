// app/registration/page.tsx

"use client";

import { useState } from "react";
import SignUp from "@/components/registration/SignUp";
import Login from "@/components/registration/Login";
import { Button } from "@/components/ui/button";

export default function Registration() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

  return (
    <div className="mt-4 flex flex-col items-center">
      <div className="mb-4">
        <Button
          variant={isLogin ? "default" : "ghost"}
          onClick={() => setIsLogin(true)}
          className="mr-2"
        >
          Login
        </Button>
        <Button
          variant={!isLogin ? "default" : "ghost"}
          onClick={() => setIsLogin(false)}
        >
          Sign Up
        </Button>
      </div>
      {isLogin ? <Login /> : <SignUp />}
    </div>
  );
}
