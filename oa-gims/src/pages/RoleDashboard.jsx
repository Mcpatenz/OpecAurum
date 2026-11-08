import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, Check, FileText, Filter, HeartHandshake, Landmark, Pencil, Plus, Search, ShieldCheck, Trash2, Users, Wallet, X } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { DB, empName, findEmployee } from '../data/mockDb';
import { useToast } from '../components/ui/Toast';
import { Badge, Button, Card, FloatInput, FloatSelect, SectionTitle, StatCard, StatusBadge } from '../components/ui/primitives';

const TITLES = {
  '/loans/apply': ['Loan application', 'Submit a new request and track its review.'],
  '/loans/applications': ['Loan applications', 'Review the organization loan pipeline.'],
  '/approvals': ['Credit committee', 'Record committee decisions before release.'],
  '/releases': ['Loan releases', 'Release approved loans and record the disbursement.'],
  '/payroll': ['Payroll deductions', 'Match payroll imports and monitor deduction exceptions.'],
  '/products': ['Loan products', 'Manage active products, limits, fees, and eligibility.'],
  '/loans/active': ['Active loans', 'Monitor balances, schedules, and repayment health.'],
  '/members': ['Members & structure', 'Manage the employee directory and organizational structure.'],
  '/projects': ['CSR projects', 'Coordinate community projects, events, and donations.'],
  '/reports': ['Reports', 'Build an operational view for your role.'],
  '/audit': ['Audit logs', 'Review immutable activity across OA-GIMS.'],
};

const money = (n) => `₱${Number(n || 0).toLocaleString('en-PH', { maximumFractionDigits: 0 })}`;
const paydaysSince = (dateHired, asOf = new Date()) => {
  const start = new Date(`${dateHired}T00:00:00`);
  let total = 0;
  for (let year = start.getFullYear(); year <= asOf.getFullYear(); year += 1) {
    const firstMonth = year === start.getFullYear() ? start.getMonth() : 0;
    const lastMonth = year === asOf.getFullYear() ? asOf.getMonth() : 11;
    for (let month = firstMonth; month <= lastMonth; month += 1) {
      const lastDay = new Date(year, month + 1, 0).getDate();
      [15, lastDay].forEach((day) => {
        const payday = new Date(year, month, day);
        if (payday >= start && payday <= asOf) total += 1;
      });
    }
  }
  return total;
};
const cbuForEmployee = (employee) => paydaysSince(employee.dateHired) * 100;
const canAct = (role, permission) => ({
  SUPER_ADMIN: true, OPEC_PRESIDENT: ['approve', 'products', 'projects'].includes(permission), OPEC_SECRETARY: ['approve', 'projects'].includes(permission), OPEC_TREASURER: ['approve', 'release', 'products'].includes(permission),
  OPEC_AUDITOR: permission === 'audit', REGIONAL_AUDIT_MANAGER: permission === 'audit', REGIONAL_MANAGER: permission === 'review', AREA_MANAGER: permission === 'review',
})[role] || false;

function DashboardHome({ user, onAction }) {
  const ownLoans = DB.accounts.filter((a) => !user.employeeId || a.employeeId === user.employeeId);
  const ownApps = DB.applications.filter((a) => !user.employeeId || a.employeeId === user.employeeId);
  const pending = DB.applications.filter((a) => ['SUBMITTED', 'FOR_APPROVAL'].includes(a.status));
  const activeLoans = DB.accounts.filter((a) => a.status !== 'FULLY_PAID' && (!user.employeeId || a.employeeId === user.employeeId));
  const activeLoanBalance = activeLoans.reduce((sum, loan) => sum + loan.balance, 0);
  const cbuBalance = user.employeeId
    ? cbuForEmployee(findEmployee(user.employeeId))
    : DB.employees.reduce((total, employee) => total + cbuForEmployee(employee), 0);
  const stats = user.employeeId
    ? [['CBU balance', money(cbuBalance), 'Member capital build-up'], ['Active loan', activeLoans.length ? money(activeLoanBalance) : 'None', activeLoans.length ? `${activeLoans.length} account${activeLoans.length > 1 ? 's' : ''} in repayment` : 'No active accounts'], ['Applications', ownApps.length, 'Requests in your account'], ['Next payment', ownLoans[0] ? money(ownLoans[0].schedule.find((x) => x.status === 'SCHEDULED')?.amount) : '—', 'From your next schedule']]
    : [['CBU balance', money(cbuBalance), 'Total member capital build-up'], ['Active loan', money(activeLoanBalance), `${activeLoans.length} accounts in repayment`], ['Pending review', pending.length, 'Applications needing attention'], ['Members', DB.employees.length, 'Directory records']];
  return <div className="space-y-8"><SectionTitle eyebrow="Role workspace" title={`Welcome back, ${user.name.split(' ')[0]}`} sub="Every action below is scoped to your role and recorded in the activity trail." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, sub], i) => <StatCard key={label} label={label} value={value} sub={sub} delay={i * 80} icon={i === 0 ? Wallet : i === 1 ? Landmark : i === 2 ? FileText : BarChart3} />)}</div><div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><Card hover={false}><div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">Work queue</h3><Badge tone="amber">{pending.length} pending</Badge></div><div className="space-y-3">{pending.map((a) => <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] p-3"><div><p className="text-sm font-semibold">{a.applicationNo}</p><p className="text-xs text-white/45">{findEmployee(a.employeeId) && empName(findEmployee(a.employeeId))} · {money(a.requestedAmount)}</p></div><div className="flex items-center gap-2"><StatusBadge status={a.status} /><Button size="sm" variant="ghost" onClick={() => onAction('Opened application', a.applicationNo)}>Open</Button></div></div>)}{!pending.length && <p className="py-8 text-center text-sm text-white/45">Your queue is clear.</p>}</div></Card><Card hover={false}><h3 className="font-display text-xl font-bold">Quick actions</h3><div className="mt-4 grid gap-2">{user.employeeId && <Button onClick={() => onAction('Loan application started', 'Complete the form to submit your request.')}><Plus size={16} /> Apply for a loan</Button>}{canAct(user.role, 'approve') && <Button variant="ghost" onClick={() => onAction('Committee queue opened', 'Pending applications are ready for review.')}><ShieldCheck size={16} /> Review approvals</Button>}<Button variant="dark" onClick={() => onAction('Report export queued', 'Your role report will be prepared.')}><BarChart3 size={16} /> Export role report</Button></div></Card></div></div>;
}

function MembersPage({ user, onAction }) {
  const canManage = ['SUPER_ADMIN', 'OPEC_SECRETARY'].includes(user.role);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', position: '', dateHired: new Date().toISOString().slice(0, 10) });
  const members = DB.employees.filter((member) => `${member.firstName} ${member.lastName} ${member.email}`.toLowerCase().includes(query.toLowerCase()));
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const save = (event) => {
    event.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.dateHired) return;
    if (editing) Object.assign(editing, form);
    else DB.employees.push({ ...form, id: `EMP${String(DB.employees.length + 1).padStart(3, '0')}`, employeeNumber: `ML-${String(DB.employees.length + 1).padStart(4, '0')}`, middleName: '', employmentStatus: 'PERMANENT', branchId: 'B1' });
    setEditing(null);
    setForm({ firstName: '', lastName: '', email: '', position: '', dateHired: new Date().toISOString().slice(0, 10) });
    onAction(editing ? 'Member updated' : 'Member added', `${form.firstName} ${form.lastName} is now in the member directory.`);
  };
  const remove = (member) => { if (!window.confirm(`Delete ${member.firstName} ${member.lastName}?`)) return; const index = DB.employees.indexOf(member); if (index >= 0) DB.employees.splice(index, 1); onAction('Member deleted', `${member.firstName} ${member.lastName} was removed.`); };
  return <div className="space-y-6"><SectionTitle eyebrow="Organization" title="Members & structure" sub={canManage ? 'Add, update, and remove members. CBU is calculated at ₱100 per payday from the hire date.' : 'View the employee directory and member capital build-up.'} />
    {canManage && <Card hover={false}><form className="grid gap-3 md:grid-cols-5" onSubmit={save}>{[['firstName', 'First name'], ['lastName', 'Last name'], ['email', 'Email'], ['position', 'Position'], ['dateHired', 'Date hired']].map(([key, label]) => <FloatInput key={key} label={label} type={key === 'dateHired' ? 'date' : key === 'email' ? 'email' : 'text'} value={form[key]} onChange={(event) => update(key, event.target.value)} required />)}<div className="md:col-span-5 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => { setEditing(null); setForm({ firstName: '', lastName: '', email: '', position: '', dateHired: new Date().toISOString().slice(0, 10) }); }}>{editing ? 'Cancel edit' : 'Clear'}</Button><Button type="submit"><Plus size={16} /> {editing ? 'Update member' : 'Add member'}</Button></div></form></Card>}
    <Card hover={false}><div className="mb-5 flex items-center gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-white/40" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members" className="w-full rounded-xl border border-white/10 bg-white/[.04] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gold-300/50" /></div><Badge tone="amber">{members.length} members</Badge></div><div className="space-y-2">{members.map((member) => <div key={member.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{empName(member)}</p><p className="text-xs text-white/45">{member.position} · Hired {member.dateHired} · CBU {money(cbuForEmployee(member))}</p></div>{canManage && <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { setEditing(member); setForm({ firstName: member.firstName, lastName: member.lastName, email: member.email, position: member.position, dateHired: member.dateHired }); }}><Pencil size={14} /> Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(member)}><Trash2 size={14} /> Delete</Button></div>}</div>)}</div></Card></div>;
}

function ListPage({ path, user, onAction }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [showForm, setShowForm] = useState(path === '/loans/apply');
  const title = TITLES[path]?.[0] || 'Dashboard';
  const applications = useMemo(() => DB.applications.filter((a) => (!user.employeeId || a.employeeId === user.employeeId) && (status === 'ALL' || a.status === status) && `${a.applicationNo} ${a.purpose}`.toLowerCase().includes(query.toLowerCase())), [path, query, status, user.employeeId]);
  const data = path === '/members' ? DB.employees : path === '/projects' ? DB.projects : path === '/loans/active' ? DB.accounts : path === '/products' ? DB.products : path === '/audit' ? DB.auditLog : applications;
  if (path === '/loans/apply') return <Card hover={false}><SectionTitle eyebrow="Loans" title={title} sub={TITLES[path][1]} /><form className="grid gap-4 md:grid-cols-2" onSubmit={(e) => { e.preventDefault(); onAction('Application submitted', 'Your request was sent for review.'); }}><FloatSelect label="Loan product"><option>Commodity Loan</option><option>Cash Loan</option><option>Educational Loan</option><option>Emergency Loan</option></FloatSelect><FloatInput label="Requested amount" type="number" min="1000" required /><FloatSelect label="Term"><option>12 months</option><option>18 months</option><option>24 months</option></FloatSelect><FloatInput label="Purpose" required /><div className="md:col-span-2 flex justify-end"><Button type="submit"><Check size={16} /> Submit application</Button></div></form></Card>;
  return <div className="space-y-6"><SectionTitle eyebrow="Operations" title={title} sub={TITLES[path]?.[1]} /><Card hover={false}><div className="mb-5 flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-white/40" size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search records" className="w-full rounded-xl border border-white/10 bg-white/[.04] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gold-300/50" /></div>{(path.startsWith('/loans')) && <FloatSelect label="Status" value={status} onChange={(e) => setStatus(e.target.value)}><option>ALL</option><option>SUBMITTED</option><option>FOR_APPROVAL</option><option>APPROVED</option><option>REJECTED</option></FloatSelect>}<Button variant="ghost" onClick={() => onAction('Filters applied', `${data.length} records match your view.`)}><Filter size={16} /> Filter</Button></div><div className="space-y-2">{data.map((item) => { const label = item.applicationNo || item.loanNumber || item.name || item.projectNumber || item.email || item.action; const detail = item.purpose || item.position || item.description || item.detail || (item.principal ? `${money(item.principal)} · ${item.paidInstallments}/${item.term} paid` : ''); const itemStatus = item.status; return <div key={item.id || item.at} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[.025] p-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-white/45">{detail}</p></div><div className="flex items-center gap-2">{itemStatus && <StatusBadge status={itemStatus} />}<Button size="sm" variant="ghost" onClick={() => onAction('Record opened', label)}>View</Button>{['SUBMITTED', 'FOR_APPROVAL'].includes(itemStatus) && canAct(user.role, 'approve') && <Button size="sm" onClick={() => onAction('Decision recorded', `${label} marked approved for the next workflow step.`)}>Approve</Button>}</div></div>; })}{!data.length && <p className="py-10 text-center text-sm text-white/45">No records found.</p>}</div></Card></div>;
}

export default function RoleDashboard() { const { user } = useAuth(); const { pathname } = useLocation(); const toast = useToast(); const [notification, setNotification] = useState(false); const onAction = (title, message) => toast.success(title, message); return <>{pathname === '/dashboard' ? <DashboardHome user={user} onAction={onAction} /> : pathname === '/members' ? <MembersPage user={user} onAction={onAction} /> : <ListPage path={pathname} user={user} onAction={onAction} />}</>; }
