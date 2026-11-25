import React, { createContext, useContext, useMemo, useState } from 'react';
import { DB, findEmployee } from '../../data/mockDb';

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
  { email: 'secretary@opecaurum.org', role: 'OPEC_SECRETARY', name: 'Ms. Sofia Secretary' },
  { email: 'treasurer@opecaurum.org', role: 'OPEC_TREASURER', name: 'Ms. Vilma Ocampo' },
  { email: 'auditor@opecaurum.org', role: 'OPEC_AUDITOR', name: 'Atty. Cesar Dizon' },
  { email: 'regional@opecaurum.org', role: 'REGIONAL_MANAGER', name: 'Ms. Elena Regional' },
  { email: 'area@opecaurum.org', role: 'AREA_MANAGER', name: 'Mr. Victor Area' },
  { email: 'regional.audit@opecaurum.org', role: 'REGIONAL_AUDIT_MANAGER', name: 'Mr. Rafael Audit' },
  { email: 'juan@opecaurum.org', role: 'MEMBER', name: 'Juan Dela Cruz', employeeId: 'EMP001' },
  { email: 'maria@opecaurum.org', role: 'MEMBER', name: 'Maria Santos', employeeId: 'EMP002' },
  { email: 'liza@opecaurum.org', role: 'MEMBER', name: 'Liza Aquino', employeeId: 'EMP008' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profileOverrides, setProfileOverrides] = useState({});

  const value = useMemo(() => ({
    user,
    isAdmin: !!user && user.role !== 'MEMBER' && user.role !== 'VIEWER',
    login(email) {
      const rec = DIRECTORY.find((d) => d.email.toLowerCase() === String(email).toLowerCase());
      if (!rec) return { ok: false, error: 'Account not found. Try one of the demo accounts below.' };
      const account = { ...rec, ...(profileOverrides[rec.email] || {}), originalEmail: rec.email };
      const employee = account.employeeId ? findEmployee(account.employeeId) : undefined;
      setUser({ ...account, employee });
      return { ok: true, user: account };
    },
    updateProfile(profile) {
      if (!user) return null;
      const emailKey = user.originalEmail || user.email;
      const updated = { name: profile.name.trim(), email: profile.email.trim() };
      setProfileOverrides((current) => ({ ...current, [emailKey]: { ...current[emailKey], ...updated } }));
      setUser((current) => current ? { ...current, ...updated } : current);
      return updated;
    },
    logout() { setUser(null); },
    directory: DIRECTORY,
  }), [user, profileOverrides]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
