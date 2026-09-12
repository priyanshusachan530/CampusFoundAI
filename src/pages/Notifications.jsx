import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Info,
  Trash2,
  CheckCheck,
  ArrowRight,
  Inbox
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  getNotifications,
  updateNotification,
  markAllNotificationsRead,
  deleteNotification
} from "../utils/storage.js";
import Sidebar from "../components/Sidebar.jsx";
import { formatDateTime } from "../utils/helpers.js";

export default function Notifications() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, read, match, claim

  const loadNotifications = () => {
    const list = getNotifications(user?.id);
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();

    const handleUpdate = () => {
      loadNotifications();
    };
    window.addEventListener("campuslink_data_updated", handleUpdate);
    return () => window.removeEventListener("campuslink_data_updated", handleUpdate);
  }, [user]);

  const handleToggleRead = (id, currentStatus) => {
    updateNotification(id, { read: !currentStatus });
    loadNotifications();
    addToast(
      !currentStatus ? "Notification marked as read." : "Notification marked as unread.",
      "info"
    );
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead(user?.id);
    loadNotifications();
    addToast("All notifications marked as read.", "success");
  };

  const handleDelete = (id) => {
    deleteNotification(id);
    loadNotifications();
    addToast("Notification deleted.", "info");
  };

  const readCount = notifications.filter((n) => n.read).length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifs = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    if (filter === "match") return n.type === "match";
    if (filter === "claim") return n.type === "claim";
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case "match":
        return <Sparkles className="w-5 h-5 text-amber-500" />;
      case "claim":
        return <ShieldCheck className="w-5 h-5 text-indigo-500" />;
      case "status":
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default:
        return <Info className="w-5 h-5 text-sky-500" />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                <Bell className="w-4 h-4" />
              </span>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Notification Center
              </h1>
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Live updates on AI item matches, ownership claims, security verifications, and campus announcements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shadow-xs"
              >
                <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                Mark All as Read
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          {[
            { id: "all", label: "All Alerts", count: notifications.length },
            { id: "unread", label: "Unread", count: unreadCount },
            { id: "read", label: "Read", count: readCount },
            {
              id: "match",
              label: "AI Matches",
              count: notifications.filter((n) => n.type === "match").length
            },
            {
              id: "claim",
              label: "Claims",
              count: notifications.filter((n) => n.type === "claim").length
            }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 ${
                filter === tab.id
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filter === tab.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Notification List */}
        <div className="space-y-3">
          {filteredNotifs.length > 0 ? (
            filteredNotifs.map((notif) => (
              <div
                key={notif.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start justify-between gap-4 shadow-xs ${
                  !notif.read
                    ? "bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-900/60 ring-1 ring-indigo-500/20"
                    : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-800 shrink-0 mt-0.5">
                    {getNotifIcon(notif.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {notif.title}
                      </h4>
                      {!notif.read ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                          Unread
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          Read
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                      {notif.message}
                    </p>
                    <span className="text-[11px] text-slate-400 block pt-1">
                      {formatDateTime(notif.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      onClick={() => {
                        if (!notif.read) {
                          handleToggleRead(notif.id, false);
                        }
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900 text-indigo-700 dark:text-indigo-300 flex items-center gap-1 transition"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleToggleRead(notif.id, notif.read)}
                    className={`p-1.5 rounded-lg transition ${
                      notif.read
                        ? "text-slate-400 hover:text-indigo-600"
                        : "text-slate-400 hover:text-emerald-600"
                    }`}
                    title={notif.read ? "Mark as unread" : "Mark as read"}
                  >
                    <CheckCircle2 className={`w-4 h-4 ${notif.read ? "text-emerald-500" : ""}`} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(notif.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-3">
              <Inbox className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                No notifications found
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {filter === "unread"
                  ? "You're all caught up! No unread messages or match alerts right now."
                  : "You don't have any notifications under this filter at the moment."}
              </p>
              <Link
                to="/search"
                className="inline-block px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-xs"
              >
                Browse Campus Catalog
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
