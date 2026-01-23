"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="px-6 py-2 font-semibold text-white bg-gray-900 rounded-lg border border-white transition-colors duration-300 hover:bg-gray-100"
    >
      Sign Out
    </button>
  );
}
