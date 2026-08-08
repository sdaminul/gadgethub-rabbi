import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export function AdminLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: signInError } = await signIn(email, password);
    if (signInError) {
      setError(signInError);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-950 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-ink-950 via-ink-950 to-brand-950/30" />

      <div className="relative w-full max-w-md px-4">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white font-bold text-xl shadow-glow">
              L
            </div>
            <span className="font-display text-2xl font-700 text-white">Lumiere</span>
          </Link>
        </div>

        <div className="glass-dark rounded-3xl border border-white/10 p-8 shadow-float">
          <div className="flex items-center justify-center h-14 w-14 mx-auto rounded-2xl bg-brand-600/20 text-brand-400 mb-4">
            <Lock size={24} />
          </div>
          <h1 className="text-center font-display text-2xl font-700 text-white">Admin Panel</h1>
          <p className="text-center text-sm text-ink-400 mt-1">Sign in to manage your catalog</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-600 text-ink-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-white placeholder-ink-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-600 text-ink-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-11 text-white placeholder-ink-500 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-300"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-error/15 px-4 py-3 text-sm text-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 py-3 text-sm font-700 text-white hover:bg-brand-500 disabled:opacity-60 transition-colors"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-xs text-ink-500">
              Don't have an admin account?
            </p>
            <p className="text-xs text-ink-400 mt-1">
              Use the sign-up link below to create one
            </p>
            <SignUpLink />
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-ink-400 hover:text-white transition-colors">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}

function SignUpLink() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (password.length < 6) {
      setErr('Password must be at least 6 characters');
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setErr(error.message);
    } else {
      setDone(true);
    }
  };

  if (done) {
    return (
      <p className="mt-3 rounded-lg bg-success/15 px-3 py-2 text-xs font-600 text-success">
        Account created! You can now sign in.
      </p>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 text-xs font-600 text-brand-400 hover:text-brand-300"
      >
        Create admin account →
      </button>
    );
  }

  return (
    <form onSubmit={handleSignup} className="mt-3 space-y-2 text-left">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="admin@email.com"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password (min 6 chars)"
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-ink-500 outline-none focus:border-brand-500"
      />
      {err && <p className="text-xs text-error">{err}</p>}
      <button type="submit" className="w-full rounded-lg bg-white/10 py-2 text-xs font-600 text-white hover:bg-white/20">
        Create Account
      </button>
    </form>
  );
}
