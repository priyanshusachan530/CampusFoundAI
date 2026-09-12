import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Compass,
  Search,
  PlusCircle,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Sparkles,
  FileText,
  Settings,
  HelpCircle,
  FolderCheck
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getNotifications, updateNotification, markAllNotificationsRead } from "../utils/storage.js";
import NotificationPanel from "./NotificationPanel.jsx";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [navSearchQuery, setNavSearchQuery] = useState("");

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const loadNotifs = () => {
      const list = getNotifications(user?.id);
      setNotifications(list);
    };

    loadNotifs();

    const handleUpdate = () => {
      loadNotifs();
    };

    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, [user, location.pathname]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setProfileDropdownOpen(false);
    setNotifDropdownOpen(false);
  }, [location.pathname]);

  const handleNavSearch = (e) => {
    e.preventDefault();
    if (navSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(navSearchQuery.trim())}`);
      setNavSearchQuery("");
    }
  };

  const handleMarkRead = (id) => {
    updateNotification(id, { read: true });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(user?.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const isActive = (path) => {
    if (path.includes("?")) {
      return location.pathname + location.search === path;
    }
    return location.pathname === path;
  };

  return (
    <header
      id="main-navbar"
      className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-6">
            <Link
              id="brand-logo-link"
              to="/"
              className="flex items-center gap-2.5 focus:outline-hidden group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition duration-200">
                <Compass className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                  CampusLink<span className="text-indigo-600 dark:text-indigo-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Campus Lost & Found
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300">
              <Link
                id="nav-link-home"
                to="/"
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive("/")
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                Home
              </Link>
              <Link
                id="nav-link-lost"
                to="/search?type=lost"
                className={`px-3 py-1.5 rounded-lg transition ${
                  location.search.includes("type=lost")
                    ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                Lost Items
              </Link>
              <Link
                id="nav-link-found"
                to="/search?type=found"
                className={`px-3 py-1.5 rounded-lg transition ${
                  location.search.includes("type=found")
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                Found Items
              </Link>
              <Link
                id="nav-link-how-it-works"
                to="/how-it-works"
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive("/how-it-works")
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                How It Works
              </Link>
              <Link
                id="nav-link-about"
                to="/about"
                className={`px-3 py-1.5 rounded-lg transition ${
                  isActive("/about")
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold"
                    : "hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60"
                }`}
              >
                About
              </Link>
            </nav>
          </div>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-2.5">
            {/* Quick Nav Search (Desktop) */}
            <form onSubmit={handleNavSearch} className="hidden lg:block relative">
              <input
                id="nav-quick-search-input"
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                placeholder="Quick search..."
                className="w-44 focus:w-56 text-xs pl-8 pr-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200 focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </form>

            {/* Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleDarkMode}
              className="p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
              title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notification Bell Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                id="notification-bell-btn"
                onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                className="relative p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse ring-2 ring-white dark:ring-slate-900" />
                )}
              </button>

              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <NotificationPanel
                    notifications={notifications}
                    onMarkAsRead={handleMarkRead}
                    onMarkAllRead={handleMarkAllRead}
                    onClose={() => setNotifDropdownOpen(false)}
                    isDropdown={true}
                  />
                </div>
              )}
            </div>

            {/* Primary Action Buttons (Desktop) */}
            <div className="hidden sm:flex items-center gap-2">
              <Link
                id="btn-report-lost-nav"
                to="/report-lost"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Lost</span>
              </Link>

              <Link
                id="btn-report-found-nav"
                to="/report-found"
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Report Found</span>
              </Link>
            </div>

            {/* User Account / Login */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 transition"
                  aria-label="User account menu"
                >
                  <span className="hidden md:inline max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                  />
                </button>

                {profileDropdownOpen && (
                  <div
                    id="user-dropdown-menu"
                    className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-xs font-medium text-slate-700 dark:text-slate-200 animate-in fade-in slide-in-from-top-2 duration-150"
                  >
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {user.role}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        id="user-menu-dashboard"
                        to={isAdmin ? "/admin" : "/dashboard"}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        <span>{isAdmin ? "Admin Dashboard" : "Dashboard"}</span>
                      </Link>

                      <Link
                        id="user-menu-reports"
                        to="/my-reports"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <FileText className="w-4 h-4 text-slate-500" />
                        <span>My Reports</span>
                      </Link>

                      <Link
                        id="user-menu-matches"
                        to="/matches"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>AI Matches</span>
                      </Link>

                      <Link
                        id="user-menu-claims"
                        to="/claims"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <FolderCheck className="w-4 h-4 text-emerald-500" />
                        <span>Claims Center</span>
                      </Link>

                      <Link
                        id="user-menu-profile"
                        to="/profile"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <User className="w-4 h-4 text-slate-500" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        id="user-menu-settings"
                        to="/settings"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      >
                        <Settings className="w-4 h-4 text-slate-500" />
                        <span>Settings</span>
                      </Link>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        id="user-menu-logout-btn"
                        onClick={() => {
                          logout();
                          navigate("/login");
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                id="nav-login-btn"
                to="/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-xs"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-4 duration-200"
        >
          {/* Mobile search bar */}
          <form onSubmit={handleNavSearch} className="relative mb-3">
            <input
              type="text"
              value={navSearchQuery}
              onChange={(e) => setNavSearchQuery(e.target.value)}
              placeholder="Search lost & found items..."
              className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:outline-hidden"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          </form>

          <div className="grid grid-cols-2 gap-2 pb-2">
            <Link
              id="mobile-report-lost-btn"
              to="/report-lost"
              className="py-2.5 px-3 text-center text-xs font-semibold rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
            >
              + Report Lost
            </Link>
            <Link
              id="mobile-report-found-btn"
              to="/report-found"
              className="py-2.5 px-3 text-center text-xs font-semibold rounded-xl bg-emerald-600 text-white"
            >
              + Report Found
            </Link>
          </div>

          <div className="space-y-1 text-sm font-medium text-slate-700 dark:text-slate-200">
            <Link
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>Home</span>
            </Link>
            <Link
              to="/search?type=lost"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 text-rose-500" />
              <span>Lost Items Catalog</span>
            </Link>
            <Link
              to="/search?type=found"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              <span>Found Items Catalog</span>
            </Link>
            <Link
              to="/how-it-works"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>How It Works</span>
            </Link>
            <Link
              to="/about"
              className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Compass className="w-4 h-4 text-slate-500" />
              <span>About CampusLinkAI</span>
            </Link>

            {user && (
              <>
                <div className="my-2 border-t border-slate-100 dark:border-slate-800" />
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-indigo-600 dark:text-indigo-400"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isAdmin ? "Admin Portal" : "Student Dashboard"}</span>
                </Link>
                <Link
                  to="/matches"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Matches</span>
                </Link>
                <Link
                  to="/assistant"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  <span>AI Assistant Chat</span>
                </Link>
                <Link
                  to="/analytics"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Compass className="w-4 h-4 text-sky-500" />
                  <span>Campus Analytics</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 text-slate-500" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            )}

            {!user && (
              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full block py-2.5 text-center text-xs font-semibold bg-indigo-600 text-white rounded-xl shadow-xs"
                >
                  Sign In to Campus Portal
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
