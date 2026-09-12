import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  UserCheck,
  UserX,
  Shield,
  Key,
  GraduationCap,
  Building,
  Mail,
  Phone,
  Edit2
} from "lucide-react";
import AdminLayout from "./AdminLayout.jsx";
import { getUsers, updateUser, getItems } from "../../utils/storage.js";
import { useToast } from "../../context/ToastContext.jsx";
import { formatDate } from "../../utils/helpers.js";

export default function AdminUsers() {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const loadData = () => {
    setUsers(getUsers());
    setItems(getItems());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = (userId, newRole) => {
    updateUser(userId, { role: newRole });
    loadData();
    addToast(`User role updated to ${newRole}.`, "success");
  };

  const handleToggleActive = (user) => {
    const disabled = !user.disabled;
    updateUser(user.id, { disabled });
    loadData();
    addToast(
      `User ${user.name} has been ${disabled ? "deactivated" : "re-activated"}.`,
      disabled ? "warning" : "success"
    );
  };

  const handleResetPassword = (user) => {
    const tempPass = "Campus@" + Math.floor(1000 + Math.random() * 9000);
    updateUser(user.id, { password: tempPass });
    loadData();
    alert(`Temporary password generated for ${user.name}: ${tempPass}`);
    addToast(`Password reset. Temporary password generated.`, "info");
  };

  const filtered = users.filter((u) => {
    const nameMatch =
      (u.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.studentId || "").toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === "all" || u.role === roleFilter;
    return nameMatch && roleMatch;
  });

  return (
    <AdminLayout activeTab="users">
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Campus User Accounts ({users.length})
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Authorized students, university faculty, campus security officers, and administrators.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center gap-3 text-xs">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by name, email, student ID..."
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden"
            >
              <option value="all">All Roles</option>
              <option value="Student">Students</option>
              <option value="Faculty">Faculty</option>
              <option value="Security Staff">Security Staff</option>
              <option value="Administrator">Administrators</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Campus ID & Dept</th>
                  <th className="py-3 px-4">Reports Filed</th>
                  <th className="py-3 px-4">Member Since</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((user) => {
                  const userReports = items.filter((i) => i.userId === user.id).length;
                  return (
                    <tr key={user.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80"}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={user.role || "Student"}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          className="text-xs font-semibold px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden"
                        >
                          <option value="Student">Student</option>
                          <option value="Faculty">Faculty</option>
                          <option value="Security Staff">Security Staff</option>
                          <option value="Administrator">Administrator</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        <div className="font-mono text-[11px]">{user.studentId || "N/A"}</div>
                        <div className="text-[11px] text-slate-400">{user.department || "General"}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300">
                        {userReports}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            user.disabled
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                              : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          }`}
                        >
                          {user.disabled ? "DEACTIVATED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                            title="Generate Temporary Password"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleActive(user)}
                            className={`p-1.5 rounded-lg transition ${
                              user.disabled
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-rose-600 hover:bg-rose-50"
                            }`}
                            title={user.disabled ? "Activate Account" : "Deactivate Account"}
                          >
                            {user.disabled ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
