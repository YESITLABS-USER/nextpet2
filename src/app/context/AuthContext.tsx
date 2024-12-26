"use client";
import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AuthContextType {
  isAuthenticated: boolean;
  isBreederAuthenticated: boolean;
  isLoading: boolean; // Add a loading state
  login: (token: Token) => void;
  logout: () => void;
}

interface Token {
  type: "user-type" | "breeder-admin-type";
  user_id: string; // Assuming user_id is part of the token
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isBreederAuthenticated, setIsBreederAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Loading state
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      try {
        const parsedToken = JSON.parse(token);

        if (parsedToken.type === "user-type") {
          setIsAuthenticated(true);
          setIsBreederAuthenticated(false);
          localStorage.removeItem("breeder_user_id");
        } else if (parsedToken.type === "breeder-admin-type") {
          setIsAuthenticated(false);
          setIsBreederAuthenticated(true);
          localStorage.removeItem("user_user_id");
        } else {
          setIsAuthenticated(false);
          setIsBreederAuthenticated(false);
        }
      } catch (error) {
        console.error("Failed to parse token from localStorage", error);
        setIsAuthenticated(false);
        setIsBreederAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
      setIsBreederAuthenticated(false);
    }
    setIsLoading(false); // Mark initialization as complete
  }, []);

  const login = (token: Token) => {
    localStorage.setItem("authToken", JSON.stringify(token));
    if (token.type === "user-type") {
      setIsAuthenticated(true);
    } else if (token.type === "breeder-admin-type") {
      setIsBreederAuthenticated(true);
    }
    router.push("/user/sign-in");
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user_user_id");
    localStorage.removeItem("breeder_user_id");
    setIsAuthenticated(false);
    window.location.href = "/user/sign-in";
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isBreederAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
