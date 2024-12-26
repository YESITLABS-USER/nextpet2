"use client";
import React from "react";
import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const BreederProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isBreederAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !isBreederAuthenticated) {
      toast.error("Please Login First...");
      router.push("/breeder/sign-in"); // Redirect to breeder login if not authenticated
    }
  }, [isBreederAuthenticated, isLoading, router]);

  if (isLoading) return <div>Loading...</div>; // Show loader while determining authentication
  if (!isBreederAuthenticated) return null;

  return <>{children}</>;
};

export default BreederProtectedRoute;
