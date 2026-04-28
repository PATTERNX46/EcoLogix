import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { ReactNode } from "react";

// Define our props using the standard ReactNode type
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuthStore();

  // Added a cooler loading state to match the Resilio OS vibe
  if (isLoading) {
    return (
      <div className="bg-[#09090b] h-screen w-screen flex items-center justify-center text-emerald-400 font-mono text-sm">
        <span className="animate-pulse">&gt; Authenticating Secure Connection...</span>
      </div>
    );
  }

  // Kick to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Kick to default dashboard if they lack the specific role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  // Render the protected page
  return <>{children}</>;
};