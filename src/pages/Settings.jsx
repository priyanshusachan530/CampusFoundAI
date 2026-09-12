import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Shield,
  RotateCcw,
  Download,
  Save,
  CheckCircle2,
  Lock
} from "lucide-react";
import Sidebar from "../components/Sidebar.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  getSettings,
  saveSettings,
  resetDemoData,
  getItems,
  getClaims,
  getNotifications
} from "../utils/storage.js";

export default function Settings() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [settings, setSettingsState] = useState({
    darkMode: false,
    emailAlerts: true,
    matchAlerts: true,
    pushNotifications: true,
    language: "English (US)",
    privacyPublicContact: false
  });

  useEffect(() => {
    const loaded = getSettings();
    setSettingsState(loaded);
  }, []);

  const handleToggle = (key) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettingsState(updated);
    saveSettings(updated);

    if (key === "darkMode") {
      if (updated.darkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    saveSettings(settings);
    addToast("Preferences saved successfully!", "success");
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all mock campus items, claims, and matches back to demo default?")) {
      resetDemoData();
      addToast("Campus demo data has been reset to initial state.", "info");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  const handleExportData = () => {
    const items = getItems().filter((i) => i.userId === user?.id);
    const claims = getClaims().filter((c) => c.claimantId === user?.id);
    const notifs = getNotifications(user?.id);

    const exportBundle = {
      exportDate: new Date().toISOString(),
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        studentId: user?.studentId,
        department: user?.department
      },
      reports: items,
      claims,
      notifications: notifs
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `smartfind-data-${user?.studentId || "user"}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast("Your account data bundle was exported successfully.", "success");
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <SettingsIcon className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Preferences
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your alerts, display themes, anti-fraud privacy protocols, and data export tools.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* 1. Notification Channels */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              Notification & Alert Channels
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Instant AI Match Notifications
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Notify me immediately when an item matching my lost report is logged by security.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("matchAlerts")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.matchAlerts ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.matchAlerts ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Campus Email Alerts
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Receive verification updates and security claim status notices via your student email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("emailAlerts")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.emailAlerts ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.emailAlerts ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    In-App Push & Sound Alerts
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Display real-time notification banners inside the portal dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("pushNotifications")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.pushNotifications ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.pushNotifications ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Appearance & Display */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              Theme & Language
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Dark Theme Mode
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Switch between sleek dark interface and crisp daylight styling.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("darkMode")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.darkMode ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.darkMode ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Display Language
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    Select interface language for campus navigation and labels.
                  </p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) => {
                    const upd = { ...settings, language: e.target.value };
                    setSettingsState(upd);
                    saveSettings(upd);
                  }}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 px-3 py-1.5 focus:outline-hidden"
                >
                  <option>English (US)</option>
                  <option>English (UK)</option>
                  <option>Hindi / हिंदी</option>
                  <option>Spanish / Español</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Anti-Fraud & Privacy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Privacy & Anti-Fraud Security
            </h2>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200">
                    Public Contact Visibility
                  </h4>
                  <p className="text-slate-500 text-[11px]">
                    When disabled, your personal phone and email are hidden behind security verification.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("privacyPublicContact")}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.privacyPublicContact ? "bg-indigo-600" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.privacyPublicContact ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 4. Data Management Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-slate-600" />
              Data Portability & Maintenance
            </h2>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleExportData}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                Export My Data (.JSON)
              </button>

              <button
                type="button"
                onClick={handleResetData}
                className="px-4 py-2.5 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Demo Data
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save All Preferences
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
