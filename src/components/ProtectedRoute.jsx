import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, adminOnly = false, securityOnly = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Verifying campus session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== "Administrator" && user.role !== "Security Staff") {
    return <Navigate to="/dashboard" replace />;
  }

  if (securityOnly && user.role !== "Security Staff" && user.role !== "Administrator") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
