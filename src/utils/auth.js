/**
 * Authentication utility functions with localStorage session persistence
 */

import { getUsers, getCurrentUser, setCurrentUser, saveUser } from "./storage.js";

export function loginUser(email, password, rememberMe = false) {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
  );

  if (!user) {
    return { success: false, error: "No account found with this email address." };
  }

  if (user.password !== password) {
    return { success: false, error: "Incorrect password. Please try again." };
  }

  if (user.disabled) {
    return { success: false, error: "This campus account has been deactivated by administration." };
  }

  setCurrentUser(user);

  if (rememberMe && typeof window !== "undefined") {
    localStorage.setItem("smartfind_remember_email", email);
  } else if (typeof window !== "undefined") {
    localStorage.removeItem("smartfind_remember_email");
  }

  return { success: true, user };
}

export function registerUser(data) {
  const users = getUsers();
  const existing = users.find(
    (u) => u.email.toLowerCase().trim() === data.email.toLowerCase().trim()
  );

  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name: data.name.trim(),
    email: data.email.toLowerCase().trim(),
    password: data.password,
    phone: data.phone || "",
    role: data.role || "Student",
    studentId: data.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
    department: data.department || "General",
    avatar: data.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
    createdAt: new Date().toISOString().split("T")[0],
    recoveredCount: 0,
    disabled: false
  };

  const saved = saveUser(newUser);
  setCurrentUser(saved);

  return { success: true, user: saved };
}

export function logoutUser() {
  setCurrentUser(null);
  return { success: true };
}

export function getStoredCurrentUser() {
  return getCurrentUser();
}

export function isUserAdmin(user) {
  return user && user.role === "Administrator";
}

export function isUserSecurity(user) {
  return user && (user.role === "Security Staff" || user.role === "Administrator");
}
