import React, { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

const KIND = {
  success: { icon: CheckCircle2, ring: 'border-emerald-400/40', tint: 'bg-emerald-400/15', fg: 'text-emerald-300' },
  error:   { icon: XCircle,      ring: 'border-red-400/40',       tint: 'bg-red-400/15',       fg: 'text-red-300' },
  warning: { icon: AlertTriangle,ring: 'border-amber-400/40',     tint: 'bg-amber-400/15',     fg: 'text-amber-300' },
  info:    { icon: Info,         ring: 'border-gold-300/40',      tint: 'bg-gold-400/15',      fg: 'text-gold-200' },
};

let idc = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback((kind, title, message, duration = 4200) => {
    const id = ++idc;
    setToasts((t) => [...t.slice(-4), { id, kind, title, message, duration }]);
    setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const api = {
    success: (t, m, d) => push('success', t, m, d),
    error: (t, m, d) => push('error', t, m, d),
    warning: (t, m, d) => push('warning', t, m, d),
    info: (t, m, d) => push('info', t, m, d),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="fixed top-5 right-5 z-[100] flex w-[min(92vw,380px)] flex-col gap-3" role="region" aria-live="polite" aria-label="Notifications">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const k = KIND[t.kind] || KIND.info;
            const Icon = k.icon;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                className={`glass-strong relative overflow-hidden rounded-2xl border ${k.ring} p-4 pr-10 shadow-card`}
              >
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${k.tint}`}>
                    <Icon size={18} className={k.fg} />
                  </span>
                  <div>
                    <p className={`font-semibold text-sm ${k.fg}`}>{t.title}</p>
                    {t.message && <p className="mt-0.5 text-sm text-white/70 leading-snug">{t.message}</p>}
                  </div>
                </div>
                <button onClick={() => dismiss(t.id)} aria-label="Dismiss notification"
                  className="absolute right-2.5 top-2.5 rounded-lg p-1 text-white/40 transition hover:bg-white/10 hover:text-white">
                  <X size={14} />
                </button>
                <span className={`toast-progress absolute bottom-0 left-0 h-0.5 ${k.fg.replace('text-', 'bg-')}`} style={{ animationDuration: `${t.duration}ms` }} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
