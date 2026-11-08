import React, { createContext, useContext, useMemo, useState } from 'react';
import { DB, findEmployee } from '../data/mockDb';

/**
 * Demo auth context. In production this wraps a session cookie issued by
 * /api/auth (server-side RBAC — see src/lib/auth/rbac.js). The role always comes
 * from the server session, never from the client.
 */
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const DIRECTORY = [
  { email: 'admin@opecaurum.org', role: 'SUPER_ADMIN', name: 'System Administrator' },
  { email: 'president@opecaurum.org', role: 'OPEC_PRESIDENT', name: 'Hon. Rodrigo Bautista', employeeId: null },
  { email: 'treasurer@opecaurum.org', role: 'TREASURER', name: 'Ms. Vilma Ocampo' },
  { email: 'auditor@opecaurum.org', role: 'AUDITOR', name: 'Atty. Cesar Dizon' },
  { email: 'payroll@opecaurum.org', role: 'PAYROLL_MASTER', name: 'Mr. Nestor Villanueva' },
  { email: 'adviser@opecaurum.org', role: 'OPEC_ADVISER', name: 'Engr. Amado Serales' },
  { email: 'loan.officer@opecaurum.org', role: 'LOAN_OFFICER', name: 'Ms. Divina Marasigan' },
  { email: 'juan@opecaurum.org', role: 'MEMBER', name: 'Juan Dela Cruz', employeeId: 'EMP001' },
  { email: 'maria@opecaurum.org', role: 'MEMBER', name: 'Maria Santos', employeeId: 'EMP002' },
  { email: 'liza@opecaurum.org', role: 'MEMBER', name: 'Liza Aquino', employeeId: 'EMP008' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const value = useMemo(() => ({
    user,
    isAdmin: !!user && user.role !== 'MEMBER' && user.role !== 'VIEWER',
    login(email) {
      const rec = DIRECTORY.find((d) => d.email.toLowerCase() === String(email).toLowerCase());
      if (!rec) return { ok: false, error: 'Account not found. Try one of the demo accounts below.' };
      const employee = rec.employeeId ? findEmployee(rec.employeeId) : undefined;
      setUser({ ...rec, employee });
      return { ok: true, user: rec };
    },
    logout() { setUser(null); },
    directory: DIRECTORY,
  }), [user]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
