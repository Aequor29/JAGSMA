// @/app/registration/page.tsx

import SignUp from "@/components/registration/SignUp";
import Login from "@/components/registration/Login";
export default function registration() {
  return (
    <div className="mt-4 flex justify-center">
      <SignUp />
      <div className="ms-4">
        <Login />
      </div>
    </div>
  );
}
