import React, { forwardRef, useId } from 'react';

/** Floating-label text input (spec requirement). */
export const FloatInput = forwardRef(function FloatInput({ label, textarea, className = '', id: givenId, ...rest }, ref) {
  const auto = useId();
  const id = givenId || auto;
  const Input = textarea ? 'textarea' : 'input';
  return (
    <div className={`float-field ${className}`}>
      <Input id={id} ref={ref} rows={textarea ? 4 : undefined} placeholder=" " {...rest} />
      <label htmlFor={id}>{label}</label>
    </div>
  );
});

/** Floating-label select — always shows the floated label since a selection is visible. */
export function FloatSelect({ label, className = '', children, id: givenId, ...rest }) {
  const auto = useId();
  const id = givenId || auto;
  return (
    <div className={`float-field float-field--filled ${className}`}>
      <select id={id} {...rest}>{children}</select>
      <label htmlFor={id}>{label}</label>
    </div>
  );
}

export function Button({ variant = 'gold', size = 'md', className = '', children, ...rest }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300/70 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm', lg: 'px-7 py-3.5 text-base' };
  const variants = {
    gold: 'bg-gradient-to-r from-gold-300 via-aurum to-gold-600 text-ink shadow-glow hover:brightness-110 hover:-translate-y-0.5',
    ghost: 'border border-gold-300/25 text-gold-100 hover:bg-gold-300/10 hover:border-gold-300/50',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 shadow-[0_0_25px_-8px_rgba(239,68,68,0.7)]',
    dark: 'bg-panel text-white/85 border border-white/10 hover:border-gold-300/40',
  };
  return <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>{children}</button>;
}

export function Card({ className = '', hover = true, children, ...rest }) {
  return <div className={`glass rounded-2xl p-5 ${hover ? 'card-hover' : ''} ${className}`} {...rest}>{children}</div>;
}

export function Badge({ tone = 'gold', children, className = '' }) {
  const tones = {
    gold: 'bg-gold-400/15 text-gold-200 border-gold-400/30',
    green: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30',
    red: 'bg-red-400/15 text-red-300 border-red-400/30',
    blue: 'bg-sky-400/15 text-sky-300 border-sky-400/30',
    amber: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
    violet: 'bg-violet-400/15 text-violet-300 border-violet-400/30',
    slate: 'bg-white/8 text-white/60 border-white/15',
  };
  return <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${tones[tone]} ${className}`}>{children}</span>;
}

const STATUS_TONE = {
  DRAFT: 'slate', SUBMITTED: 'blue', FOR_REVIEW: 'blue', FOR_APPROVAL: 'amber', APPROVED: 'green',
  REJECTED: 'red', FOR_RELEASE: 'violet', RELEASED: 'violet', ACTIVE: 'green', PARTIALLY_PAID: 'amber',
  FULLY_PAID: 'slate', CANCELLED: 'slate', DEFAULTED: 'red', CLOSED: 'slate',
  ONGOING: 'green', COMPLETED: 'blue', PENDING: 'amber', POSTED: 'green', PARTIAL: 'amber', MISSED: 'red', SCHEDULED: 'slate', WAIVED: 'slate',
};
export const StatusBadge = ({ status }) => <Badge tone={STATUS_TONE[status] ?? 'gold'}>{String(status).replace(/_/g, ' ')}</Badge>;

export function StatCard({ icon: Icon, label, value, sub, delay = 0 }) {
  return (
    <div className="glass card-hover relative overflow-hidden rounded-2xl p-5" style={{ animationDelay: `${delay}ms` }}>
      <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gold-400/10 blur-2xl" aria-hidden="true" />
      <div className="flex items-center gap-4">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-gold-300/25 to-aurum-deep/25 text-gold-200">
          {Icon ? <Icon size={22} /> : null}
        </span>
        <div>
          <p className="text-xs uppercase tracking-widest text-white/50">{label}</p>
          <p className="font-display text-2xl font-bold text-white">{value}</p>
          {sub && <p className="text-xs text-gold-200/70">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, sub }) {
  return (
    <div className="mb-6">
      {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.25em] text-gold-300/80">{eyebrow}</p>}
      <h2 className="font-display text-2xl md:text-3xl font-bold text-white mt-1">{title}</h2>
      {sub && <p className="mt-1.5 max-w-2xl text-sm text-white/60">{sub}</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div role="dialog" aria-modal="true" aria-label={title}
        className={`glass-strong relative w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[88vh] overflow-auto rounded-3xl p-6 shadow-card animate-[floaty_0.0001s]`}
        style={{ animation: 'none' }}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold text-gold-100">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-white/50 hover:bg-white/10 hover:text-white" aria-label="Close dialog">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
