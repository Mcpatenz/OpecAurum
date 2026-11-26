'use server'

import { and, desc, eq, inArray, lte } from 'drizzle-orm'
import { headers } from 'next/headers'
import { auth } from '../auth'
import { db } from '../db'
import { auditLogs, branches, employees, loanApplicationCoMakers, loanApplications, loanApprovals, loanEligibilityRules, loanProducts, positions, user as users } from '../db/schema'

const MEMBER_MANAGER_ROLES = ['SUPER_ADMIN', 'OPEC_SECRETARY']
const REVIEWER_ROLES = ['SUPER_ADMIN', 'OPEC_PRESIDENT', 'OPEC_SECRETARY', 'OPEC_TREASURER', 'OPEC_AUDITOR', 'REGIONAL_MANAGER', 'AREA_MANAGER', 'REGIONAL_AUDIT_MANAGER']
const COMMITTEE_ROLES = ['OPEC_PRESIDENT', 'OPEC_SECRETARY', 'OPEC_TREASURER', 'OPEC_AUDITOR']

async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Your session has expired. Sign in again.')
  return session.user
}

function requireMemberManager(role: string) {
  if (!MEMBER_MANAGER_ROLES.includes(role)) throw new Error('You do not have permission to manage members.')
}

function text(value: unknown, label: string, maxLength = 160) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > maxLength) {
    throw new Error(`${label} is required and must be ${maxLength} characters or fewer.`)
  }
  return value.trim()
}

function auditId() { return crypto.randomUUID() }

export async function loadCoreData() {
  const sessionUser = await requireUser()
  const isMember = sessionUser.role === 'MEMBER'
  const employeeRows = isMember && sessionUser.employeeId
    ? await db.select({ employee: employees, position: positions.title, accountRole: users.role }).from(employees).leftJoin(positions, eq(employees.positionId, positions.id)).leftJoin(users, eq(users.employeeId, employees.id)).where(eq(employees.id, sessionUser.employeeId))
    : isMember ? [] : await db.select({ employee: employees, position: positions.title, accountRole: users.role }).from(employees).leftJoin(positions, eq(employees.positionId, positions.id)).leftJoin(users, eq(users.employeeId, employees.id)).orderBy(desc(employees.createdAt))
  const coMakers = isMember
    ? await db.select({ id: employees.id, employeeNumber: employees.employeeNumber, firstName: employees.firstName, lastName: employees.lastName }).from(employees).where(eq(employees.employmentStatus, 'PERMANENT')).orderBy(employees.lastName)
    : []
  const productRows = await db.select().from(loanProducts).where(eq(loanProducts.active, true)).orderBy(loanProducts.name)
  const applicationRows = isMember && sessionUser.employeeId
    ? await db.select().from(loanApplications).where(eq(loanApplications.employeeId, sessionUser.employeeId)).orderBy(desc(loanApplications.createdAt))
    : isMember ? [] : await db.select().from(loanApplications).orderBy(desc(loanApplications.createdAt))
  return { employees: employeeRows.map(({ employee, position, accountRole }) => ({ ...employee, position: position ?? 'Unassigned', branchAssignment: employee.branchId ?? '', accountRole: accountRole ?? 'MEMBER' })), coMakers, products: productRows, applications: applicationRows }
}

export async function saveMember(input: Record<string, unknown>, employeeId?: string) {
  const actor = await requireUser()
  requireMemberManager(actor.role)

  const employeeNumber = text(input.employeeNumber, 'Employee number', 40)
  const firstName = text(input.firstName, 'First name', 80)
  const lastName = text(input.lastName, 'Last name', 80)
  const dateHired = text(input.dateHired, 'Hire date', 10)
  const birthDate = text(input.birthDate, 'Birth date', 10)
  const address = text(input.address, 'Address', 240)
  const branchId = text(input.branchId ?? input.branchAssignment, 'Branch', 80)
  const email = text(input.email, 'Email', 254).toLowerCase()
  const positionTitle = text(input.positionTitle ?? input.position, 'Position', 100)
  const allowedRoles = ['SUPER_ADMIN', 'OPEC_PRESIDENT', 'OPEC_SECRETARY', 'OPEC_TREASURER', 'OPEC_AUDITOR', 'MEMBER', 'REGIONAL_MANAGER', 'AREA_MANAGER', 'REGIONAL_AUDIT_MANAGER']
  const memberRole = typeof input.role === 'string' && allowedRoles.includes(input.role) ? input.role : 'MEMBER'
  if (memberRole !== 'MEMBER' && actor.role !== 'SUPER_ADMIN') throw new Error('Only a super administrator can assign privileged account roles.')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateHired) || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error('Enter valid hire and birth dates.')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Enter a valid email address.')
  if (employeeNumber.length < 2) throw new Error('Employee number must contain at least two characters.')

  const [branch] = await db.select({ id: branches.id }).from(branches).where(eq(branches.id, branchId)).limit(1)
  if (!branch) throw new Error('Choose a branch that exists in the organization directory.')

  const record = {
    employeeNumber, firstName,
    middleName: typeof input.middleName === 'string' && input.middleName.trim() ? input.middleName.trim().slice(0, 80) : null,
    lastName,
    suffix: typeof input.suffix === 'string' && input.suffix.trim() ? input.suffix.trim().slice(0, 20) : null,
    birthDate, contactNumber: typeof input.contactNumber === 'string' ? input.contactNumber.trim().slice(0, 40) || null : null,
    email, address, dateHired, employmentStatus: 'PERMANENT',
    photoUrl: typeof input.photoUrl === 'string' && input.photoUrl.startsWith('https://') ? input.photoUrl : null,
    branchId,
  }

  return db.transaction(async (tx) => {
    const duplicateNumber = await tx.select({ id: employees.id }).from(employees).where(eq(employees.employeeNumber, employeeNumber)).limit(1)
    if (duplicateNumber.length && duplicateNumber[0].id !== employeeId) throw new Error('That employee number is already in use.')
    const [position] = await tx.select({ id: positions.id }).from(positions).where(eq(positions.title, positionTitle)).limit(1)
    const positionId = position?.id ?? auditId()
    if (!position) await tx.insert(positions).values({ id: positionId, title: positionTitle, isOpecOfficer: false })

    let savedId = employeeId
    if (employeeId) {
      const updated = await tx.update(employees).set({ ...record, positionId, updatedAt: new Date() }).where(eq(employees.id, employeeId)).returning({ id: employees.id })
      if (!updated.length) throw new Error('Member record was not found.')
      const [matchingUser] = await tx.select({ id: users.id, employeeId: users.employeeId }).from(users).where(eq(users.email, email)).limit(1)
      if (memberRole !== 'MEMBER' && !matchingUser) throw new Error('Create the account with this email before assigning it a privileged role.')
      if (matchingUser && matchingUser.employeeId && matchingUser.employeeId !== employeeId) throw new Error('That account is already linked to another employee.')
      if (matchingUser) await tx.update(users).set({ employeeId, ...(actor.role === 'SUPER_ADMIN' ? { role: memberRole } : {}), updatedAt: new Date() }).where(eq(users.id, matchingUser.id))
    } else {
      savedId = auditId()
      await tx.insert(employees).values({ id: savedId, ...record, positionId })
      const [matchingUser] = await tx.select({ id: users.id, employeeId: users.employeeId }).from(users).where(eq(users.email, email)).limit(1)
      if (memberRole !== 'MEMBER' && !matchingUser) throw new Error('Create the account with this email before assigning it a privileged role.')
      if (matchingUser && matchingUser.employeeId && matchingUser.employeeId !== savedId) throw new Error('That account is already linked to another employee.')
      if (matchingUser) await tx.update(users).set({ employeeId: savedId, ...(actor.role === 'SUPER_ADMIN' ? { role: memberRole } : {}), updatedAt: new Date() }).where(eq(users.id, matchingUser.id))
    }

    await tx.insert(auditLogs).values({ id: auditId(), userId: actor.id, action: employeeId ? 'UPDATE_MEMBER' : 'CREATE_MEMBER', entity: 'employees', entityId: savedId!, changes: { employeeNumber, email }, at: new Date() })
    return { ok: true, employeeId: savedId }
  })
}

export async function deactivateMember(employeeId: string) {
  const actor = await requireUser()
  requireMemberManager(actor.role)
  const id = text(employeeId, 'Member ID', 80)
  const updated = await db.update(employees).set({ employmentStatus: 'INACTIVE', updatedAt: new Date() }).where(eq(employees.id, id)).returning({ id: employees.id })
  if (!updated.length) throw new Error('Member record was not found.')
  await db.insert(auditLogs).values({ id: auditId(), userId: actor.id, action: 'DEACTIVATE_MEMBER', entity: 'employees', entityId: id, at: new Date() })
  return { ok: true }
}

export async function submitLoanApplication(input: { productId: string; amount: number; termMonths: number; purpose: string; coMakerIds?: string[] }) {
  const actor = await requireUser()
  if (actor.role !== 'MEMBER' || !actor.employeeId) throw new Error('A linked member account is required to submit a loan application.')
  const amount = Number(input.amount)
  const termMonths = Number(input.termMonths)
  const purpose = text(input.purpose, 'Loan purpose', 300)
  const productId = text(input.productId, 'Loan product', 80)
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000 || !Number.isInteger(termMonths) || termMonths < 1 || termMonths > 120) throw new Error('Enter a valid amount and repayment term.')

  const [employee] = await db.select().from(employees).where(eq(employees.id, actor.employeeId)).limit(1)
  if (!employee || employee.employmentStatus === 'INACTIVE') throw new Error('Your active member record could not be verified.')
  const [product] = await db.select().from(loanProducts).where(and(eq(loanProducts.id, productId), eq(loanProducts.active, true))).limit(1)
  if (!product) throw new Error('That loan product is not currently available.')
  if (amount < Number(product.minAmount) || amount > Number(product.maxAmount)) throw new Error(`Requested amount must be between ₱${Number(product.minAmount).toLocaleString()} and ₱${Number(product.maxAmount).toLocaleString()}.`)
  if (termMonths > product.maxTermMonths) throw new Error(`The selected product allows up to ${product.maxTermMonths} months.`)
  const yearsService = Math.floor((Date.now() - new Date(`${employee.dateHired}T00:00:00`).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
  const [eligibility] = await db.select().from(loanEligibilityRules)
    .where(and(eq(loanEligibilityRules.productId, product.id), lte(loanEligibilityRules.minYearsService, yearsService)))
    .orderBy(desc(loanEligibilityRules.minYearsService), desc(loanEligibilityRules.priority))
  const applicableRule = eligibility && yearsService >= eligibility.minYearsService ? eligibility : null
  const minimumService = applicableRule?.minYearsService ?? product.minYearsService
  const amountLimit = applicableRule ? Math.min(Number(product.maxAmount), Number(applicableRule.maxAmount)) : Number(product.maxAmount)
  const termLimit = applicableRule ? Math.min(product.maxTermMonths, applicableRule.maxTermMonths) : product.maxTermMonths
  const requiredCoMakers = applicableRule?.requiredCoMakers ?? product.requiredCoMakers
  if (yearsService < minimumService) throw new Error(`This product requires at least ${minimumService} years of service.`)
  if (amount > amountLimit) throw new Error(`Your service eligibility currently limits this request to ₱${amountLimit.toLocaleString()}.`)
  if (termMonths > termLimit) throw new Error(`Your service eligibility currently allows up to ${termLimit} months.`)

  const coMakerIds = [...new Set((input.coMakerIds ?? []).map((id) => text(id, 'Co-maker ID', 80)))].filter((id) => id !== actor.employeeId)
  if (coMakerIds.length !== requiredCoMakers) throw new Error(`Select exactly ${requiredCoMakers} different co-maker(s).`)
  const coMakers = coMakerIds.length ? await db.select({ id: employees.id }).from(employees).where(and(inArray(employees.id, coMakerIds), eq(employees.employmentStatus, 'PERMANENT'))) : []
  if (coMakers.length !== coMakerIds.length) throw new Error('One or more co-makers could not be found.')

  const id = auditId()
  const applicationNo = `OPEC-${new Date().getFullYear()}-${id.slice(0, 8).toUpperCase()}`
  await db.transaction(async (tx) => {
    await tx.insert(loanApplications).values({ id, applicationNo, employeeId: actor.employeeId!, loanProductId: product.id, purpose, requestedAmount: amount.toFixed(2), termMonths, status: 'SUBMITTED', submittedAt: new Date(), createdByUserId: actor.id, createdAt: new Date(), updatedAt: new Date() })
    if (coMakerIds.length) await tx.insert(loanApplicationCoMakers).values(coMakerIds.map((employeeId, index) => ({ id: auditId(), applicationId: id, employeeId, sequence: index + 1, status: 'PENDING' })))
    await tx.insert(auditLogs).values({ id: auditId(), userId: actor.id, action: 'SUBMIT_LOAN_APPLICATION', entity: 'loan_applications', entityId: id, changes: { applicationNo, amount, termMonths, coMakers: coMakerIds.length }, at: new Date() })
  })
  return { ok: true, applicationNo }
}

export async function recordLoanDecision(applicationId: string, decision: 'APPROVED' | 'REJECTED', comments = '') {
  const actor = await requireUser()
  if (!REVIEWER_ROLES.includes(actor.role)) throw new Error('You do not have permission to review loan applications.')
  if (decision === 'APPROVED' && actor.role !== 'SUPER_ADMIN' && !COMMITTEE_ROLES.includes(actor.role)) throw new Error('Only an authorized committee member can approve a loan.')
  const id = text(applicationId, 'Application ID', 80)
  const note = comments.trim().slice(0, 500)
  if (decision === 'REJECTED' && note.length < 5) throw new Error('A rejection reason of at least five characters is required.')
  const [application] = await db.select().from(loanApplications).where(eq(loanApplications.id, id)).limit(1)
  if (!application) throw new Error('Application not found.')
  if (!['SUBMITTED', 'FOR_APPROVAL'].includes(application.status)) throw new Error('This application is not awaiting a decision.')
  const role = COMMITTEE_ROLES.includes(actor.role) ? actor.role : 'SUPER_ADMIN'
  const outcome = await db.transaction(async (tx) => {
    const [priorDecision] = await tx.select({ id: loanApprovals.id }).from(loanApprovals).where(and(eq(loanApprovals.applicationId, id), eq(loanApprovals.role, role))).limit(1)
    if (priorDecision) throw new Error('A decision from your role has already been recorded for this application.')
    const now = new Date()
    await tx.insert(loanApprovals).values({
      id: auditId(), applicationId: id, approverId: actor.id, role,
      decision, comments: note || null,
      approvedAt: decision === 'APPROVED' ? now : null,
      rejectedAt: decision === 'REJECTED' ? now : null,
      createdAt: now,
    })
    const nextStatus = decision === 'REJECTED' ? 'REJECTED' : 'FOR_APPROVAL'
    if (decision === 'REJECTED') {
      await tx.update(loanApplications).set({ status: nextStatus, rejectionReason: note || 'Application declined by reviewer.', rejectedAt: now, updatedAt: now }).where(eq(loanApplications.id, id))
    } else {
      const approvals = await tx.select({ role: loanApprovals.role }).from(loanApprovals).where(and(eq(loanApprovals.applicationId, id), eq(loanApprovals.decision, 'APPROVED')))
      const approvedRoles = new Set(approvals.map((approval) => approval.role))
      const fullyApproved = COMMITTEE_ROLES.every((committeeRole) => approvedRoles.has(committeeRole))
      await tx.update(loanApplications).set({ status: fullyApproved ? 'APPROVED' : nextStatus, approvedAt: fullyApproved ? now : null, updatedAt: now }).where(eq(loanApplications.id, id))
      await tx.insert(auditLogs).values({ id: auditId(), userId: actor.id, action: 'APPROVE_LOAN_APPLICATION', entity: 'loan_applications', entityId: id, changes: { decision, comments: note }, at: now })
      return fullyApproved ? 'APPROVED' : nextStatus
    }
    await tx.insert(auditLogs).values({ id: auditId(), userId: actor.id, action: 'REJECT_LOAN_APPLICATION', entity: 'loan_applications', entityId: id, changes: { decision, comments: note }, at: now })
    return nextStatus
  }, { isolationLevel: 'serializable' })
  return { ok: true, status: outcome }
}
