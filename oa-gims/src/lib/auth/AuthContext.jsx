import React, { createContext, useContext, useMemo, useState } from 'react';
import { authClient } from '../auth-client';
import { loadCoreData } from '../actions/core';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children, initialData }) {
  const [coreData, setCoreData] = useState(initialData || { employees: [], products: [], applications: [] });
  const { data: session, isPending } = authClient.useSession();
  const sessionUser = session?.user;
  const user = sessionUser ? {
    ...sessionUser,
    role: sessionUser.role || 'MEMBER',
    employeeId: sessionUser.employeeId || null,
    employee: sessionUser.employeeId ? coreData.employees.find((employee) => employee.id === sessionUser.employeeId) : undefined,
  } : null;

  const value = useMemo(() => ({
    user,
    isPending,
    coreData,
    setCoreData,
    isAdmin: Boolean(user && user.role !== 'MEMBER' && user.role !== 'VIEWER'),
    async login(email, password) {
      const result = await authClient.signIn.email({ email, password });
      if (result.error) return { ok: false, error: 'Unable to sign in with those credentials.' };
      setCoreData(await loadCoreData());
      return { ok: true, user: result.data?.user };
    },
    async register(name, email, password) {
      const result = await authClient.signUp.email({ name, email, password });
      if (result.error) return { ok: false, error: 'Unable to create the account. Check the details and try again.' };
      setCoreData(await loadCoreData());
      return { ok: true, user: result.data?.user };
    },
    async updateProfile(profile) {
      if (!user) return { ok: false, error: 'Your session has expired. Sign in again.' };
      if (profile.email.trim().toLowerCase() !== user.email.toLowerCase()) {
        return { ok: false, error: 'Email changes require a verified account update and are not available here yet.' };
      }
      const result = await authClient.updateUser({ name: profile.name.trim() });
      if (result.error) return { ok: false, error: 'Unable to update your profile right now.' };
      return { ok: true, name: result.data?.user?.name || profile.name.trim(), email: user.email };
    },
    async logout() {
      await authClient.signOut();
      setCoreData({ employees: [], products: [], applications: [] });
    },
    directory: coreData.employees,
  }), [user, isPending, coreData]);

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
