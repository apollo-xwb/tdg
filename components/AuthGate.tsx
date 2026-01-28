
import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { signInWithGoogle, signUpEmail, signInEmail } from '../lib/supabase';

const MIN_LENGTH = 10;
const PASSWORD_RULES = {
  length: (s: string) => s.length >= MIN_LENGTH,
  upper: (s: string) => /[A-Z]/.test(s),
  lower: (s: string) => /[a-z]/.test(s),
  number: (s: string) => /\d/.test(s),
  symbol: (s: string) => /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(s),
};

function checkPassword(p: string): { ok: boolean; hints: string[] } {
  const hints: string[] = [];
  if (!PASSWORD_RULES.length(p)) hints.push(`At least ${MIN_LENGTH} characters`);
  if (!PASSWORD_RULES.upper(p)) hints.push('One uppercase letter');
  if (!PASSWORD_RULES.lower(p)) hints.push('One lowercase letter');
  if (!PASSWORD_RULES.number(p)) hints.push('One number');
  if (!PASSWORD_RULES.symbol(p)) hints.push('One symbol (!@#$%^&* etc.)');
  return { ok: hints.length === 0, hints };
}

interface AuthGateProps {
  onSuccess: (user: User) => void;
  theme?: 'dark' | 'light';
}

type Mode = 'choose' | 'signin' | 'create';

const AuthGate: React.FC<AuthGateProps> = ({ onSuccess, theme = 'dark' }) => {
  const [mode, setMode] = useState<Mode>('choose');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDark = theme === 'dark';
  const pwCheck = checkPassword(password);
  const canCreate = pwCheck.ok && password === confirm && !!email.trim();

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    const { error: e } = await signInWithGoogle();
    setLoading(false);
    if (e) setError(e.message || 'Sign-in failed');
    // onSuccess is called by auth state change when they return from Google
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Enter your email'); return; }
    if (!password) { setError('Enter your password'); return; }
    setLoading(true);
    const { data, error: err } = await signInEmail(email.trim(), password);
    setLoading(false);
    if (err) setError(err.message || 'Sign-in failed');
    else if (data?.user) onSuccess(data.user);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) { setError('Enter your email'); return; }
    if (!pwCheck.ok) { setError('Password does not meet requirements'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    const { data, error: err } = await signUpEmail(email.trim(), password);
    setLoading(false);
    if (err) setError(err.message || 'Sign-up failed');
    else if (data?.user) onSuccess(data.user);
  };

  return (
    <div className={`space-y-8 py-4 ${isDark ? 'text-white' : 'text-black'}`}>
      <div className="text-center mb-8">
        <p className="text-[11px] uppercase tracking-widest opacity-78 mb-2">One more step</p>
        <h3 className="text-lg font-semibold tracking-tight">
          {mode === 'choose' && 'Sign in or create an account to continue'}
          {mode === 'signin' && 'Sign in to your account'}
          {mode === 'create' && 'Create a secure account'}
        </h3>
        <p className="text-sm opacity-78 mt-1 max-w-sm mx-auto">
          We’ll use this to send your quote and keep your designs in your Vault.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
          {error}
        </div>
      )}

      {mode === 'choose' && (
        <>
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className={`w-full py-4 flex items-center justify-center gap-3 border text-[10px] uppercase tracking-widest font-bold transition-all ${
              isDark ? 'border-white/20 hover:bg-white/5' : 'border-black/20 hover:bg-black/5'
            } disabled:opacity-50`}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Continue with Google
          </button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className={`w-full border-t ${isDark ? 'border-white/10' : 'border-black/10'}`} /></div>
            <p className="relative text-center text-[10px] uppercase tracking-widest opacity-68 px-4">or</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`py-4 border text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-black/20 hover:bg-black/5'}`}
            >
              <LogIn size={16} /> Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('create')}
              className={`py-4 border text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 ${isDark ? 'border-white/20 hover:bg-white/5' : 'border-black/20 hover:bg-black/5'}`}
            >
              <UserPlus size={16} /> Create account
            </button>
          </div>
        </>
      )}

      {(mode === 'signin' || mode === 'create') && (
        <form onSubmit={mode === 'signin' ? handleSignIn : handleCreate} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-78 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 opacity-60 ${isDark ? 'text-white' : 'text-black'}`} />
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-3 border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-current/30 ${
                  isDark ? 'border-white/20' : 'border-black/20'
                }`}
                autoComplete={mode === 'signin' ? 'email' : 'email'}
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-78 mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 opacity-60 ${isDark ? 'text-white' : 'text-black'}`} />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder={mode === 'create' ? 'Min 10 chars, upper, lower, number, symbol' : 'Your password'}
                className={`w-full pl-10 pr-4 py-3 border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-current/30 ${
                  isDark ? 'border-white/20' : 'border-black/20'
                }`}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              />
            </div>
            {mode === 'create' && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-2 flex-wrap">
                  {(['length', 'upper', 'lower', 'number', 'symbol'] as const).map(key => {
                    const fn = PASSWORD_RULES[key];
                    const ok = fn(password);
                    return (
                      <span
                        key={key}
                        className={`text-[9px] uppercase px-2 py-0.5 border ${ok ? 'border-emerald-500/50 text-emerald-400' : 'border-current/20 opacity-60'}`}
                      >
                        {key === 'length' && `${MIN_LENGTH}+ chars`}
                        {key === 'upper' && 'A–Z'}
                        {key === 'lower' && 'a–z'}
                        {key === 'number' && '0–9'}
                        {key === 'symbol' && '!@#…'}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          {mode === 'create' && (
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
              />
              {confirm && password !== confirm && (
                <p className="text-[9px] text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => { setMode('choose'); setError(''); setPassword(''); setConfirm(''); }}
              className={`flex-1 py-3 border text-[10px] uppercase tracking-widest ${isDark ? 'border-white/20' : 'border-black/20'}`}
            >
              Back
            </button>
            <button
              type="submit"
              disabled={loading || (mode === 'create' && !canCreate) || (mode === 'signin' && (!email.trim() || !password))}
              className={`flex-1 py-3 font-bold text-[10px] uppercase tracking-widest ${
                isDark ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? '…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </div>
          {mode === 'signin' && (
            <button type="button" onClick={() => setMode('create')} className="w-full text-[10px] uppercase tracking-widest opacity-78 hover:opacity-100">
              Don’t have an account? Create one
            </button>
          )}
          {mode === 'create' && (
            <button type="button" onClick={() => setMode('signin')} className="w-full text-[10px] uppercase tracking-widest opacity-78 hover:opacity-100">
              Already have an account? Sign in
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default AuthGate;
