import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import Modal from "../components/Modal.jsx";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in both your email address and password.");
      return;
    }

    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      addToast(`Welcome back, ${res.user.name}!`, "success");
      if (res.user.role === "Administrator") {
        navigate("/admin");
      } else {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
      }
    } else {
      setError(res.error || "Authentication failed. Please check your credentials.");
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setIsSubmitting(true);
    const res = await loginWithGoogle();
    setIsSubmitting(false);

    if (res.success) {
      addToast(`Welcome, ${res.user.name}!`, "success");
      if (res.user.role === "Administrator") {
        navigate("/admin");
      } else {
        const from = location.state?.from?.pathname || "/dashboard";
        navigate(from);
      }
    } else {
      setError(res.error || "Google authentication failed.");
    }
  };

  const handleQuickDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError("");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full space-y-6">
        {/* Card Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 mb-3">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Sign in to CampusLinkAI
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Access your lost item reports, match alerts, and verified claims.
          </p>
        </div>

        {/* Demo Account Fillers */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
            Quick Demo Accounts (1-Click Fill)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              id="demo-student-btn"
              onClick={() => handleQuickDemo("student@smartfind.com", "student123")}
              className="px-2.5 py-1.5 text-left text-xs rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition"
            >
              <span className="font-bold block text-slate-900 dark:text-white">Student Demo</span>
              <span className="text-[10px] text-slate-500 truncate block">Rahul Sharma</span>
            </button>
            <button
              type="button"
              id="demo-admin-btn"
              onClick={() => handleQuickDemo("admin@smartfind.com", "admin123")}
              className="px-2.5 py-1.5 text-left text-xs rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition"
            >
              <span className="font-bold block text-slate-900 dark:text-white">Admin Demo</span>
              <span className="text-[10px] text-slate-500 truncate block">Dr. Ananya Roy</span>
            </button>
            <button
              type="button"
              id="demo-security-btn"
              onClick={() => handleQuickDemo("security@smartfind.com", "security123")}
              className="px-2.5 py-1.5 text-left text-xs rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition"
            >
              <span className="font-bold block text-slate-900 dark:text-white">Security Staff</span>
              <span className="text-[10px] text-slate-500 truncate block">Officer Patil</span>
            </button>
            <button
              type="button"
              id="demo-faculty-btn"
              onClick={() => handleQuickDemo("faculty@smartfind.com", "faculty123")}
              className="px-2.5 py-1.5 text-left text-xs rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-700 transition"
            >
              <span className="font-bold block text-slate-900 dark:text-white">Faculty Demo</span>
              <span className="text-[10px] text-slate-500 truncate block">Prof. Malhotra</span>
            </button>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Google 1-Click Sign-In */}
          <button
            type="button"
            id="login-google-btn"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-xs flex items-center justify-center gap-2.5 transition cursor-pointer"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative my-5 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                College Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@smartfind.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  id="forgot-password-trigger"
                  onClick={() => setForgotModalOpen(true)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  id="login-password-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me-checkbox"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <label htmlFor="remember-me-checkbox" className="ml-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                Remember me on this browser
              </label>
            </div>

            <button
              type="submit"
              id="login-submit-btn"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition"
            >
              {isSubmitting ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              New to campus?{" "}
              <Link id="login-to-register-link" to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        title="Reset Campus Account Access"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-400">
            Enter your college registered email. In this demonstration environment, password resets are simulated.
          </p>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Registered Email
            </label>
            <input
              id="reset-email-input"
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder="e.g. student@smartfind.com"
              className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-900 dark:text-amber-200">
            <p className="font-bold">Default Demo Passwords:</p>
            <p className="mt-0.5">student@smartfind.com → student123</p>
            <p>admin@smartfind.com → admin123</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setForgotModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              id="reset-submit-btn"
              onClick={() => {
                addToast("Password reset instructions sent to your campus email.", "success");
                setForgotModalOpen(false);
              }}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
            >
              Send Reset Link
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
