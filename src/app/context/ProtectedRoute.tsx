"use client";
import React from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/"); // Redirect to homepage if not authenticated
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>; // Show loader while determining authentication
  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
