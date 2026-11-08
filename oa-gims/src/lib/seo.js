import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TITLES = {
  '/': ['OA-GIMS — OPEC Aurum Gems Integrated Management System', 'Empowering Members • Managing Loans • Building Communities. The centralized platform for member management, loan origination, payroll deductions and CSR projects.'],
  '/login': ['Sign in — OA-GIMS', 'Access your OPEC Aurum Gems member and administration portal.'],
  '/dashboard': ['Dashboard — OA-GIMS', 'Live overview of members, active loans, pending approvals and community projects.'],
  '/loans/apply': ['Apply for a Loan — OA-GIMS', 'Check eligibility, add co-makers, upload documents and submit your loan application.'],
  '/loans/applications': ['My Applications — OA-GIMS', 'Track every loan application through review, credit committee and release.'],
  '/loans/active': ['Active Loans — OA-GIMS', 'Amortization schedules, balances and payment history for your loans.'],
  '/approvals': ['Credit Committee — OA-GIMS', 'Review, approve or reject loan applications awaiting your signature.'],
  '/releases': ['Loan Releases — OA-GIMS', 'Disburse approved loans and generate official release receipts.'],
  '/payroll': ['Payroll Deductions — OA-GIMS', 'Generate, review and post salary deductions with partial-payment handling.'],
  '/members': ['Members & Employees — OA-GIMS', 'Organization directory: regions, areas, branches and memberships.'],
  '/products': ['Loan Products — OA-GIMS', 'Configurable loan policies: limits, terms, interest methods and co-maker rules.'],
  '/projects': ['Community / CSR — OA-GIMS', 'Projects, events, beneficiaries, donations and expenses.'],
  '/reports': ['Reports — OA-GIMS', 'Management, operational and payroll reporting for OPEC Aurum Gems.'],
  '/audit': ['Audit Logs — OA-GIMS', 'Immutable trail of every important action in the system.'],
};

export default function Seo({ titleKey }) {
  const { pathname } = useLocation();
  useEffect(() => {
    const [title, description] = TITLES[titleKey ?? pathname] ?? TITLES['/'];
    document.title = title;
    let meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }, [pathname, titleKey]);
  return null;
}
