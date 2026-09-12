import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Sparkles, Shield, Check, Trash2, ArrowRight, CheckCheck } from "lucide-react";

export default function NotificationPanel({
  notifications = [],
  onMarkAsRead,
  onMarkAllRead,
  onDelete,
  onClose,
  isDropdown = false
}) {
  const [filter, setFilter] = useState("all"); // 'all', 'unread', 'read'

  const unreadCount = notifications.filter((n) => !n.read).length;
  const readCount = notifications.filter((n) => n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  return (
    <div
      id="notification-panel"
      className={`bg-white dark:bg-slate-900 ${
        isDropdown
          ? "w-80 sm:w-96 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4"
          : "w-full rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs"
      }`}
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</h4>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && onMarkAllRead && (
          <button
            id="mark-all-read-btn"
            onClick={onMarkAllRead}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs to easily show read / unread / all */}
      <div className="flex items-center gap-1 pt-2.5 pb-1 border-b border-slate-100 dark:border-slate-800 text-[11px] font-medium">
        <button
          onClick={() => setFilter("all")}
          className={`px-2.5 py-1 rounded-lg transition ${
            filter === "all"
              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("unread")}
          className={`px-2.5 py-1 rounded-lg transition ${
            filter === "unread"
              ? "bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter("read")}
          className={`px-2.5 py-1 rounded-lg transition ${
            filter === "read"
              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold"
              : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-300"
          }`}
        >
          Read ({readCount})
        </button>
      </div>

      <div className="mt-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500">
            <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">
              {filter === "read"
                ? "No read notifications yet."
                : filter === "unread"
                ? "You're all caught up! No unread notifications."
                : "No notifications yet."}
            </p>
            <p className="text-[11px] mt-0.5">We'll alert you when match candidates or claims update.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isMatch = notif.type === "match";
            const isClaim = notif.type === "claim";

            return (
              <div
                key={notif.id}
                id={`notification-item-${notif.id}`}
                className={`py-3 flex items-start gap-3 transition ${
                  !notif.read
                    ? "bg-indigo-50/40 dark:bg-indigo-950/20 px-2 rounded-xl"
                    : "px-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl"
                }`}
              >
                <div
                  className={`mt-0.5 p-2 rounded-xl shrink-0 ${
                    isMatch
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : isClaim
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                      : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {isMatch ? (
                    <Sparkles className="w-4 h-4" />
                  ) : isClaim ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <Bell className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className={`text-xs font-semibold truncate ${notif.read ? "text-slate-600 dark:text-slate-400" : "text-slate-900 dark:text-slate-100"}`}>
                      {notif.title}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1">
                    {notif.link ? (
                      <Link
                        to={notif.link}
                        onClick={() => {
                          if (onMarkAsRead) onMarkAsRead(notif.id);
                          if (onClose) onClose();
                        }}
                        className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span />
                    )}

                    <div className="flex items-center gap-1.5">
                      {notif.read ? (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-500" />
                          <span>Read</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          New
                        </span>
                      )}

                      {!notif.read && onMarkAsRead && (
                        <button
                          onClick={() => onMarkAsRead(notif.id)}
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded transition"
                          title="Mark as read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(notif.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete notification"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isDropdown && (
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            id="view-all-notifications-link"
            to="/notifications"
            onClick={onClose}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Open Notification Center</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
