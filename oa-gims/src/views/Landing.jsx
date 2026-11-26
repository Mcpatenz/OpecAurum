import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Gem, Landmark, Users, HeartHandshake, ShieldCheck, Workflow, FileSpreadsheet, QrCode, ArrowRight, Sparkles } from 'lucide-react';
import GemScene from '../components/ui/GemScene';
import { Button, Badge } from '../components/ui/primitives';
import { Reveal, CountUp } from '../components/ui/motion';
import Seo from '../lib/seo';

const MODULES = [
  { icon: Users, title: 'Organization Management', desc: 'Employees & members, OPEC membership, officers, regions, areas, branches and the full organizational hierarchy.', tone: 'from-sky-400/20 to-sky-400/5' },
  { icon: Landmark, title: 'Employee Loan Management', desc: 'Loan products, eligibility engine, applications, co-makers, credit committee, releasing, amortization and payroll deductions.', tone: 'from-gold-300/20 to-aurum-deep/10' },
  { icon: HeartHandshake, title: 'Community / CSR', desc: 'Projects, events with QR attendance, beneficiaries, volunteers, donations, expenses and accomplishment reports.', tone: 'from-emerald-400/20 to-emerald-400/5' },
  { icon: ShieldCheck, title: 'Administration', desc: 'Users, roles & permissions (RBAC), notifications, reports, immutable audit logs and system configuration.', tone: 'from-violet-400/20 to-violet-400/5' },
];

const FEATURES = [
  { icon: Workflow, t: 'Credit Committee Workflow', d: 'SUBMITTED → REVIEW → DOCUMENT VALIDATION → 5-signature committee → APPROVED. Any rejection requires a mandatory reason.' },
  { icon: FileSpreadsheet, t: 'Configurable Amortization', d: 'FLAT_RATE, REDUCING_BALANCE or CUSTOM_OPEC_FORMULA — due dates aligned to the 15th & 30th paydays.' },
  { icon: Sparkles, t: 'Eligibility Engine', d: 'Years of service computed automatically from date hired, mapped against configured LoanEligibilityRules.' },
  { icon: QrCode, t: 'QR Event Attendance', d: 'Field activities captured with time-in/time-out and attendance status per volunteer.' },
];

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -80]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.15]);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink text-white">
      <Seo />

      {/* Nav */}
      <header className="fixed inset-x-0 top-0 z-50">
        <motion.nav initial={{ y: -70 }} animate={{ y: 0 }} transition={{ duration: 0.7 }}
          className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-2xl glass-strong px-5 py-3 md:px-7 mx-4 md:mx-auto">
          <Link to="/" className="flex items-center gap-2">
            <Gem className="text-aurum animate-pulseGlow" size={22} />
            <span className="font-display font-bold tracking-wide">OA-GIMS</span>
          </Link>
          <div className="hidden items-center gap-7 text-sm text-white/70 md:flex">
            <a href="#modules" className="transition hover:text-gold-200">Modules</a>
            <a href="#workflow" className="transition hover:text-gold-200">Loan Flow</a>
            <a href="#platform" className="transition hover:text-gold-200">Platform</a>
            <a href="#phases" className="transition hover:text-gold-200">Roadmap</a>
          </div>
          <Link to="/login"><Button size="sm">Portal Login <ArrowRight size={15} /></Button></Link>
        </motion.nav>
      </header>

      {/* Hero */}
      <section className="relative grid min-h-screen place-items-center">
        <GemScene />
        <div className="pointer-events-none absolute inset-0 bg-hero-fade" aria-hidden="true" />
        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-20 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.7 }}>
            <Badge tone="gold" className="mb-6">OPEC AURUM GEMS • INTEGRATED PLATFORM</Badge>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 34 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.8 }}
            className="font-display text-5xl font-bold leading-[1.05] md:text-7xl">
            Empowering Members.<br /><span className="gold-text">Managing Loans.</span><br />Building Communities.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            className="mx-auto mt-6 max-w-2xl text-base text-white/65 md:text-lg">
            OA-GIMS unifies organization management, the complete employee loan lifecycle — from eligibility to
            clearance — and community/CSR programs into one cinematic, secure web platform.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link to="/login"><Button size="lg">Enter the Portal <ArrowRight size={18} /></Button></Link>
            <a href="#modules"><Button size="lg" variant="ghost">Explore Modules</Button></a>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
            className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
            {[['1,250+', 'Members'], ['183', 'Active Loans'], ['₱4.2M', 'Released 2026'], ['86', 'CSR Projects']].map(([v, l]) => (
              <div key={l} className="glass rounded-2xl p-4">
                <p className="font-display text-2xl md:text-3xl font-bold text-gold-200">
                  {v.startsWith('₱') ? v : <CountUp to={parseInt(v)} suffix={v.includes('+') ? '+' : ''} />}
                </p>
                <p className="text-xs uppercase tracking-widest text-white/50">{l}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Modules */}
      <section id="modules" className="relative mx-auto max-w-6xl px-6 py-24">
        <Reveal><p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-300">Four pillars, one system</p>
          <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold">System <span className="gold-text">Modules</span></h2></Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {MODULES.map((m, i) => (
            <Reveal key={m.title} delay={i * 0.1}>
              <div className={`card-hover h-full rounded-3xl glass bg-gradient-to-br ${m.tone} p-7`}>
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/8 text-gold-200"><m.icon size={26} /></span>
                <h3 className="mt-5 font-display text-xl font-bold">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="relative border-y border-line bg-coal/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-300">From application to clearance</p>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold">The Loan <span className="gold-text">Lifecycle</span></h2>
          </Reveal>
          <div className="mt-14 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
            {[['📝', 'Apply', 'Eligibility + co-makers validated live'], ['🔎', 'Review', 'Loan officer & document validation'], ['🏛️', 'Committee', 'President • Treasurer • Auditor • Payroll • Adviser'], ['✅', 'Approve', 'All required signatures'], ['💰', 'Release', 'Net of fees, receipt generated'], ['🧾', 'Payroll', 'Deductions every 15th & 30th']].map(([emo, t, d], i) => (
              <Reveal key={t} delay={i * 0.08}>
                <div className="relative h-full rounded-2xl glass p-5 card-hover">
                  <span className="absolute -top-3 left-4 rounded-full bg-aurum px-2 py-0.5 text-[10px] font-black text-ink">{i + 1}</span>
                  <p className="text-2xl">{emo}</p>
                  <h4 className="mt-2 font-bold text-gold-100">{t}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-white/55">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Platform features */}
      <section id="platform" className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-300">Enterprise grade</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Built as a real <span className="gold-text">enterprise application</span></h2>
            <div className="mt-8 space-y-5">
              {FEATURES.map((f, i) => (
                <Reveal key={f.t} delay={i * 0.08}>
                  <div className="flex gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-400/15 text-gold-200"><f.icon size={20} /></span>
                    <div>
                      <h4 className="font-semibold">{f.t}</h4>
                      <p className="text-sm text-white/55">{f.d}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-3xl glass-strong p-6 shadow-card">
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-gold-300">Stack</p>
              <div className="flex flex-wrap gap-2">
                {['React.js', 'Vite', 'Tailwind CSS', 'Three.js', 'Framer Motion', 'Prisma ORM', 'PostgreSQL', 'Node API', 'RBAC', 'Audit Logs', 'PDF Receipts', 'Toast System'].map((t) => (
                  <span key={t} className="rounded-full border border-gold-300/25 bg-gold-400/10 px-3 py-1.5 text-xs font-semibold text-gold-100 transition hover:scale-105 hover:bg-gold-400/20">{t}</span>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-black/40 p-4 font-mono text-[11px] leading-relaxed text-emerald-300/90">
                <p className="text-white/40"># May 2025 policy encoded as data, not code</p>
                <p>LoanProduct <span className="text-gold-200">COMMODITY</span> ₱30,000 · 24 mo · 1.5%</p>
                <p>Rule ≥5 yrs → max ₱30,000 · 4 co-makers</p>
                <p>Paydays → due 15th & 30th</p>
                <p>Status: <span className="text-gold-200">CUSTOM_OPEC_FORMULA ✓ configurable</span></p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Roadmap */}
      <section id="phases" className="border-t border-line bg-coal/60 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal><h2 className="font-display text-3xl md:text-4xl font-bold text-center">Delivery <span className="gold-text">Roadmap</span></h2></Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-5">
            {[['Phase 1', 'Foundation', 'Auth • RBAC • Employees • Regions/Areas/Branches'], ['Phase 2', 'Loan System', 'Products • Eligibility • Applications • Approvals'], ['Phase 3', 'Financial', 'Accounts • Amortization • Releases • Payroll'], ['Phase 4', 'Community', 'Projects • Events • Donations • Expenses'], ['Phase 5', 'Advanced', 'QR • PWA • Analytics • e-Signatures']].map(([p, t, d], i) => (
              <Reveal key={p} delay={i * 0.08}>
                <div className={`h-full rounded-2xl glass p-5 card-hover ${i < 3 ? 'border-gold-300/40' : ''}`}>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gold-300">{p}{i < 3 ? ' • SHIPPED' : ''}</p>
                  <h4 className="mt-1 font-display text-lg font-bold">{t}</h4>
                  <p className="mt-1.5 text-xs text-white/55">{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Footer */}
      <section className="relative overflow-hidden py-28 text-center">
        <div className="absolute inset-0 bg-gold-radial" aria-hidden="true" />
        <Reveal className="relative">
          <h2 className="mx-auto max-w-3xl px-6 font-display text-3xl md:text-5xl font-bold">
            One platform for <span className="gold-text">every gem</span> in the organization.
          </h2>
          <div className="mt-8"><Link to="/login"><Button size="lg">Launch OA-GIMS <ArrowRight size={18} /></Button></Link></div>
        </Reveal>
      </section>

      <footer className="border-t border-line py-10 text-center text-xs text-white/40">
        <p className="font-display text-sm text-gold-200/80">OPEC AURUM GEMS INTEGRATED MANAGEMENT SYSTEM</p>
        <p className="mt-1">Empowering Members • Managing Loans • Building Communities</p>
        <p className="mt-3">© {new Date().getFullYear()} OPEC Aurum Gems. Loan rules modeled from the May 2025 form — validate against approved policy before production.</p>
      </footer>
    </div>
  );
}
