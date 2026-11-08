// OA-GIMS — In-memory data layer. Mirrors the Prisma models; in production these
// functions call the /api/* routes backed by PostgreSQL via Prisma (see prisma/schema.prisma).
import { generateAmortization, round2, php } from '../lib/loans/calculator';

export const LOAN_PRODUCTS = [
  { id: 'P1', code: 'COMMODITY', name: 'Commodity Loan', minAmount: 1000, maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, interestMethod: 'CUSTOM_OPEC_FORMULA', processingFee: 50, requiredCoMakers: 4, minYearsService: 5, active: true, icon: '🛒', description: 'Purchase of goods on installment, deducted from salary every payday.' },
  { id: 'P2', code: 'CASH', name: 'Cash Loan', minAmount: 1000, maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, interestMethod: 'CUSTOM_OPEC_FORMULA', processingFee: 50, requiredCoMakers: 4, minYearsService: 5, active: true, icon: '💵', description: 'Straight cash assistance with salary-deduct amortization.' },
  { id: 'P3', code: 'EDUCATIONAL', name: 'Educational Loan', minAmount: 1000, maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, interestMethod: 'CUSTOM_OPEC_FORMULA', processingFee: 50, requiredCoMakers: 4, minYearsService: 5, active: true, icon: '🎓', description: 'Tuition and school expenses support for members and dependents.' },
  { id: 'P4', code: 'MEDICAL', name: 'Medical Loan', minAmount: 1000, maxAmount: 30000, maxTermMonths: 24, interestRate: 1.5, interestMethod: 'CUSTOM_OPEC_FORMULA', processingFee: 50, requiredCoMakers: 4, minYearsService: 5, active: true, icon: '🩺', description: 'Hospital and medical emergency financing.' },
  { id: 'P5', code: 'PETTY_CASH', name: 'Petty Cash Loan', minAmount: 1000, maxAmount: 10000, maxTermMonths: 12, interestRate: 1.5, interestMethod: 'CUSTOM_OPEC_FORMULA', processingFee: 30, requiredCoMakers: 2, minYearsService: 1, active: true, icon: '🪙', description: 'Short-term small amount loan — reduced co-maker requirement.' },
  { id: 'P6', code: 'EMERGENCY', name: 'Emergency Loan', minAmount: 1000, maxAmount: 6000, maxTermMonths: 5, interestRate: 0, interestMethod: 'FLAT_RATE', processingFee: 0, requiredCoMakers: 0, minYearsService: 0, active: true, icon: '🚨', description: 'Zero-interest aid for calamities and urgent needs, 5-month term.' },
];

export const ELIGIBILITY_RULES = [
  { productId: 'P1', minYearsService: 1, maxAmount: 10000, maxTermMonths: 10, requiredCoMakers: 2 },
  { productId: 'P1', minYearsService: 3, maxAmount: 20000, maxTermMonths: 18, requiredCoMakers: 3 },
  { productId: 'P1', minYearsService: 5, maxAmount: 30000, maxTermMonths: 24, requiredCoMakers: 4 },
  ...['P2', 'P3', 'P4'].flatMap((pid) => [
    { productId: pid, minYearsService: 1, maxAmount: 10000, maxTermMonths: 10, requiredCoMakers: 2 },
    { productId: pid, minYearsService: 3, maxAmount: 20000, maxTermMonths: 18, requiredCoMakers: 3 },
    { productId: pid, minYearsService: 5, maxAmount: 30000, maxTermMonths: 24, requiredCoMakers: 4 },
  ]),
];

export const REGIONS = [{ id: 'R1', name: 'Misamis Occidental / Lunzaga–Siocon', code: 'MSLU' }];
export const AREAS = [{ id: 'A1', name: 'Ozamiz City', code: 'OZM', regionId: 'R1' }, { id: 'A2', name: 'Manila Metro', code: 'MNL', regionId: 'R1' }];
export const BRANCHES = [
  { id: 'B1', name: 'ML Ozamiz 1', code: 'ML-OZM-1', areaId: 'A1' },
  { id: 'B2', name: 'ML Kwarta Padala', code: 'ML-KP-1', areaId: 'A1' },
  { id: 'B3', name: 'BPI Makati Ops', code: 'BPI-MKT', areaId: 'A2' },
];

export const EMPLOYEES = [
  { id: 'EMP001', employeeNumber: 'ML-0001', firstName: 'Juan', middleName: 'M.', lastName: 'Dela Cruz', dateHired: '2020-05-15', employmentStatus: 'PERMANENT', branchId: 'B1', position: 'Machine Operator', email: 'juan@opecaurum.org', phone: '0917-000-0001' },
  { id: 'EMP002', employeeNumber: 'ML-0002', firstName: 'Maria', middleName: 'L.', lastName: 'Santos', dateHired: '2019-02-01', employmentStatus: 'PERMANENT', branchId: 'B1', position: 'QA Supervisor', email: 'maria@opecaurum.org', phone: '0917-000-0002' },
  { id: 'EMP003', employeeNumber: 'ML-0003', firstName: 'Pedro', middleName: 'R.', lastName: 'Cruz', dateHired: '2018-07-10', employmentStatus: 'PERMANENT', branchId: 'B2', position: 'Warehouse Lead', email: 'pedro@opecaurum.org', phone: '0917-000-0003' },
  { id: 'EMP004', employeeNumber: 'ML-0004', firstName: 'Ana', middleName: 'V.', lastName: 'Reyes', dateHired: '2017-11-20', employmentStatus: 'PERMANENT', branchId: 'B1', position: 'Accounting Aide', email: 'ana@opecaurum.org', phone: '0917-000-0004' },
  { id: 'EMP005', employeeNumber: 'ML-0005', firstName: 'Carlo', middleName: 'J.', lastName: 'Lim', dateHired: '2016-01-04', employmentStatus: 'PERMANENT', branchId: 'B3', position: 'IT Support', email: 'carlo@opecaurum.org', phone: '0917-000-0005' },
  { id: 'EMP006', employeeNumber: 'ML-0006', firstName: 'Grace', middleName: 'P.', lastName: 'Tan', dateHired: '2023-03-05', employmentStatus: 'PROBATIONARY', branchId: 'B1', position: 'Line Worker', email: 'grace@opecaurum.org', phone: '0917-000-0006' },
  { id: 'EMP007', employeeNumber: 'ML-0007', firstName: 'Ramon', middleName: 'S.', lastName: 'Garcia', dateHired: '2015-06-01', employmentStatus: 'PERMANENT', branchId: 'B2', position: 'Maintenance Tech', email: 'ramon@opecaurum.org', phone: '0917-000-0007' },
  { id: 'EMP008', employeeNumber: 'ML-0008', firstName: 'Liza', middleName: 'T.', lastName: 'Aquino', dateHired: '2021-09-13', employmentStatus: 'PERMANENT', branchId: 'B3', position: 'HR Assistant', email: 'liza@opecaurum.org', phone: '0917-000-0008' },
];

const seedApps = [
  { id: 'APP31', applicationNo: 'OPEC-2026-00031', employeeId: 'EMP001', loanProductId: 'P1', purpose: 'Commodity purchase', requestedAmount: 20000, termMonths: 18, status: 'FOR_APPROVAL', releaseMethod: 'BANK_CHECK', submittedAt: '2026-10-01', coMakers: ['EMP002', 'EMP003', 'EMP004', 'EMP005'] },
  { id: 'APP30', applicationNo: 'OPEC-2026-00030', employeeId: 'EMP008', loanProductId: 'P4', purpose: 'Hospital bill', requestedAmount: 15000, termMonths: 12, status: 'SUBMITTED', releaseMethod: 'KWARTA_PADALA', submittedAt: '2026-10-03', coMakers: ['EMP002', 'EMP007', 'EMP005'] },
  { id: 'APP29', applicationNo: 'OPEC-2026-00029', employeeId: 'EMP006', loanProductId: 'P1', purpose: 'Appliances', requestedAmount: 12000, termMonths: 12, status: 'REJECTED', releaseMethod: 'BANK_CHECK', submittedAt: '2026-09-25', rejectionReason: 'Applicant is probationary — not permanent.', coMakers: [] },
  { id: 'APP28', applicationNo: 'OPEC-2026-00028', employeeId: 'EMP003', loanProductId: 'P3', purpose: 'Semester tuition', requestedAmount: 25000, termMonths: 20, status: 'APPROVED', releaseMethod: 'BPI_ATM_DEPOSIT', submittedAt: '2026-09-15', approvedAt: '2026-09-28', coMakers: ['EMP002', 'EMP004', 'EMP005', 'EMP007'] },
];

const seedAccounts = [
  { id: 'LN91', loanNumber: 'LOAN-2026-00091', applicationId: 'APP25', employeeId: 'EMP002', productId: 'P2', principal: 30000, rate: 1.5, term: 24, releasedOn: '2026-01-15', paidInstallments: 9, status: 'ACTIVE' },
  { id: 'LN88', loanNumber: 'LOAN-2026-00088', applicationId: 'APP22', employeeId: 'EMP004', productId: 'P1', principal: 18000, rate: 1.5, term: 12, releasedOn: '2025-11-01', paidInstallments: 12, status: 'FULLY_PAID' },
  { id: 'LN95', loanNumber: 'LOAN-2026-00095', applicationId: 'APP27', employeeId: 'EMP007', productId: 'P5', principal: 8000, rate: 1.5, term: 8, releasedOn: '2026-06-01', paidInstallments: 3, status: 'PARTIALLY_PAID' },
];

export const DB = {
  employees: EMPLOYEES,
  products: LOAN_PRODUCTS,
  applications: seedApps.map((a) => ({
    ...a,
    approvals: a.status === 'FOR_APPROVAL' || a.status === 'APPROVED' ? [
      { role: 'OPEC_PRESIDENT', decision: 'APPROVED' },
      { role: 'TREASURER', decision: a.status === 'APPROVED' ? 'APPROVED' : 'PENDING' },
      { role: 'AUDITOR', decision: 'PENDING' },
      { role: 'PAYROLL_MASTER', decision: 'PENDING' },
      { role: 'OPEC_ADVISER', decision: 'PENDING' },
    ] : [],
    documents: [{ type: 'payslip', fileName: 'payslip-sep2026.pdf' }, { type: 'application', fileName: 'application-form.pdf' }],
  })),
  accounts: seedAccounts.map((a) => {
    const product = LOAN_PRODUCTS.find((p) => p.id === a.productId);
    const schedule = generateAmortization({ principal: a.principal, annualRatePct: a.rate, termMonths: a.term, method: product.interestMethod, fees: product.processingFee, startDate: new Date(a.releasedOn) });
    schedule.forEach((s, i) => { s.status = i < a.paidInstallments ? 'POSTED' : 'SCHEDULED'; });
    const balance = round2(schedule.filter((s) => s.status !== 'POSTED').reduce((x, s) => x + s.amount, 0));
    return {
      ...a,
      applicant: a.employeeId,
      totalPayable: round2(schedule.reduce((x, s) => x + s.amount, 0)),
      amountReleased: round2(a.principal - product.processingFee),
      balance,
      schedule,
      maturityDate: schedule[schedule.length - 1].dueDate,
      deductions: schedule.slice(0, a.paidInstallments).map((s, i) => ({
        payrollPeriod: `${s.dueDate.getFullYear()}-${String(s.dueDate.getMonth() + 1).padStart(2, '0')}-${i % 2 ? 'B' : 'A'}`,
        scheduledAmount: s.amount, deductedAmount: i === 2 && a.status === 'PARTIALLY_PAID' ? round2(s.amount * 0.7) : s.amount,
        difference: i === 2 && a.status === 'PARTIALLY_PAID' ? round2(s.amount * 0.3) : 0,
        status: i === 2 && a.status === 'PARTIALLY_PAID' ? 'PARTIAL' : 'POSTED', postedAt: s.dueDate,
      })),
    };
  }),
  projects: [
    { id: 'PR1', projectNumber: 'CSR-2026-001', name: 'Aurum Relief — Typhoon Aid', category: 'Disaster Response', location: 'Barangay Poblacion, Ozamiz', status: 'ONGOING', budget: 150000, spent: 84200, leader: 'Maria Santos', startDate: '2026-08-01', endDate: '2026-12-15', beneficiaries: 320, volunteers: 24, icon: '🌊' },
    { id: 'PR2', projectNumber: 'CSR-2026-002', name: 'Gems of Knowledge — School Supplies Drive', category: 'Education', location: 'Ozamiz National HS', status: 'APPROVED', budget: 60000, spent: 12000, leader: 'Ramon Garcia', startDate: '2026-11-01', endDate: '2027-01-30', beneficiaries: 450, volunteers: 15, icon: '📚' },
    { id: 'PR3', projectNumber: 'CSR-2026-003', name: 'Golden Harvest Community Garden', category: 'Livelihood', location: 'ML Ozamiz 1 Grounds', status: 'COMPLETED', budget: 40000, spent: 38500, leader: 'Ana Reyes', startDate: '2026-03-01', endDate: '2026-07-30', beneficiaries: 120, volunteers: 30, icon: '🌱' },
  ],
  events: [
    { id: 'EV1', projectId: 'PR1', name: 'Relief Goods Packing Day', date: '2026-11-08', location: 'Ozamiz Gymnasium', coordinator: 'Maria Santos', expected: 80, actual: 0 },
    { id: 'EV2', projectId: 'PR2', name: 'Supply Donation Turnover', date: '2026-11-21', location: 'ONHS Covered Court', coordinator: 'Ramon Garcia', expected: 60, actual: 0 },
    { id: 'EV3', projectId: 'PR3', name: 'Garden Harvest Fest', date: '2026-07-25', location: 'ML Ozamiz 1', coordinator: 'Ana Reyes', expected: 100, actual: 112 },
  ],
  donations: [
    { id: 'DN1', donationNo: 'DON-2026-014', projectId: 'PR1', donor: 'Local NGO — Hubag Misamis', type: 'FOOD', quantity: '120 family packs', value: 36000, date: '2026-10-12' },
    { id: 'DN2', donationNo: 'DON-2026-015', projectId: 'PR1', donor: 'Anonymous Member', type: 'CASH', quantity: null, value: 10000, date: '2026-10-20' },
    { id: 'DN3', donationNo: 'DON-2026-016', projectId: 'PR2', donor: 'Book Haven PH', type: 'SUPPLIES', quantity: '450 notebooks + sets', value: 22500, date: '2026-10-28' },
  ],
  auditLog: [
    { at: '2026-11-02 08:12', user: 'loan.officer@opecaurum.org', action: 'SUBMIT_LOAN', entity: 'OPEC-2026-00030', detail: 'FOR_REVIEW → forwarded to committee' },
    { at: '2026-11-01 16:47', user: 'president@opecaurum.org', action: 'APPROVE_LOAN', entity: 'OPEC-2026-00031', detail: 'Status FOR_APPROVAL, President sign-off recorded' },
    { at: '2026-10-30 10:05', user: 'payroll@opecaurum.org', action: 'IMPORT_PAYROLL', entity: '2026-10-B', detail: '42 deductions matched, 1 partial flagged' },
    { at: '2026-10-28 13:22', user: 'treasurer@opecaurum.org', action: 'RELEASE_LOAN', entity: 'LOAN-2026-00095', detail: 'Net ₱7,970.00 via bank check CHK-2026-00098' },
  ],
};

let appSeq = 32;
export function nextApplicationNo() { return `OPEC-2026-${String(appSeq++).padStart(5, '0')}`; }
export function findEmployee(id) { return DB.employees.find((e) => e.id === id); }
export function empName(e) { return e ? `${e.firstName} ${e.middleName ? e.middleName + ' ' : ''}${e.lastName}` : '—'; }
export function branchName(id) { return BRANCHES.find((b) => b.id === id)?.name ?? '—'; }
