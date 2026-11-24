import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { validatePassword } from '../../utils/validators';
import Input from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import { KeyRound, Shield, User, Mail, MapPin, CheckCircle2 } from 'lucide-react';

const AccountSettings = () => {
  const { user, changePassword } = useAuth();
  const { toastSuccess, toastError } = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    const passErr = validatePassword(newPassword);
    if (passErr) {
      newErrors.newPassword = passErr;
    }

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'New passwords do not match.';
    } else if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm your new password.';
    }

    if (currentPassword && newPassword && currentPassword === newPassword) {
      newErrors.newPassword = 'New password cannot be identical to current password.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    const result = await changePassword(currentPassword, newPassword);
    setSubmitting(false);

    if (result.success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account profile and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg border border-brand-100">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 truncate max-w-[180px]" title={user?.name}>
                {user?.name}
              </p>
              <span className="text-[11px] font-semibold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-100">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Email</span>
              <span className="font-semibold text-slate-700 flex items-center space-x-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{user?.email}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Address</span>
              <span className="font-medium text-slate-700 flex items-start space-x-1.5 leading-relaxed">
                <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>{user?.address}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Update Password</h2>
              <p className="text-xs text-slate-500">
                Ensure your account is using a strong password.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="current-password"
              label="Current Password"
              type="password"
              required
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) setErrors({ ...errors, currentPassword: null });
              }}
              error={errors.currentPassword}
            />

            <Input
              id="new-password"
              label="New Password"
              type="password"
              required
              placeholder="8 to 16 characters with uppercase and special character"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (errors.newPassword) setErrors({ ...errors, newPassword: null });
              }}
              error={errors.newPassword}
              maxLength={16}
              hint="Must be 8–16 characters, containing at least 1 uppercase (A-Z) and 1 special symbol."
            />

            <Input
              id="confirm-password"
              label="Confirm New Password"
              type="password"
              required
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
              }}
              error={errors.confirmPassword}
            />

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center space-x-2 px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-brand-600 hover:bg-brand-700 active:scale-95 transition shadow-md shadow-brand-500/20 disabled:opacity-50"
              >
                {submitting ? 'Updating Password...' : 'Save New Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
