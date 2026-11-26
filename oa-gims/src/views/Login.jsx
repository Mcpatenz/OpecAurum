import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gem, ShieldCheck, LogIn, ArrowRight } from 'lucide-react';
import GemScene from '../components/ui/GemScene';
import { Button, FloatInput } from '../components/ui/primitives';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../lib/auth/AuthContext';
import Seo from '../lib/seo';

export default function Login({ mode = 'sign-in' }) {
  const { login, register, isPending } = useAuth();
  const nav = useNavigate();
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const user = useAuth().user;

  if (isPending) return <div className="grid min-h-screen place-items-center bg-ink text-sm text-white/60">Checking your secure session…</div>;
  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    const result = mode === 'sign-up'
      ? await register(fullName, email, password)
      : await login(email, password);
    if (!result.ok) {
      setErr(result.error);
      toast.error(mode === 'sign-up' ? 'Account creation failed' : 'Sign in failed', result.error);
      return;
    }
    toast.success(mode === 'sign-up' ? 'Account created' : `Welcome, ${result.user?.name || 'back'}`, 'Your account is secured with a server-managed session.');
    nav('/dashboard', { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-ink">
      <Seo />
      <GemScene density={0.7} />
      <div className="pointer-events-none absolute inset-0 bg-hero-fade" aria-hidden="true" />

      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
          <Link to="/" className="mb-8 inline-flex items-center gap-2 text-gold-200 hover:text-white transition">
            <Gem size={22} className="animate-pulseGlow" /> <span className="font-display font-bold tracking-wide">OA-GIMS</span>
          </Link>
          <h1 className="font-display text-4xl md:text-5xl font-bold leading-tight">
            Welcome back to <span className="gold-text">Aurum Gems</span>
          </h1>
          <p className="mt-4 max-w-md text-white/60">
            Empowering Members • Managing Loans • Building Communities. Sign in to your member or administration portal.
          </p>
          <div className="mt-8 hidden rounded-2xl glass p-5 lg:block">
            <p className="text-xs font-bold uppercase tracking-widest text-gold-300">Member access</p>
            <p className="mt-2 text-sm text-white/60">New accounts receive the standard member role. Privileged roles are assigned by an authorized administrator.</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.8, delay: 0.15 }}>
          <form onSubmit={submit} className="glass-strong mx-auto w-full max-w-md rounded-3xl p-8 shadow-card">
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-gold-300 to-aurum-deep text-ink"><LogIn size={22} /></span>
              <div>
                <h2 className="font-display text-2xl font-bold">{mode === 'sign-up' ? 'Create member account' : 'Secure sign in'}</h2>
                <p className="text-xs text-white/50">Session-based authentication • server-verified roles</p>
              </div>
            </div>

            <div className="space-y-4">
              {mode === 'sign-up' && <FloatInput label="Full name" name="name" autoComplete="name" required value={fullName} onChange={(event) => setFullName(event.target.value)} />}
              <FloatInput label="Work email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
              <FloatInput label="Password" type="password" required minLength={8} autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            {err && <p role="alert" className="mt-3 rounded-xl bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</p>}

            <Button size="lg" className="mt-6 w-full" disabled={isPending}>
              {mode === 'sign-up' ? 'Create account' : 'Sign in'} <ArrowRight size={18} />
            </Button>

            <div className="mt-5 flex items-center justify-between text-xs text-white/50">
              <Link to={mode === 'sign-up' ? '/login' : '/sign-up'} className="text-gold-200 hover:underline">{mode === 'sign-up' ? 'Already registered? Sign in' : 'Create member account'}</Link>
              <Link to="/" className="text-gold-200 hover:underline">Back to home</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
