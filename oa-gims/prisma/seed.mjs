// OA-GIMS seed data — mirrors the May 2025 OPEC loan form as configurable policy.
// Run: node prisma/seed.mjs  (requires DATABASE_URL pointing to PostgreSQL)
import { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

const p = new PrismaClient();
const hash = (pw) => 'sha256$' + crypto.createHash('sha256').update(pw).digest('hex');

async function main() {
  // Organization: Region → Area → Branch
  const region = await p.region.upsert({ where: { code: 'MSLU' }, update: {}, create: { code: 'MSLU', name: 'Misamis Occidental / Lunzaga–Siocon' } });
  const area = await p.area.upsert({ where: { code: 'OZM' }, update: {}, create: { code: 'OZM', name: 'Ozamiz City', regionId: region.id } });
  const br1 = await p.branch.upsert({ where: { code: 'ML-OZM-1' }, update: {}, create: { code: 'ML-OZM-1', name: 'ML Ozamiz 1', areaId: area.id } });
  const br2 = await p.branch.upsert({ where: { code: 'ML-KP-1' }, update: {}, create: { code: 'ML-KP-1', name: 'ML Kwarta Padala', areaId: area.id } });

  // Loan products (from May 2025 form)
  const products = [
    { code: 'COMMODITY', name: 'Commodity Loan', maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, processingFee: 50, requiredCoMakers: 4, minYearsService: 5 },
    { code: 'CASH', name: 'Cash Loan', maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, processingFee: 50, requiredCoMakers: 4, minYearsService: 5 },
    { code: 'EDUCATIONAL', name: 'Educational Loan', maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, processingFee: 50, requiredCoMakers: 4, minYearsService: 5 },
    { code: 'MEDICAL', name: 'Medical Loan', maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, processingFee: 50, requiredCoMakers: 4, minYearsService: 5 },
    { code: 'PETTY_CASH', name: 'Petty Cash Loan', maxAmount: 10000, maxTermMonths: 12, interestRate: 1.5, processingFee: 30, requiredCoMakers: 2, minYearsService: 1 },
    { code: 'EMERGENCY', name: 'Emergency Loan', maxAmount: 6000, maxTermMonths: 5, interestRate: 0, processingFee: 0, requiredCoMakers: 0, minYearsService: 0 },
  ];
  for (const pr of products) {
    await p.loanProduct.upsert({ where: { code: pr.code }, update: pr, create: { ...pr, minAmount: 1000, interestMethod: 'CUSTOM_OPEC_FORMULA' } });
  }

  // Eligibility ladder for general loans (years of service → limits)
  const commodity = await p.loanProduct.findUnique({ where: { code: 'COMMODITY' } });
  const ladder = [
    { minYearsService: 0, maxAmount: 0, maxTermMonths: 0, requiredCoMakers: 0 },
    { minYearsService: 1, maxAmount: 10000, maxTermMonths: 10, requiredCoMakers: 2 },
    { minYearsService: 3, maxAmount: 20000, maxTermMonths: 18, requiredCoMakers: 3 },
    { minYearsService: 5, maxAmount: 30000, maxTermMonths: 24, requiredCoMakers: 4 },
  ];
  for (const r of ladder) await p.loanEligibilityRule.create({ data: { ...r, productId: commodity.id } });

  // Employees + users
  const emps = [
    { employeeNumber: 'ML-0001', firstName: 'Juan', lastName: 'Dela Cruz', dateHired: '2020-05-15', employmentStatus: 'PERMANENT', branchId: br1.id, email: 'juan@opecaurum.org' },
    { employeeNumber: 'ML-0002', firstName: 'Maria', lastName: 'Santos', dateHired: '2019-02-01', employmentStatus: 'PERMANENT', branchId: br1.id, email: 'maria@opecaurum.org' },
    { employeeNumber: 'ML-0003', firstName: 'Pedro', lastName: 'Cruz', dateHired: '2021-07-10', employmentStatus: 'PERMANENT', branchId: br2.id, email: 'pedro@opecaurum.org' },
    { employeeNumber: 'ML-0004', firstName: 'Ana', lastName: 'Reyes', dateHired: '2018-11-20', employmentStatus: 'PERMANENT', branchId: br1.id, email: 'ana@opecaurum.org' },
    { employeeNumber: 'ML-0005', firstName: 'Carlo', lastName: 'Lim', dateHired: '2023-03-05', employmentStatus: 'PROBATIONARY', branchId: br2.id, email: 'carlo@opecaurum.org' },
  ];
  for (const e of emps) {
    const emp = await p.employee.upsert({ where: { employeeNumber: e.employeeNumber }, update: {}, create: { ...e, dateHired: new Date(e.dateHired) } });
    await p.user.upsert({ where: { email: e.email }, update: {}, create: { email: e.email, passwordHash: hash('oa-gims-demo'), role: 'MEMBER', employeeId: emp.id } });
  }
  // Committee accounts
  const committee = [
    { email: 'president@opecaurum.org', role: 'OPEC_PRESIDENT' },
    { email: 'treasurer@opecaurum.org', role: 'TREASURER' },
    { email: 'auditor@opecaurum.org', role: 'AUDITOR' },
    { email: 'payroll@opecaurum.org', role: 'PAYROLL_MASTER' },
    { email: 'adviser@opecaurum.org', role: 'OPEC_ADVISER' },
    { email: 'loan.officer@opecaurum.org', role: 'LOAN_OFFICER' },
    { email: 'admin@opecaurum.org', role: 'SUPER_ADMIN' },
  ];
  for (const c of committee) await p.user.upsert({ where: { email: c.email }, update: {}, create: { email: c.email, passwordHash: hash('oa-gims-demo'), role: c.role } });

  console.log('Seeded organization, loan products, eligibility rules, employees and users.');
}

main().finally(() => p.$disconnect());
