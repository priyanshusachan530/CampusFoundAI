import React, { useState, useEffect } from "react";
import {
  Bell,
  Send,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  Users,
  Megaphone
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getNotifications, saveNotification, deleteNotification, getUsers } from "../../utils/storage.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDateTime } from "../../utils/helpers.js";

export default function AdminNotifications() {
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);

  // Form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [targetAudience, setTargetAudience] = useState("all"); // 'all', 'Student', 'Faculty'
  const [sending, setSending] = useState(false);

  const loadData = () => {
    setNotifications(getNotifications());
    setUsers(getUsers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      addToast("Please fill in both title and message.", "error");
      return;
    }

    setSending(true);

    setTimeout(() => {
      // Find eligible recipient user IDs
      const recipients = users.filter((u) => {
        if (targetAudience === "all") return true;
        return u.role === targetAudience;
      });

      recipients.forEach((rec) => {
        saveNotification({
          userId: rec.id,
          title: `[Campus Alert] ${title.trim()}`,
          message: message.trim(),
          type,
          link: "/notifications"
        });
      });

      setSending(false);
      setTitle("");
      setMessage("");
      loadData();
      addToast(`Broadcast sent to ${recipients.length} campus users!`, "success");
    }, 500);
  };

  const handleDelete = (id) => {
    deleteNotification(id);
    loadData();
    addToast("Notification removed.", "info");
  };

  return (
    <AdminLayout activeTab="notifications">
      <div className="space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-indigo-600" />
            Campus Broadcast & Security Notices
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish real-time announcements, urgent lost item alerts, and recovery notices to campus portal accounts.
          </p>
        </div>

        {/* Compose Broadcast Form */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-indigo-600" />
            Compose New Campus Broadcast
          </h3>

          <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Announcement Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Unclaimed Belongings Cleanout Notice - Science Building"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Audience
                </label>
                <select
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-3 py-2.5 focus:outline-hidden"
                >
                  <option value="all">All Campus Users ({users.length})</option>
                  <option value="Student">Students Only</option>
                  <option value="Faculty">Faculty Only</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Notice Type
              </label>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: "info", label: "General Info", icon: Info, color: "text-sky-500" },
                  { id: "warning", label: "Urgent Warning", icon: AlertTriangle, color: "text-amber-500" },
                  { id: "match", label: "Item Match Notice", icon: Sparkles, color: "text-indigo-500" }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                      type === t.id
                        ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300"
                        : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    }`}
                  >
                    <t.icon className={`w-3.5 h-3.5 ${t.color}`} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Broadcast Body Message
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write the full message to be delivered to user in-app notification inboxes..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "Broadcasting..." : "Send Announcement"}
              </button>
            </div>
          </form>
        </div>

        {/* Sent History Ledger */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent System Notification Ledger ({notifications.length})
          </h3>

          <div className="space-y-2.5">
            {notifications.slice(0, 8).map((notif) => (
              <div
                key={notif.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {notif.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.2 rounded-md uppercase font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block pt-0.5">
                    {formatDateTime(notif.createdAt)} • User ID: {notif.userId || "All"}
                  </span>
                </div>

                <button
                  onClick={() => handleDelete(notif.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  title="Remove"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
