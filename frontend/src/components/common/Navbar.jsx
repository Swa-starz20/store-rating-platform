import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  Users,
  LayoutDashboard,
  LogOut,
  KeyRound,
  Menu,
  X,
  Shield,
  UserCheck,
  ShoppingBag
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const roleBadgeConfig = {
    ADMIN: {
      label: 'System Admin',
      icon: Shield,
      color: 'bg-rose-50 text-rose-700 border-rose-200'
    },
    STORE_OWNER: {
      label: 'Store Owner',
      icon: ShoppingBag,
      color: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    USER: {
      label: 'Normal User',
      icon: UserCheck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  };

  const currentRoleBadge = role ? roleBadgeConfig[role] : null;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link
              to={
                role === 'ADMIN'
                  ? '/admin'
                  : role === 'STORE_OWNER'
                  ? '/owner'
                  : '/dashboard'
              }
              className="flex items-center space-x-2.5 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-slate-900 via-brand-900 to-slate-800 bg-clip-text text-transparent">
                  StoreRate
                </span>
                <span className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold -mt-1">
                  Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-1 ml-8">
                {role === 'ADMIN' && (
                  <>
                    <Link
                      to="/admin"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                        isActive('/admin')
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Overview</span>
                    </Link>
                    <Link
                      to="/admin/users"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                        isActive('/admin/users')
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Users className="w-4 h-4" />
                      <span>User Management</span>
                    </Link>
                    <Link
                      to="/admin/stores"
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                        isActive('/admin/stores')
                          ? 'bg-brand-50 text-brand-700 font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Store Management</span>
                    </Link>
                  </>
                )}

                {role === 'USER' && (
                  <Link
                    to="/dashboard"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                      isActive('/dashboard')
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Store Directory</span>
                  </Link>
                )}

                {role === 'STORE_OWNER' && (
                  <Link
                    to="/owner"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                      isActive('/owner')
                        ? 'bg-brand-50 text-brand-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>My Store Dashboard</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* User Profile & Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-slate-800 max-w-[180px] truncate" title={user?.name}>
                      {user?.name}
                    </p>
                    <div className="flex items-center justify-end space-x-1 mt-0.5">
                      {currentRoleBadge && (
                        <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold border ${currentRoleBadge.color}`}>
                          {currentRoleBadge.label}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  to="/settings"
                  className="p-2 text-slate-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition"
                  title="Account Settings & Password"
                >
                  <KeyRound className="w-4 h-4" />
                </Link>

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-brand-600 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg shadow-sm transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-slate-100">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
                {currentRoleBadge && (
                  <span className={`inline-flex items-center px-2 py-0.5 mt-1.5 rounded text-[10px] font-semibold border ${currentRoleBadge.color}`}>
                    {currentRoleBadge.label}
                  </span>
                )}
              </div>

              {role === 'ADMIN' && (
                <>
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-brand-50"
                  >
                    Overview
                  </Link>
                  <Link
                    to="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-brand-50"
                  >
                    User Management
                  </Link>
                  <Link
                    to="/admin/stores"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-brand-50"
                  >
                    Store Management
                  </Link>
                </>
              )}

              {role === 'USER' && (
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-brand-50"
                >
                  Store Directory
                </Link>
              )}

              {role === 'STORE_OWNER' && (
                <Link
                  to="/owner"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-brand-50"
                >
                  My Store Dashboard
                </Link>
              )}

              <Link
                to="/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                Account Settings
              </Link>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm text-rose-600 hover:bg-rose-50"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-y-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-slate-50"
              >
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm text-white bg-brand-600 text-center font-medium"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
