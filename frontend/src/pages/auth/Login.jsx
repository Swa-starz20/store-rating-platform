import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { validateEmail } from '../../utils/validators';
import Input from '../../components/common/Input';
import { Store, LogIn, Shield, ShoppingBag, UserCheck, Lock, Mail } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    const emailErr = validateEmail(email);
    if (emailErr) newErrors.email = emailErr;

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const result = await login(email, password);
    setSubmitting(false);

    if (result.success && result.user) {
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Redirect by role
        if (result.user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else if (result.user.role === 'STORE_OWNER') {
          navigate('/owner', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }
    }
  };

  // Quick fill helper for demo accounts
  const fillCredentials = (fillEmail, fillPass) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setErrors({});
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-200/50">
        {/* Brand Header */}
        <div className="text-center">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 items-center justify-center text-white shadow-lg shadow-brand-500/25 mb-4">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Welcome back! Enter your credentials to access the platform.
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            id="email"
            label="Email Address"
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: null });
            }}
            error={errors.email}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            required
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 active:scale-[0.99] transition shadow-md shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Credentials */}
        <div className="pt-4 border-t border-slate-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
            Quick Fill Demo Accounts
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@storerating.com', 'Admin@12345')}
              className="flex flex-col items-center p-2 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50/50 transition group"
            >
              <Shield className="w-4 h-4 text-rose-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-700">Admin</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('arthur.kingsman@stores.com', 'Owner@12345')}
              className="flex flex-col items-center p-2 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition group"
            >
              <ShoppingBag className="w-4 h-4 text-amber-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-700">Store Owner</span>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('alexander.bennett@user.com', 'User@12345')}
              className="flex flex-col items-center p-2 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
            >
              <UserCheck className="w-4 h-4 text-emerald-600 mb-1" />
              <span className="text-[11px] font-semibold text-slate-700">Normal User</span>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 underline">
            Register as a Normal User
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
