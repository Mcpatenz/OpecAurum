import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Gem, LayoutDashboard, Landmark, FileText, CheckSquare, Banknote, Users, Boxes,
  HeartHandshake, BarChart3, ScrollText, LogOut, Menu, X, Bell, Wallet, Package,
} from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { ROLE_LABELS, can } from '../lib/auth/rbac';
import { Badge } from './ui/primitives';

const NAV = [
  { section: 'Overview', items: [{ to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }] },
  {
    section: 'Loans', perm: null, items: [
      { to: '/loans/apply', label: 'Apply for Loan', icon: FileText, memberOnly: true },
      { to: '/loans/applications', label: 'Applications', icon: Landmark },
      { to: '/approvals', label: 'Credit Committee', icon: CheckSquare, perm: 'loans:approve' },
      { to: '/releases', label: 'Releases', icon: Banknote, perm: 'loans:release' },
      { to: '/payroll', label: 'Payroll Deductions', icon: Wallet, perm: 'payroll:manage' },
      { to: '/products', label: 'Loan Products', icon: Package, perm: 'products:manage' },
      { to: '/loans/active', label: 'Active Loans', icon: Landmark },
    ],
  },
  { section: 'Organization', items: [{ to: '/members', label: 'Members & Structure', icon: Users }] },
  { section: 'Community', items: [{ to: '/projects', label: 'CSR Projects', icon: HeartHandshake }] },
  {
    section: 'Administration', items: [
      { to: '/reports', label: 'Reports', icon: BarChart3 },
      { to: '/audit', label: 'Audit Logs', icon: ScrollText, perm: 'audit:read' },
    ],
  },
];

export default function Shell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  const visible = (item) => {
    if (item.memberOnly && user.role !== 'MEMBER') return false;
    if (item.perm && !can(user.role, item.perm)) return false;
    if (!user.isAdmin && item.to.startsWith('/audit')) return false;
    if (!user.isAdmin && ['/approvals', '/releases', '/payroll', '/products'].includes(item.to)) return false;
    return true;
  };

  const Sidebar = (
    <aside className="flex h-full w-72 flex-col glass-strong">
      <div className="flex items-center gap-2.5 border-b border-line px-5 py-5">
        <Gem className="text-aurum animate-pulseGlow" size={24} />
        <div>
          <p className="font-display text-lg font-bold leading-none">OA-GIMS</p>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-gold-200/60">Aurum Gems Platform</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Primary">
        {NAV.map((group) => {
          const items = group.items.filter(visible);
          if (!items.length) return null;
          return (
            <div key={group.section} className="mb-5">
              <p className="px-3 pb-1.5 text-[10px] font-black uppercase tracking-[0.22em] text-white/35">{group.section}</p>
              {items.map((it) => (
                <NavLink key={it.to} to={it.to} onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `group relative mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-gold-400/20 to-transparent text-gold-100 font-semibold' : 'text-white/60 hover:bg-white/5 hover:text-white'}`}>
                  {({ isActive }) => (
                    <>
                      {isActive && <motion.span layoutId="nav-pill" className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-aurum shadow-glow" />}
                      <it.icon size={17} className={isActive ? 'text-gold-300' : 'text-white/40 group-hover:text-gold-200'} />
                      {it.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="border-t border-line p-4">
        <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold-300 to-aurum-deep font-bold text-ink">
            {user.name.split(' ').map((s) => s[0]).slice(0, 2).join('')}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <Badge tone="gold">{ROLE_LABELS[user.role]}</Badge>
          </div>
        </div>
        <button onClick={() => { logout(); nav('/login'); }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/30 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/15">
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-ink">
      {/* Desktop sidebar */}
      <div className="sticky top-0 hidden h-screen shrink-0 lg:block">{Sidebar}</div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setOpen(false)} />
            <motion.div initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 lg:hidden">{Sidebar}</motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-ink/80 px-4 py-3 backdrop-blur-xl md:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-white/70 hover:bg-white/10 lg:hidden" aria-label="Open menu"><Menu size={20} /></button>
            <h1 className="font-display text-base font-bold md:text-lg">OPEC Aurum Gems <span className="hidden text-gold-200 sm:inline">Integrated Management System</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-gold-200" aria-label="Notifications">
              <Bell size={18} />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 animate-pulseGlow rounded-full bg-aurum" />
            </button>
            <span className="hidden rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300 md:inline">● Session active</span>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>

        <footer className="border-t border-line px-8 py-4 text-center text-[11px] text-white/35">
          OA-GIMS • Empowering Members • Managing Loans • Building Communities — loan rules modeled from the May 2025 form; validate against approved OPEC policy before production.
        </footer>
      </div>
    </div>
  );
}
