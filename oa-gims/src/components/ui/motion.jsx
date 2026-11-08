import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

/** Reveal-on-scroll wrapper for smooth section transitions. */
export function Reveal({ children, delay = 0, y = 34, className = '' }) {
  const ref = useRef(null);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay, ease: [0.2, 0.8, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Animated count-up used on hero stats. */
export function CountUp({ to, prefix = '', suffix = '', duration = 1.6, decimals = 0 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let start = null, raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + (to * eased).toLocaleString('en-PH', { maximumFractionDigits: decimals, minimumFractionDigits: decimals }) + suffix;
      if (p < 1) raf = requestAnimationFrame(step);
    };
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { raf = requestAnimationFrame(step); io.disconnect(); } }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [to, prefix, suffix, duration, decimals]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
}

export const pageTransition = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -18, filter: 'blur(6px)' },
  transition: { duration: 0.45, ease: [0.2, 0.8, 0.2, 1] },
};
