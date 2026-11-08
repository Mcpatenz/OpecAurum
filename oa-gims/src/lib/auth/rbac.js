// OA-GIMS — Server-side RBAC (spec §3–§4, §50). Never trust client-supplied roles.

export const ROLES = [
  'SUPER_ADMIN', 'OPEC_PRESIDENT', 'OPEC_SECRETARY', 'OPEC_TREASURER', 'OPEC_AUDITOR',
  'MEMBER', 'REGIONAL_MANAGER', 'AREA_MANAGER', 'REGIONAL_AUDIT_MANAGER',
];

export const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin', OPEC_PRESIDENT: 'OPEC President', OPEC_SECRETARY: 'OPEC Secretary',
  OPEC_TREASURER: 'OPEC Treasurer', OPEC_AUDITOR: 'OPEC Auditor', MEMBER: 'Member',
  REGIONAL_MANAGER: 'Regional Manager', AREA_MANAGER: 'Area Manager', REGIONAL_AUDIT_MANAGER: 'Regional Audit Manager',
};

/** Credit committee whose approval is required before a loan becomes APPROVED (spec §14). */
export const COMMITTEE_ROLES = ['OPEC_PRESIDENT', 'OPEC_SECRETARY', 'OPEC_TREASURER', 'OPEC_AUDITOR'];

const PERMS = {
  'members:create': ['SUPER_ADMIN', 'OPEC_PRESIDENT', 'OPEC_OFFICER', 'REGIONAL_MANAGER', 'AREA_MANAGER'],
  'members:read': [...ROLES],
  'loans:create': ['SUPER_ADMIN', 'LOAN_OFFICER', 'MEMBER'],
  'loans:review': ['SUPER_ADMIN', 'LOAN_OFFICER', 'FINANCE_OFFICER'],
  'loans:approve': ['SUPER_ADMIN', ...COMMITTEE_ROLES],
  'loans:release': ['SUPER_ADMIN', 'OPEC_TREASURER'],
  'payments:manage': ['SUPER_ADMIN', 'TREASURER', 'FINANCE_OFFICER', 'LOAN_OFFICER'],
  'payroll:manage': ['SUPER_ADMIN', 'PAYROLL_MASTER'],
  'products:manage': ['SUPER_ADMIN', 'OPEC_PRESIDENT', 'TREASURER'],
  'projects:manage': ['SUPER_ADMIN', 'OPEC_PRESIDENT', 'PROJECT_COORDINATOR'],
  'donations:manage': ['SUPER_ADMIN', 'TREASURER', 'PROJECT_COORDINATOR'],
  'reports:full': ['SUPER_ADMIN', 'OPEC_PRESIDENT'],
  'reports:financial': ['SUPER_ADMIN', 'TREASURER', 'AUDITOR'],
  'audit:read': ['SUPER_ADMIN', 'AUDITOR'],
  'settings:manage': ['SUPER_ADMIN', 'OPEC_PRESIDENT', 'TREASURER'],
};

export function can(role, permission) {
  if (!role || !PERMS[permission]) return false;
  return PERMS[permission].includes(role);
}

/** requireRole / requirePermission / requireLoanAccess equivalents for API route handlers. */
export function requireRole(session, roles) {
  if (!session?.user) throw Object.assign(new Error('Unauthenticated'), { status: 401 });
  if (!roles.includes(session.user.role)) throw Object.assign(new Error('Forbidden'), { status: 403 });
  return session.user;
}

export function requireLoanAccess(session, applicationEmployeeId) {
  const u = session?.user;
  if (!u) throw Object.assign(new Error('Unauthenticated'), { status: 401 });
  const privileged = ['SUPER_ADMIN', 'OPEC_PRESIDENT', 'OPEC_SECRETARY', 'OPEC_TREASURER', 'OPEC_AUDITOR', 'REGIONAL_MANAGER', 'AREA_MANAGER', 'REGIONAL_AUDIT_MANAGER'];
  if (privileged.includes(u.role)) return u;
  if (u.employeeId === applicationEmployeeId) return u; // members see their own
  throw Object.assign(new Error('Forbidden'), { status: 403 });
}
