
import React, { useState } from 'react';
import { Lock, Mail, LogIn } from 'lucide-react';
import { signInEmail } from '../lib/supabase';

interface JewelerLoginProps {
  jewelerEmail: string;
  onSuccess: () => void;
}

const JewelerLogin: React.FC<JewelerLoginProps> = ({ jewelerEmail, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password) { setError('Enter the jeweler password'); return; }
    setLoading(true);
    const { data, error: err } = await signInEmail(jewelerEmail, password);
    setLoading(false);
    if (err) setError(err.message || 'Sign-in failed');
    else if (data?.user) onSuccess();
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-white/10 rounded-sm p-10 glass">
        <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-500 font-bold mb-2">Jeweller Access</p>
        <h1 className="text-2xl font-thin tracking-tight uppercase mb-2">Operations Hub</h1>
        <p className="text-sm opacity-78 mb-8">Sign in with your jeweler account to continue.</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded border border-red-500/40 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-78 mb-2">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="email"
                value={jewelerEmail}
                readOnly
                className="w-full pl-10 pr-4 py-3 border border-white/20 bg-white/5 text-sm opacity-90"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest opacity-78 mb-2">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
              <input
                type="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                placeholder="Jeweler password"
                className="w-full pl-10 pr-4 py-3 border border-white/20 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
                autoComplete="current-password"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-4 bg-white text-black text-[10px] uppercase tracking-widest font-bold hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <LogIn size={16} /> Sign in
          </button>
        </form>
        <p className="text-[9px] opacity-55 mt-6 text-center">Credentials are predefined. After first sign-in, go to Settings → Account & password to set or change your password.</p>
      </div>
    </div>
  );
};

export default JewelerLogin;
