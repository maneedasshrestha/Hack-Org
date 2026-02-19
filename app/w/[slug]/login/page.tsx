
"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white text-gray-900 font-sans">
      <div className="text-center p-8 border bg-gray-900 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-3xl font-bold mb-4 text-white">
          Login is required
        </h1>
        <p className="mb-6 text-gray-300">Please log in to continue</p>
        <button
          onClick={() => signIn("github")}
          className="px-8 py-3 font-semibold text-white bg-gray-800 rounded-lg border border-gray-800 transition-colors duration-300 hover:bg-white hover:text-gray-900"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
}