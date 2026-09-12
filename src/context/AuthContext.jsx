import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile as updateFirebaseProfile
} from "firebase/auth";
import { auth, googleProvider, isFirebaseConfigured } from "../config/firebase.js";
import {
  getCurrentUser,
  setCurrentUser as persistCurrentUser,
  getUsers,
  saveUser,
  updateUser,
  initializeStorage
} from "../utils/storage.js";

const AuthContext = createContext(null);

function checkIsAdmin(email, existingRole) {
  if (existingRole === "Administrator") return true;
  if (!email) return false;
  const configuredAdminEmail = import.meta.env.VITE_ADMIN_EMAIL?.trim().toLowerCase();
  const lowerEmail = email.trim().toLowerCase();
  if (configuredAdminEmail && lowerEmail === configuredAdminEmail) return true;
  if (lowerEmail.includes("admin")) return true;
  return false;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
    const stored = getCurrentUser();
    if (stored) {
      setUser(stored);
    }

    // Listen to Firebase Auth state
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const users = getUsers();
          const existing = users.find(
            (u) => u.id === fbUser.uid || u.email?.toLowerCase() === fbUser.email?.toLowerCase()
          );

          const isAdminEmail = checkIsAdmin(fbUser.email, existing?.role);

          const userProfile = {
            id: fbUser.uid,
            name: fbUser.displayName || existing?.name || fbUser.email?.split("@")[0] || "Campus Member",
            email: fbUser.email || "",
            role: existing?.role || (isAdminEmail ? "Administrator" : "Student"),
            studentId: existing?.studentId || `STU-${Math.floor(1000 + Math.random() * 9000)}`,
            department: existing?.department || "General Campus",
            phone: existing?.phone || "+91 98000 00000",
            avatar:
              fbUser.photoURL ||
              existing?.avatar ||
              `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
            recoveredCount: existing?.recoveredCount || 0
          };

          saveUser(userProfile);
          persistCurrentUser(userProfile);
          setUser(userProfile);
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. Check local quick demo accounts first (for instant preview testing)
    const localUsers = getUsers();
    const localFound = localUsers.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === password
    );

    if (localFound) {
      persistCurrentUser(localFound);
      setUser(localFound);
      return { success: true, user: localFound };
    }

    // 2. Authenticate against Firebase Auth
    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = res.user;

        const isAdminEmail = checkIsAdmin(fbUser.email);

        const userProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || fbUser.email?.split("@")[0] || "Campus Member",
          email: fbUser.email || cleanEmail,
          role: isAdminEmail ? "Administrator" : "Student",
          studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
          department: "General Campus",
          phone: "+91 98000 00000",
          avatar:
            fbUser.photoURL ||
            `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
          recoveredCount: 0
        };

        saveUser(userProfile);
        persistCurrentUser(userProfile);
        setUser(userProfile);
        return { success: true, user: userProfile };
      } catch (err) {
        let msg = "Invalid email or password.";
        if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
          msg = "No account found with these credentials. Please check your email or sign up.";
        } else if (err.code === "auth/wrong-password") {
          msg = "Incorrect password. Please try again or reset your password.";
        } else if (err.message) {
          msg = err.message;
        }
        return { success: false, error: msg };
      }
    }

    return { success: false, error: "Invalid email or password. Please try again." };
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      return { success: false, error: "Firebase is not configured yet." };
    }

    try {
      const res = await signInWithPopup(auth, googleProvider);
      const fbUser = res.user;

      const isAdminEmail = checkIsAdmin(fbUser.email);

      const userProfile = {
        id: fbUser.uid,
        name: fbUser.displayName || "Google User",
        email: fbUser.email || "",
        role: isAdminEmail ? "Administrator" : "Student",
        studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
        department: "General Campus",
        phone: fbUser.phoneNumber || "+91 98000 00000",
        avatar:
          fbUser.photoURL ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
        recoveredCount: 0
      };

      saveUser(userProfile);
      persistCurrentUser(userProfile);
      setUser(userProfile);
      return { success: true, user: userProfile };
    } catch (err) {
      console.error("Google sign-in error:", err);
      return {
        success: false,
        error: err.message || "Failed to sign in with Google. Please check your popup settings."
      };
    }
  };

  const register = async ({ name, email, password, role = "Student" }) => {
    const cleanEmail = email.trim().toLowerCase();

    // Check local accounts first
    const users = getUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: "An account with this email already exists." };
    }

    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const fbUser = res.user;

        await updateFirebaseProfile(fbUser, { displayName: name.trim() }).catch(() => {});

        const newUser = {
          id: fbUser.uid,
          name: name.trim(),
          email: cleanEmail,
          role,
          studentId:
            role === "Student"
              ? `STU-${Math.floor(1000 + Math.random() * 9000)}`
              : `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          department: "General Campus",
          phone: "+91 98000 00000",
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
          recoveredCount: 0
        };

        saveUser(newUser);
        persistCurrentUser(newUser);
        setUser(newUser);
        return { success: true, user: newUser };
      } catch (err) {
        let msg = "Could not register account. Please try again.";
        if (err.code === "auth/email-already-in-use") {
          msg = "An account with this email already exists in Firebase.";
        } else if (err.code === "auth/weak-password") {
          msg = "Password should be at least 6 characters.";
        } else if (err.message) {
          msg = err.message;
        }
        return { success: false, error: msg };
      }
    }

    // Fallback local registration
    const newUser = saveUser({
      name: name.trim(),
      email: cleanEmail,
      password,
      role,
      studentId:
        role === "Student"
          ? `STU-${Math.floor(1000 + Math.random() * 9000)}`
          : `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      department: "General Campus",
      phone: "+91 98000 00000",
      avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80`,
      recoveredCount: 0
    });

    persistCurrentUser(newUser);
    setUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth).catch(() => {});
    }
    persistCurrentUser(null);
    setUser(null);
  };

  const updateProfile = (updates) => {
    if (!user) return null;
    const updated = updateUser(user.id, updates);
    setUser(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: user?.role === "Administrator",
        isSecurity: user?.role === "Security Staff" || user?.role === "Administrator"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
