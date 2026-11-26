import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart3, Check, FileText, Filter, HeartHandshake, Landmark, Pencil, Plus, Search, ShieldCheck, Trash2, Users, Wallet, X } from 'lucide-react';
import { useAuth } from '../lib/auth/AuthContext';
import { DB, empName } from '../data/mockDb';
import { deactivateMember, loadCoreData, recordLoanDecision, saveMember, submitLoanApplication } from '../lib/actions/core';
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
const cbuForEmployee = (employee) => employee?.dateHired ? paydaysSince(employee.dateHired) * 100 : 0;
const canAct = (role, permission) => ({
  SUPER_ADMIN: true, OPEC_PRESIDENT: ['approve', 'products', 'projects'].includes(permission), OPEC_SECRETARY: ['approve', 'projects'].includes(permission), OPEC_TREASURER: ['approve', 'release', 'products'].includes(permission),
  OPEC_AUDITOR: ['approve', 'audit'].includes(permission), REGIONAL_AUDIT_MANAGER: permission === 'audit', REGIONAL_MANAGER: permission === 'review', AREA_MANAGER: permission === 'review',
})[role] || false;

function DashboardHome({ user, coreData, onAction }) {
  const ownLoans = DB.accounts.filter((a) => !user.employeeId || a.employeeId === user.employeeId);
  const ownApps = coreData.applications || [];
  const pending = ownApps.filter((application) => ['SUBMITTED', 'FOR_APPROVAL'].includes(application.status));
  const activeLoans = DB.accounts.filter((a) => a.status !== 'FULLY_PAID' && (!user.employeeId || a.employeeId === user.employeeId));
  const activeLoanBalance = activeLoans.reduce((sum, loan) => sum + loan.balance, 0);
  const cbuBalance = user.employeeId
    ? cbuForEmployee(coreData.employees.find((employee) => employee.id === user.employeeId))
    : coreData.employees.reduce((total, employee) => total + cbuForEmployee(employee), 0);
  const stats = user.employeeId
    ? [['CBU balance', money(cbuBalance), 'Member capital build-up'], ['Active loan', activeLoans.length ? money(activeLoanBalance) : 'None', activeLoans.length ? `${activeLoans.length} account${activeLoans.length > 1 ? 's' : ''} in repayment` : 'No active accounts'], ['Applications', ownApps.length, 'Requests in your account'], ['Next payment', ownLoans[0] ? money(ownLoans[0].schedule.find((x) => x.status === 'SCHEDULED')?.amount) : '—', 'From your next schedule']]
    : [['CBU balance', money(cbuBalance), 'Total member capital build-up'], ['Active loan', money(activeLoanBalance), `${activeLoans.length} accounts in repayment`], ['Pending review', pending.length, 'Applications needing attention'], ['Members', coreData.employees.length, 'Directory records']];
  return <div className="space-y-8"><SectionTitle eyebrow="Role workspace" title={`Welcome back, ${user.name.split(' ')[0]}`} sub="Every action below is scoped to your role and recorded in the activity trail." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{stats.map(([label, value, sub], i) => <StatCard key={label} label={label} value={value} sub={sub} delay={i * 80} icon={i === 0 ? Wallet : i === 1 ? Landmark : i === 2 ? FileText : BarChart3} />)}</div><div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"><Card hover={false}><div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">Work queue</h3><Badge tone="amber">{pending.length} pending</Badge></div><div className="space-y-3">{pending.map((a) => <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[.03] p-3"><div><p className="text-sm font-semibold">{a.applicationNo}</p><p className="text-xs text-white/45">{coreData.employees.find((employee) => employee.id === a.employeeId) ? empName(coreData.employees.find((employee) => employee.id === a.employeeId)) : a.employeeId} · {money(a.requestedAmount)}</p></div><div className="flex items-center gap-2"><StatusBadge status={a.status} /><Button size="sm" variant="ghost" onClick={() => onAction('Opened application', a.applicationNo)}>Open</Button></div></div>)}{!pending.length && <p className="py-8 text-center text-sm text-white/45">Your queue is clear.</p>}</div></Card><Card hover={false}><h3 className="font-display text-xl font-bold">Quick actions</h3><div className="mt-4 grid gap-2">{user.employeeId && <Button onClick={() => onAction('Loan application started', 'Complete the form to submit your request.')}><Plus size={16} /> Apply for a loan</Button>}{canAct(user.role, 'approve') && <Button variant="ghost" onClick={() => onAction('Committee queue opened', 'Pending applications are ready for review.')}><ShieldCheck size={16} /> Review approvals</Button>}<Button variant="dark" onClick={() => onAction('Report export queued', 'Your role report will be prepared.')}><BarChart3 size={16} /> Export role report</Button></div></Card></div></div>;
}

function MembersPage({ user, coreData, setCoreData, onAction, onError }) {
  const canManage = ['SUPER_ADMIN', 'OPEC_SECRETARY'].includes(user.role);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const emptyForm = { employeeNumber: '', dateHired: new Date().toISOString().slice(0, 10), lastName: '', firstName: '', middleName: '', address: '', birthDate: '', email: '', contactNumber: '', branchAssignment: '', position: 'Teller', role: 'MEMBER' };
  const [form, setForm] = useState(emptyForm);
  const members = (coreData?.employees || []).filter((member) => `${member.firstName} ${member.lastName} ${member.email || ''} ${member.employeeNumber}`.toLowerCase().includes(query.toLowerCase()));
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const refresh = async () => setCoreData(await loadCoreData());
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await saveMember({ ...form, branchId: form.branchAssignment }, editing?.id);
      await refresh();
      onAction(editing ? 'Member updated' : 'Member saved', `${form.firstName} ${form.lastName} is now saved in the member directory.`);
      setEditing(null);
      setForm(emptyForm);
    } catch (error) {
      onError('Unable to save member', error.message || 'Please check the member details and try again.');
    } finally {
      setSaving(false);
    }
  };
  const remove = async (member) => {
    if (!window.confirm(`Deactivate ${member.firstName} ${member.lastName}? Their loan and audit history will be preserved.`)) return;
    try {
      await deactivateMember(member.id);
      await refresh();
      onAction('Member deactivated', `${member.firstName} ${member.lastName} was marked inactive.`);
    } catch (error) {
      onError('Unable to deactivate member', error.message || 'Please try again.');
    }
  };
  return <div className="space-y-6"><SectionTitle eyebrow="Organization" title="Members & structure" sub={canManage ? 'Manage employee records. Member records are retained as inactive when deactivated so financial history stays intact.' : 'View the employee directory and member capital build-up.'} />
    {canManage && <Card hover={false}><form className="grid gap-4 md:grid-cols-4" onSubmit={save}>
      <FloatInput label="Employee number" value={form.employeeNumber} onChange={(event) => update('employeeNumber', event.target.value)} required />
      <FloatInput label="Date hired" type="date" value={form.dateHired} onChange={(event) => update('dateHired', event.target.value)} required />
      <FloatInput label="Last name" value={form.lastName} onChange={(event) => update('lastName', event.target.value)} required />
      <FloatInput label="First name" value={form.firstName} onChange={(event) => update('firstName', event.target.value)} required />
      <FloatInput label="Middle name" value={form.middleName} onChange={(event) => update('middleName', event.target.value)} />
      <FloatInput label="Birth date" type="date" value={form.birthDate} onChange={(event) => update('birthDate', event.target.value)} required />
      <FloatInput label="Email" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
      <FloatInput label="Contact number" type="tel" value={form.contactNumber} onChange={(event) => update('contactNumber', event.target.value)} />
      <FloatInput label="Address" value={form.address} onChange={(event) => update('address', event.target.value)} required />
      <FloatInput label="Branch ID" value={form.branchAssignment} onChange={(event) => update('branchAssignment', event.target.value)} placeholder="For example B1" required />
      <FloatSelect label="Position" value={form.position} onChange={(event) => update('position', event.target.value)}>{['Regional Manager', 'Area Manager', 'Regional Audit Manager', 'Branch Manager', 'RST', 'RT', 'LPTL', 'RIC', 'RLC', 'Assistant Branch Manager', 'Teller'].map((position) => <option key={position}>{position}</option>)}</FloatSelect>
      {user.role === 'SUPER_ADMIN' && <FloatSelect label="Login role" value={form.role} onChange={(event) => update('role', event.target.value)}>{[['SUPER_ADMIN', 'Super Admin'], ['OPEC_PRESIDENT', 'OPEC President'], ['OPEC_SECRETARY', 'OPEC Secretary'], ['OPEC_TREASURER', 'OPEC Treasurer'], ['OPEC_AUDITOR', 'OPEC Auditor'], ['AREA_MANAGER', 'Area Manager'], ['REGIONAL_MANAGER', 'Regional Manager'], ['REGIONAL_AUDIT_MANAGER', 'Regional Audit Manager'], ['MEMBER', 'Member']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</FloatSelect>}
      <p className="text-xs text-white/50 md:col-span-4">If a login already exists for this email, it will be linked to the member record. No default password is created.</p>
      <div className="md:col-span-4 flex justify-end gap-2"><Button type="button" variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm); }}>{editing ? 'Cancel edit' : 'Clear'}</Button><Button type="submit" disabled={saving}>{saving ? 'Saving…' : <><Plus size={16} /> {editing ? 'Save changes' : 'Add member'}</>}</Button></div>
    </form></Card>}
    <Card hover={false}><div className="mb-5 flex items-center gap-3"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-white/40" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search members" className="w-full rounded-xl border border-white/10 bg-white/[.04] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gold-300/50" /></div><Badge tone="amber">{members.length} members</Badge></div><div className="space-y-2">{members.map((member) => <div key={member.id} className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[.025] p-4 md:flex-row md:items-center md:justify-between"><div><p className="font-semibold">{empName(member)}</p><p className="text-xs text-white/45">{member.employeeNumber} · {member.position} · Hired {member.dateHired} · CBU {money(cbuForEmployee(member))}{member.employmentStatus !== 'PERMANENT' && ` · ${member.employmentStatus}`}</p></div>{canManage && member.employmentStatus !== 'INACTIVE' && <div className="flex gap-2"><Button size="sm" variant="ghost" onClick={() => { setEditing(member); setForm({ ...emptyForm, ...member, branchAssignment: member.branchId || '', birthDate: member.birthDate || '', contactNumber: member.contactNumber || '', role: member.accountRole || 'MEMBER' }); }}><Pencil size={14} /> Edit</Button><Button size="sm" variant="ghost" onClick={() => remove(member)}><Trash2 size={14} /> Deactivate</Button></div>}</div>)}{!members.length && <p className="py-10 text-center text-sm text-white/45">No matching members in the database.</p>}</div></Card></div>;
}

function ListPage({ path, user, coreData, setCoreData, onAction, onError }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('ALL');
  const [saving, setSaving] = useState(false);
  const [applicationForm, setApplicationForm] = useState({ productId: '', amount: '', termMonths: '', purpose: '', coMakerIds: [] });
  const title = TITLES[path]?.[0] || 'Dashboard';
  const products = coreData?.products || [];
  const selectedProduct = products.find((product) => product.id === applicationForm.productId) || products[0];
  const applications = useMemo(() => (coreData?.applications || []).filter((application) => (status === 'ALL' || application.status === status) && `${application.applicationNo} ${application.purpose || ''}`.toLowerCase().includes(query.toLowerCase())), [coreData?.applications, query, status]);
  const data = path === '/members' ? coreData?.employees || [] : path === '/projects' ? DB.projects : path === '/loans/active' ? DB.accounts : path === '/products' ? products : path === '/audit' ? DB.auditLog : applications;
  const refresh = async () => setCoreData(await loadCoreData());
  const decide = async (item, decision) => {
    const reason = decision === 'REJECTED' ? window.prompt('Enter the reason for rejecting this application (required):') : '';
    if (decision === 'REJECTED' && !reason?.trim()) {
      onError('Rejection reason required', 'Enter a reason of at least five characters to reject this application.');
      return;
    }
    setSaving(true);
    try {
      const result = await recordLoanDecision(item.id, decision, reason || '');
      await refresh();
      onAction(decision === 'REJECTED' ? 'Application rejected' : result.status === 'APPROVED' ? 'Committee approval complete' : 'Committee decision recorded', decision === 'REJECTED' ? `${item.applicationNo} was rejected with a recorded reason.` : result.status === 'APPROVED' ? `${item.applicationNo} is approved by the full committee.` : `${item.applicationNo} still requires the other committee approvals.`);
    } catch (error) {
      onError('Unable to record decision', error.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (path === '/loans/apply') return <Card hover={false}><SectionTitle eyebrow="Loans" title={title} sub={TITLES[path][1]} />
    {!user.employeeId ? <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Your account is not linked to an active member record. Ask an administrator to link your registered email before applying.</p> : !products.length ? <p className="rounded-xl border border-white/10 bg-white/[.03] p-4 text-sm text-white/60">There are no active loan products available right now.</p> : <form className="grid gap-4 md:grid-cols-2" onSubmit={async (event) => {
      event.preventDefault();
      setSaving(true);
      try {
        const result = await submitLoanApplication({ ...applicationForm, productId: applicationForm.productId || products[0].id, amount: Number(applicationForm.amount), termMonths: Number(applicationForm.termMonths) });
        await refresh();
        onAction('Application submitted', `${result.applicationNo} was saved for committee review.`);
        setApplicationForm({ productId: '', amount: '', termMonths: '', purpose: '', coMakerIds: [] });
      } catch (error) {
        onError('Unable to submit application', error.message || 'Please review the requested amount, term, and co-makers.');
      } finally {
        setSaving(false);
      }
    }}>
      <FloatSelect label="Loan product" value={applicationForm.productId || products[0]?.id || ''} onChange={(event) => setApplicationForm((current) => ({ ...current, productId: event.target.value, termMonths: '' }))}>{products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}</FloatSelect>
      <FloatInput label="Requested amount (₱)" type="number" min={selectedProduct?.minAmount || 1} max={selectedProduct?.maxAmount} step="0.01" value={applicationForm.amount} onChange={(event) => setApplicationForm((current) => ({ ...current, amount: event.target.value }))} required />
      <FloatSelect label="Repayment term" value={applicationForm.termMonths} onChange={(event) => setApplicationForm((current) => ({ ...current, termMonths: event.target.value }))} required><option value="">Choose a term</option>{Array.from({ length: selectedProduct?.maxTermMonths || 1 }, (_, index) => <option key={index + 1} value={index + 1}>{index + 1} months</option>)}</FloatSelect>
      <FloatInput label="Purpose" value={applicationForm.purpose} onChange={(event) => setApplicationForm((current) => ({ ...current, purpose: event.target.value }))} required />
      {(selectedProduct?.requiredCoMakers || 0) > 0 && <div className="md:col-span-2"><label htmlFor="loan-co-makers" className="mb-2 block text-sm font-medium">Co-makers (select {selectedProduct.requiredCoMakers})</label><select id="loan-co-makers" multiple size={Math.min(Math.max((coreData.coMakers || []).length, 4), 8)} value={applicationForm.coMakerIds} onChange={(event) => setApplicationForm((current) => ({ ...current, coMakerIds: Array.from(event.target.selectedOptions, (option) => option.value) }))} className="w-full rounded-xl border border-white/10 bg-[#171817] p-3 text-sm outline-none focus:border-gold-300/50">{(coreData.coMakers || []).filter((employee) => employee.id !== user.employeeId).map((employee) => <option key={employee.id} value={employee.id}>{employee.employeeNumber} · {employee.firstName} {employee.lastName}</option>)}</select><p className="mt-1 text-xs text-white/45">Use Ctrl or Command to select multiple co-makers. Eligibility and the required count are checked again on the server.</p></div>}
      <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={saving}>{saving ? 'Submitting…' : <><Check size={16} /> Submit application</>}</Button></div>
    </form>}
  </Card>;

  return <div className="space-y-6"><SectionTitle eyebrow="Operations" title={title} sub={TITLES[path]?.[1]} /><Card hover={false}><div className="mb-5 flex flex-col gap-3 md:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-3 text-white/40" size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" className="w-full rounded-xl border border-white/10 bg-white/[.04] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-gold-300/50" /></div>{(path.startsWith('/loans')) && <FloatSelect label="Status" value={status} onChange={(event) => setStatus(event.target.value)}><option>ALL</option><option>SUBMITTED</option><option>FOR_APPROVAL</option><option>APPROVED</option><option>REJECTED</option></FloatSelect>}<Button variant="ghost" onClick={() => onAction('Filters applied', `${data.length} records match your view.`)}><Filter size={16} /> Filter</Button></div><div className="space-y-2">{data.map((item) => { const label = item.applicationNo || item.loanNumber || item.name || item.projectNumber || item.email || item.action; const applicant = item.employeeId ? coreData.employees.find((employee) => employee.id === item.employeeId) : null; const detail = item.purpose || item.position || item.description || item.detail || (item.principal ? `${money(item.principal)} · ${item.paidInstallments}/${item.term} paid` : ''); const itemStatus = item.status; return <div key={item.id || item.at} className="flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[.025] p-4 md:flex-row md:items-center md:justify-between"><div><p className="text-sm font-semibold">{label}</p><p className="text-xs text-white/45">{applicant ? `${empName(applicant)} · ` : ''}{detail}</p></div><div className="flex items-center gap-2">{itemStatus && <StatusBadge status={itemStatus} />}<Button size="sm" variant="ghost" onClick={() => onAction('Record opened', label)}>View</Button>{['SUBMITTED', 'FOR_APPROVAL'].includes(itemStatus) && canAct(user.role, 'approve') && <><Button size="sm" disabled={saving} onClick={() => decide(item, 'APPROVED')}>Record approval</Button><Button size="sm" variant="ghost" disabled={saving} onClick={() => decide(item, 'REJECTED')}>Reject</Button></>}</div></div>; })}{!data.length && <p className="py-10 text-center text-sm text-white/45">No records found.</p>}</div></Card></div>;
}

export default function RoleDashboard() { const { user, coreData, setCoreData } = useAuth(); const { pathname } = useLocation(); const toast = useToast(); const onAction = (title, message) => toast.success(title, message); const onError = (title, message) => toast.error(title, message); return <>{pathname === '/dashboard' ? <DashboardHome user={user} coreData={coreData} onAction={onAction} /> : pathname === '/members' ? <MembersPage user={user} coreData={coreData} setCoreData={setCoreData} onAction={onAction} onError={onError} /> : <ListPage path={pathname} user={user} coreData={coreData} setCoreData={setCoreData} onAction={onAction} onError={onError} />}</>; }
