import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const { addToast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "Administrator") {
    // Show toast and redirect to user dashboard
    setTimeout(() => {
      addToast("Unauthorized: Administrator privileges required to access that area.", "warning");
    }, 100);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
