// OA-GIMS — Loan calculation architecture (spec §45).
// Pure functions shared by UI, API and reports. Never place financial math in components.

export const php = (n) =>
  '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

/** Complete years of service from date hired (spec §8 — calculated, never manual). */
export function yearsOfService(dateHired, asOf = new Date()) {
  const h = new Date(dateHired);
  let years = asOf.getFullYear() - h.getFullYear();
  const m = asOf.getMonth() - h.getMonth();
  if (m < 0 || (m === 0 && asOf.getDate() < h.getDate())) years -= 1;
  return Math.max(0, years);
}

/**
 * Eligibility engine (spec §10): date hired → years of service → status → rules.
 * `rules` is the configured LoanEligibilityRule ladder [{minYearsService, maxAmount, maxTermMonths, requiredCoMakers}].
 */
export function calculateLoanEligibility({ employee, product, rules = [], existingOutstandingBalance = 0 }) {
  const yrs = yearsOfService(employee.dateHired);
  const permanent = employee.employmentStatus === 'PERMANENT';
  const tier = [...rules]
    .filter((r) => yrs >= r.minYearsService)
    .sort((a, b) => b.minYearsService - a.minYearsService)[0];

  const maxAmount = tier ? tier.maxAmount : product?.maxAmount ?? 0;
  const maxTermMonths = tier ? tier.maxTermMonths : product?.maxTermMonths ?? 0;
  const requiredCoMakers = tier ? tier.requiredCoMakers : product?.requiredCoMakers ?? 0;

  const reasons = [];
  if (!permanent) reasons.push('Employment must be PERMANENT');
  if (product && yrs < (product.minYearsService ?? 0))
    reasons.push(`Requires ${product.minYearsService}+ years of service (has ${yrs})`);
  if (existingOutstandingBalance > 0) reasons.push('Outstanding loan balance exists — verify policy on simultaneous loans');

  return {
    eligible: permanent && (!product || yrs >= (product.minYearsService ?? 0)),
    yearsOfService: yrs,
    maximumAmount: maxAmount,
    maximumTermMonths: maxTermMonths,
    requiredCoMakers,
    existingOutstandingBalance,
    reasons,
  };
}

/** Co-maker validation chain (spec §13). */
export function validateCoMaker({ coMaker, applicantId, seenIds, minYears = 5 }) {
  if (!coMaker) return { ok: false, reason: 'Employee not found' };
  if (coMaker.id === applicantId) return { ok: false, reason: 'Applicant cannot be their own co-maker' };
  if (seenIds.includes(coMaker.id)) return { ok: false, reason: 'Duplicate co-maker' };
  if (coMaker.employmentStatus !== 'PERMANENT') return { ok: false, reason: `${coMaker.firstName} ${coMaker.lastName} is not permanent` };
  if (yearsOfService(coMaker.dateHired) < minYears)
    return { ok: false, reason: `${coMaker.firstName} ${coMaker.lastName} has under ${minYears} years of service` };
  return { ok: true };
}

/**
 * Interest calculation (spec §17/§53). Method is configurable per product.
 * NOTE: exact OPEC formula pending policy confirmation — CUSTOM_OPEC_FORMULA currently
 * applies flat-rate on original principal × months (1.5% × P × n), matching the May 2025 form reading.
 */
export function calculateInterest(principal, ratePct, termMonths, method = 'CUSTOM_OPEC_FORMULA') {
  const r = Number(ratePct) / 100;
  if (method === 'REDUCING_BALANCE') {
    // amortizing payment
    const i = r;
    if (i === 0) return round2(principal / termMonths) * termMonths - principal;
    const pmt = (principal * i) / (1 - Math.pow(1 + i, -termMonths));
    return round2(pmt * termMonths - principal);
  }
  // FLAT_RATE and CUSTOM_OPEC_FORMULA
  return round2(principal * r * termMonths);
}

export function calculateTotalPayable({ principal, interest, fees = 0 }) {
  return round2(Number(principal) + Number(interest) + Number(fees));
}

/** Payday-aware due dates: installments fall on the 15th and 30th (spec §53 Q2 — configurable cadence). */
export function paydayDueDates(startDate, count, paydays = [15, 30]) {
  const dates = [];
  let d = new Date(startDate);
  d.setDate(d.getDate() + 1);
  while (dates.length < count) {
    for (const pd of paydays) {
      const cand = new Date(d.getFullYear(), d.getMonth(), pd);
      if (cand >= new Date(d.getFullYear(), d.getMonth(), 1) && cand > new Date(startDate) && dates.length < count) {
        if (!dates.some((x) => x.getTime() === cand.getTime())) dates.push(cand);
      }
    }
    d.setMonth(d.getMonth() + 1);
    d.setDate(1);
  }
  return dates.sort((a, b) => a - b).slice(0, count);
}

/** Amortization schedule generator (spec §17). */
export function generateAmortization({ principal, annualRatePct, termMonths, method = 'CUSTOM_OPEC_FORMULA', fees = 0, startDate = new Date(), paydays = [15, 30] }) {
  const P = Number(principal);
  const schedule = [];
  let balance = P;
  const monthlyInterest = calculateInterest(P, annualRatePct, 1, method === 'REDUCING_BALANCE' ? method : 'FLAT_RATE');
  const principalPerPeriod = round2(P / termMonths);
  const dueDates = paydayDueDates(startDate, termMonths, paydays);

  for (let k = 1; k <= termMonths; k += 1) {
    const last = k === termMonths;
    const prin = last ? round2(balance) : principalPerPeriod;
    const intst = last ? round2(monthlyInterest * termMonths - monthlyInterest * (termMonths - 1)) : round2(monthlyInterest);
    const feeK = k === 1 ? round2(fees) : 0;
    balance = round2(balance - prin);
    schedule.push({
      installmentNo: k,
      dueDate: dueDates[k - 1],
      principal: prin,
      interest: intst,
      fees: feeK,
      amount: round2(prin + intst + feeK),
      balanceAfter: Math.max(balance, 0),
      status: 'SCHEDULED',
    });
  }
  return schedule;
}

export function calculateRemainingBalance(schedule = []) {
  const unpaid = schedule.filter((s) => s.status !== 'POSTED' && s.status !== 'WAIVED');
  return round2(unpaid.reduce((acc, s) => acc + Number(s.amount), 0));
}

/** Payroll deduction (spec §18–§19): records PARTIAL rather than falsely marking paid. */
export function calculatePayrollDeduction({ scheduledAmount, deductedAmount }) {
  const sched = round2(scheduledAmount);
  const actual = round2(deductedAmount);
  const difference = round2(sched - actual);
  let status = 'POSTED';
  if (actual <= 0) status = 'MISSED';
  else if (difference > 0.009) status = 'PARTIAL';
  return { payrollPeriod: null, scheduledAmount: sched, deductedAmount: actual, difference, status };
}

/** Application validation checklist (spec §12). */
export function validateApplication({ eligibility, product, requestedAmount, termMonths, coMakers, documents, declarations }) {
  const checks = [];
  const push = (label, pass) => checks.push({ label, pass });
  push('Employee is eligible', eligibility.eligible);
  push('Loan amount within limit', requestedAmount > 0 && requestedAmount <= (eligibility.maximumAmount || product?.maxAmount || Infinity));
  push('Term within limit', termMonths >= 1 && termMonths <= (eligibility.maximumTermMonths || product?.maxTermMonths || Infinity));
  push('Required co-makers complete', coMakers.length >= (eligibility.requiredCoMakers ?? product?.requiredCoMakers ?? 0));
  push('Payslip attached', documents.some((d) => d.type === 'payslip'));
  push('Required declarations accepted', declarations.authorizeDeduction && declarations.agreeTerms && declarations.infoCorrect);
  return { valid: checks.every((c) => c.pass), checks };
}
