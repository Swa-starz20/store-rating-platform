import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatCard from '../../components/common/StatCard';
import { useToast } from '../../context/ToastContext';
import {
  Users,
  Store,
  Star,
  Shield,
  ShoppingBag,
  UserCheck,
  ArrowRight,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { toastError } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Administrator Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time analytics and platform overview.
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-brand-600' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Main 3 Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Registered Users"
          value={loading ? '...' : stats?.totalUsers || 0}
          icon={Users}
          color="brand"
          subtext="Admins, Store Owners & Normal Users"
        />

        <StatCard
          title="Total Active Stores"
          value={loading ? '...' : stats?.totalStores || 0}
          icon={Store}
          color="emerald"
          subtext="Verified business stores"
        />

        <StatCard
          title="Total Ratings Submitted"
          value={loading ? '...' : stats?.totalRatings || 0}
          icon={Star}
          color="amber"
          subtext="Customer reviews across stores"
        />
      </div>

      {/* Role Breakdown & Management Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Role Distribution Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center space-x-2">
            <Users className="w-4 h-4 text-brand-600" />
            <span>User Demographics</span>
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Administrators</p>
                  <p className="text-[11px] text-slate-400">System management</p>
                </div>
              </div>
              <span className="text-base font-bold text-slate-800">
                {stats?.roleBreakdown?.ADMIN || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Store Owners</p>
                  <p className="text-[11px] text-slate-400">Managing listings</p>
                </div>
              </div>
              <span className="text-base font-bold text-slate-800">
                {stats?.roleBreakdown?.STORE_OWNER || 0}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-800">Normal Users</p>
                  <p className="text-[11px] text-slate-400">Rating consumers</p>
                </div>
              </div>
              <span className="text-base font-bold text-slate-800">
                {stats?.roleBreakdown?.USER || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* User Management Shortcut */}
          <div className="bg-gradient-to-br from-indigo-50/60 via-white to-slate-50 rounded-2xl border border-indigo-100 p-6 flex flex-col justify-between shadow-xs hover:border-indigo-200 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                User Management
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add new administrators, store owners, or normal users. View details, search and filter through users, and inspect store ratings.
              </p>
            </div>
            <Link
              to="/admin/users"
              className="mt-6 inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 group"
            >
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>

          {/* Store Management Shortcut */}
          <div className="bg-gradient-to-br from-emerald-50/60 via-white to-slate-50 rounded-2xl border border-emerald-100 p-6 flex flex-col justify-between shadow-xs hover:border-emerald-200 transition">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 mb-4">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Store Management
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Register new stores, auto-generate or assign store owners in a single transaction, and monitor live store ratings.
              </p>
            </div>
            <Link
              to="/admin/stores"
              className="mt-6 inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 group"
            >
              <span>Manage Stores</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
