"use client";

import { DashboardLayout } from "../layouts/dashboard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check for JWT token
    const token = localStorage.getItem("token");

    if (!token) {
      // No token found, redirect to login
      router.push("/login");
      return;
    }
//  i am left to create api for verificaction of the equality of JWT . To verify the jkwt stored in the localk storage is same as the JET tahat will be generated for the current user trying to log in 
    // Verify token with backend
    // const verifyToken = async () => {
    //   try {
    //     const response = await fetch(
    //       "https://hackorgbackend.onrender.com/api/verify",
    //       {
    //         method: "GET",
    //         headers: {
    //           Authorization: `Bearer ${token}`,
    //         },
    //       },
    //     );

    //     if (!response.ok) {
    //       // Token invalid, clear and redirect
    //       localStorage.removeItem("token");
    //       router.push("/login");
    //     }
    //   } catch (error) {
    //     console.error("Token verification failed:", error);
    //     // Optionally redirect on error
    //     // router.push("/login");
    //   }
    // };

    // verifyToken();
  }, [router]);
  return <DashboardLayout>{children}</DashboardLayout>;
}
