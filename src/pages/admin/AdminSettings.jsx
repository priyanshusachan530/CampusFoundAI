import React, { useState } from "react";
import {
  Settings,
  Shield,
  Sliders,
  Clock,
  Bell,
  RefreshCw,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getSettings, updateSettings, initializeStorage } from "../../utils/storage.js";
import { useToast } from "../../context/ToastContext.jsx";

export default function AdminSettings() {
  const { addToast } = useToast();
  const [settings, setSettings] = useState(getSettings());
  const [retentionDays, setRetentionDays] = useState(90);
  const [deskHours, setDeskHours] = useState("24/7 Desk (Pickup: 8:00 AM – 8:00 PM)");
  const [deskRoom, setDeskRoom] = useState("Main Administration Building, Room 102");
  const [matchThreshold, setMatchThreshold] = useState(settings.matchThreshold || 60);
  const [emailAlerts, setEmailAlerts] = useState(settings.emailNotifications ?? true);
  const [smsAlerts, setSmsAlerts] = useState(settings.smsNotifications ?? true);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings({
      matchThreshold,
      emailNotifications: emailAlerts,
      smsNotifications: smsAlerts,
      retentionDays,
      deskHours,
      deskRoom
    });
    addToast("System security settings saved successfully.", "success");
  };

  const handleResetData = () => {
    if (
      window.confirm(
        "WARNING: This will reset all lost & found reports, claims, and matches back to the initial demo campus state. Continue?"
      )
    ) {
      localStorage.clear();
      initializeStorage();
      addToast("Database reset to demo state.", "info");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <AdminLayout activeTab="settings">
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-indigo-600" />
            System & Security Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Campus security protocol parameters, AI matching thresholds, and retention policies.
          </p>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          {/* Security Desk Parameters */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              Campus Custody Desk Operations
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Physical Office Location
                </label>
                <input
                  type="text"
                  value={deskRoom}
                  onChange={(e) => setDeskRoom(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Operating & Collection Hours
                </label>
                <input
                  type="text"
                  value={deskHours}
                  onChange={(e) => setDeskHours(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* AI Match Sensitivity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-500" />
              AI Matching Engine Sensitivity
            </h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Minimum Score Threshold to Trigger Automated Match Notification
                </span>
                <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {matchThreshold}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="85"
                step="5"
                value={matchThreshold}
                onChange={(e) => setMatchThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600"
              />
              <p className="text-[11px] text-slate-400">
                Recommended: 60%. Higher thresholds reduce false positives for generic accessories like chargers and notebooks.
              </p>
            </div>
          </div>

          {/* Retention & Anti-Fraud */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" />
              Campus Custody & Retention Policy
            </h3>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Maximum Storage Retention Period (Days)
              </label>
              <input
                type="number"
                value={retentionDays}
                onChange={(e) => setRetentionDays(parseInt(e.target.value, 10))}
                className="w-40 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-800 dark:text-slate-100 focus:outline-hidden"
              />
              <p className="text-[11px] text-slate-400">
                Unclaimed belongings held longer than this duration are transferred to university community donation programs.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600" />
            <h3 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Demo Maintenance & Database Reset
            </h3>
          </div>
          <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
            Need to restart the walkthrough or restore initial sample items? Resetting restores 14 rich campus test items, authentic simulated student matches, and system claims.
          </p>

          <button
            onClick={handleResetData}
            type="button"
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Database to Default Campus Demo State
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
