import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";

// Components
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Chatbot from "./components/Chatbot.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Public & Student Pages
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import SearchItems from "./pages/SearchItems.jsx";
import ItemDetails from "./pages/ItemDetails.jsx";
import ReportLost from "./pages/ReportLost.jsx";
import ReportFound from "./pages/ReportFound.jsx";
import Matches from "./pages/Matches.jsx";
import MyReports from "./pages/MyReports.jsx";
import Claims from "./pages/Claims.jsx";
import Analytics from "./pages/Analytics.jsx";
import HowItWorks from "./pages/HowItWorks.jsx";
import About from "./pages/About.jsx";
import Assistant from "./pages/Assistant.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import Settings from "./pages/Settings.jsx";

// Admin Suite Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminLostItems from "./pages/admin/AdminLostItems.jsx";
import AdminFoundItems from "./pages/admin/AdminFoundItems.jsx";
import AdminMatches from "./pages/admin/AdminMatches.jsx";
import AdminClaims from "./pages/admin/AdminClaims.jsx";
import AdminReceivedItems from "./pages/admin/AdminReceivedItems.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminNotifications from "./pages/admin/AdminNotifications.jsx";
import AdminAnalytics from "./pages/admin/AdminAnalytics.jsx";
import AdminSettings from "./pages/admin/AdminSettings.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen flex flex-col bg-[lightblue] dark:bg-[#0b1322] text-slate-900 dark:text-slate-100 transition-colors duration-200">
              <Navbar />

              <div className="flex-1">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/search" element={<SearchItems />} />
                  <Route path="/item/:id" element={<ItemDetails />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/about" element={<About />} />

                  {/* Protected user routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report-lost"
                    element={
                      <ProtectedRoute>
                        <ReportLost />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/report-found"
                    element={
                      <ProtectedRoute>
                        <ReportFound />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/matches"
                    element={
                      <ProtectedRoute>
                        <Matches />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/my-reports"
                    element={
                      <ProtectedRoute>
                        <MyReports />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/claims"
                    element={
                      <ProtectedRoute>
                        <Claims />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/assistant"
                    element={
                      <ProtectedRoute>
                        <Assistant />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/notifications"
                    element={
                      <ProtectedRoute>
                        <Notifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Suite */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/lost-items"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminLostItems />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/found-items"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminFoundItems />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/matches"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminMatches />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/claims"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminClaims />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/received-items"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminReceivedItems />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminUsers />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/notifications"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminNotifications />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/settings"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminSettings />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>

              {/* Floating AI Chatbot Assistant */}
              <Chatbot />

              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
