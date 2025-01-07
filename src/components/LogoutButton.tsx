"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 hover:bg-gray-300 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus-visible:ring-2"
      aria-label="Logout from dashboard"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      <span>Logout</span>
    </button>
  );
}
