import React from 'react';
import { motion } from 'framer-motion';

/** Animated SVG bar chart — loan releases by month (spec §6). */
export function BarChart({ data, height = 180, format = (v) => v }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 md:gap-3" style={{ height }} role="img" aria-label="Loan releases by month">
      {data.map((d, i) => (
        <div key={d.label} className="group flex flex-1 flex-col items-center justify-end gap-2 h-full">
          <span className="text-[10px] font-semibold text-gold-200 opacity-0 transition group-hover:opacity-100">{format(d.value)}</span>
          <motion.div
            initial={{ height: 0 }}
            whileInView={{ height: `${(d.value / max) * 100}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 90, damping: 16 }}
            className="w-full rounded-t-lg bg-gradient-to-t from-aurum-deep via-aurum to-gold-200 shadow-[0_0_18px_-4px_rgba(230,182,76,0.6)] group-hover:brightness-125"
          />
          <span className="text-[10px] uppercase tracking-wider text-white/50">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Animated donut for collections vs outstanding. */
export function Donut({ segments, size = 170, label }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const R = 42, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="-rotate-90 w-full h-full">
        <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="11" />
        {segments.map((s, i) => {
          const frac = s.value / total;
          const dash = frac * C;
          const off = -acc * C;
          acc += frac;
          return (
            <motion.circle key={i} cx="50" cy="50" r={R} fill="none" stroke={s.color} strokeWidth="11" strokeLinecap="round"
              strokeDasharray={`${dash} ${C - dash}`} initial={{ strokeDashoffset: C, opacity: 0 }}
              whileInView={{ strokeDashoffset: off, opacity: 1 }} viewport={{ once: true }}
              transition={{ duration: 1, delay: i * 0.15 }} />
          );
        })}
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-lg font-bold text-white">{label ?? `₱${Math.round(total / 1000)}k`}</p>
      </div>
    </div>
  );
}

/** Sparkline progress bar with shimmer. */
export function ProgressBar({ value, tone = 'gold' }) {
  const tones = { gold: 'from-aurum-deep to-gold-200', green: 'from-emerald-600 to-emerald-300', red: 'from-red-700 to-red-400' };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8" role="progressbar" aria-valuenow={Math.round(value)}>
      <motion.div initial={{ width: 0 }} whileInView={{ width: `${Math.min(100, value)}%` }} viewport={{ once: true }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className={`h-full rounded-full bg-gradient-to-r ${tones[tone]} bg-[length:200%_100%] animate-shimmer`} />
    </div>
  );
}
