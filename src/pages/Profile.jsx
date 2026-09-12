import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  GraduationCap,
  Building,
  Shield,
  Key,
  Save,
  CheckCircle2,
  Package,
  Award
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { updateUser, getItems } from "../utils/storage.js";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
];

export default function Profile() {
  const { user, login } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [studentId, setStudentId] = useState(user?.studentId || "");
  const [department, setDepartment] = useState(user?.department || "");
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const items = getItems();
  const myReports = items.filter((i) => i.userId === user?.id);
  const recoveredCount = user?.recoveredCount || myReports.filter((i) => i.status === "SUCCESSFULLY_RECEIVED" || i.status === "RESOLVED").length;

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast("Name is required.", "error");
      return;
    }

    const updated = updateUser(user.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      studentId: studentId.trim(),
      department: department.trim(),
      avatar
    });

    addToast("Profile details updated successfully!", "success");
  };

  const handleChangePassword = (e) => {
    e.preventDefault();

    if (!currentPassword) {
      addToast("Please enter your current password.", "error");
      return;
    }

    if (user.password && currentPassword !== user.password) {
      addToast("Current password does not match.", "error");
      return;
    }

    if (newPassword.length < 6) {
      addToast("New password must be at least 6 characters.", "error");
      return;
    }

    if (newPassword !== confirmPassword) {
      addToast("New passwords do not match.", "error");
      return;
    }

    updateUser(user.id, { password: newPassword });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    addToast("Password changed successfully!", "success");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative group">
            <img
              src={avatar}
              alt={name}
              className="w-20 h-20 rounded-2xl object-cover ring-2 ring-indigo-500/20 shadow-md"
            />
          </div>

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {name || "Campus Member"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 w-fit mx-auto sm:mx-0">
                {user?.role || "Student"}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
              <span>{studentId ? `ID: ${studentId}` : "Campus Member"}</span>
              <span>•</span>
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{department || "General Department"}</span>
            </p>

            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Package className="w-4 h-4 text-indigo-500" />
                <span>{myReports.length} Reports Filed</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                <Award className="w-4 h-4 text-emerald-500" />
                <span>{recoveredCount} Items Recovered</span>
              </div>
            </div>
          </div>
        </div>

        {/* Avatar Preset Selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Choose Profile Picture
          </h3>
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {AVATAR_PRESETS.map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setAvatar(url)}
                className={`p-1 rounded-xl border-2 transition ${
                  avatar === url
                    ? "border-indigo-600 scale-105"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                <img src={url} alt="preset" className="w-12 h-12 rounded-lg object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Edit Details Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              Personal & Academic Details
            </h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Campus Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Student / Employee ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. STU-2024-889"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Department / Major
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-indigo-600" />
              Security & Password
            </h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs max-w-md">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 shadow-xs transition flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                Update Password
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
