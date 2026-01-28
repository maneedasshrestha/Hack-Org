import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import SignOutButton from "../custom_components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/api/auth/signin");
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-white font-sans">
      <div className="bg-gray-900 text-white p-8 rounded-xl shadow-lg max-w-sm w-full text-center">
        <h1 className="text-3xl font-bold mb-4">
          Welcome, @{(session.user as any)?.username || session.user?.name}
        </h1>
        <p className="mb-6 text-gray-400">
          <strong>Email:</strong> {session.user?.email}
        </p>
        {session.user?.image && (
          <img
            src={session.user.image}
            alt="Avatar"
            className="w-24 h-24 mx-auto rounded-full border-2 border-white mb-6"
          />
        )}
        <p className="text-gray-500 text-sm">
          You are successfully logged in with GitHub.
        </p>
        <SignOutButton></SignOutButton>
      </div>
    </main>
  );
}
