
import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { updatePassword } from '../lib/supabase';

const MIN_LENGTH = 10;
const PASSWORD_RULES = {
  length: (s: string) => s.length >= MIN_LENGTH,
  upper: (s: string) => /[A-Z]/.test(s),
  lower: (s: string) => /[a-z]/.test(s),
  number: (s: string) => /\d/.test(s),
  symbol: (s: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(s),
};

function checkPassword(p: string): boolean {
  return PASSWORD_RULES.length(p) && PASSWORD_RULES.upper(p) && PASSWORD_RULES.lower(p) && PASSWORD_RULES.number(p) && PASSWORD_RULES.symbol(p);
}

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'dark' | 'light';
}

const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({ isOpen, onClose, theme = 'dark' }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const isDark = theme === 'dark';
  const pwOk = checkPassword(newPassword);
  const canSubmit = pwOk && newPassword === confirm && !!newPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!canSubmit) return;
    setLoading(true);
    const { error: err } = await updatePassword(newPassword);
    setLoading(false);
    if (err) setError(err.message || 'Failed to update password');
    else {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1500);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-recovery-title"
    >
      <div
        className={`max-w-md w-full rounded-sm border shadow-xl animate-fadeIn ${
          isDark ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-black/10 text-black'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-current/10 px-6 py-4">
          <h2 id="password-recovery-title" className="text-[11px] uppercase tracking-[0.4em] font-bold flex items-center gap-2">
            <Lock size={14} /> Set new password
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-sm opacity-60 hover:opacity-100" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <p className="text-[10px] uppercase tracking-widest opacity-78">
            You clicked a password reset link. Enter your new password below.
          </p>
          {error && (
            <div className="p-3 rounded border border-red-500/40 bg-red-500/10 text-red-400 text-sm">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-sm">
              Password updated. You can close this.
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-78 mb-2">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setError(''); }}
              placeholder="Min 10 chars, upper, lower, number, symbol"
              className={`w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-current/30 ${
                isDark ? 'border-white/20' : 'border-black/20'
              }`}
              autoComplete="new-password"
              disabled={success}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-78 mb-2">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError(''); }}
              placeholder="Repeat password"
              className={`w-full px-4 py-3 border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-current/30 ${
                isDark ? 'border-white/20' : 'border-black/20'
              }`}
              autoComplete="new-password"
              disabled={success}
            />
            {confirm && newPassword !== confirm && <p className="text-[9px] text-red-400 mt-1">Passwords do not match</p>}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className={`flex-1 py-3 border text-[10px] uppercase tracking-widest ${isDark ? 'border-white/20' : 'border-black/20'}`}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit || success}
              className={`flex-1 py-3 font-bold text-[10px] uppercase tracking-widest ${
                isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? '…' : success ? 'Done' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PasswordRecoveryModal;
