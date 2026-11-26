import { boolean, date, integer, jsonb, numeric, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  role: text('role').notNull().default('MEMBER'),
  employeeId: text('employeeId'),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId').notNull(),
  activeOrganizationId: text('activeOrganizationId'),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId').notNull(),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  employeeNumber: text('employeeNumber').notNull(),
  firstName: text('firstName').notNull(),
  middleName: text('middleName'),
  lastName: text('lastName').notNull(),
  suffix: text('suffix'),
  birthDate: date('birthDate', { mode: 'string' }),
  contactNumber: text('contactNumber'),
  email: text('email'),
  address: text('address'),
  dateHired: date('dateHired', { mode: 'string' }).notNull(),
  employmentStatus: text('employmentStatus').notNull().default('PROBATIONARY'),
  photoUrl: text('photoUrl'),
  positionId: text('positionId'),
  branchId: text('branchId'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const positions = pgTable('positions', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  isOpecOfficer: boolean('isOpecOfficer').notNull().default(false),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  areaId: text('areaId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const loanProducts = pgTable('loan_products', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  minAmount: numeric('minAmount', { precision: 12, scale: 2 }).notNull(),
  maxAmount: numeric('maxAmount', { precision: 12, scale: 2 }).notNull(),
  maxTermMonths: integer('maxTermMonths').notNull(),
  interestRate: numeric('interestRate', { precision: 5, scale: 2 }).notNull(),
  interestMethod: text('interestMethod').notNull(),
  processingFee: numeric('processingFee', { precision: 12, scale: 2 }).notNull().default('0'),
  requiredCoMakers: integer('requiredCoMakers').notNull().default(0),
  minYearsService: integer('minYearsService').notNull().default(0),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const loanEligibilityRules = pgTable('loan_eligibility_rules', {
  id: text('id').primaryKey(),
  productId: text('productId').notNull(),
  minYearsService: integer('minYearsService').notNull(),
  maxAmount: numeric('maxAmount', { precision: 12, scale: 2 }).notNull(),
  maxTermMonths: integer('maxTermMonths').notNull(),
  requiredCoMakers: integer('requiredCoMakers').notNull(),
  priority: integer('priority').notNull().default(0),
})

export const loanApplications = pgTable('loan_applications', {
  id: text('id').primaryKey(),
  applicationNo: text('applicationNo').notNull(),
  employeeId: text('employeeId').notNull(),
  loanProductId: text('loanProductId').notNull(),
  purpose: text('purpose'),
  requestedAmount: numeric('requestedAmount', { precision: 12, scale: 2 }).notNull(),
  approvedAmount: numeric('approvedAmount', { precision: 12, scale: 2 }),
  termMonths: integer('termMonths'),
  releaseMethod: text('releaseMethod').notNull().default('BANK_CHECK'),
  status: text('status').notNull().default('DRAFT'),
  rejectionReason: text('rejectionReason'),
  submittedAt: timestamp('submittedAt'),
  approvedAt: timestamp('approvedAt'),
  rejectedAt: timestamp('rejectedAt'),
  createdByUserId: text('createdByUserId').notNull(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const loanApprovals = pgTable('loan_approvals', {
  id: text('id').primaryKey(),
  applicationId: text('applicationId').notNull(),
  approverId: text('approverId').notNull(),
  role: text('role').notNull(),
  decision: text('decision').notNull().default('PENDING'),
  comments: text('comments'),
  approvedAt: timestamp('approvedAt'),
  rejectedAt: timestamp('rejectedAt'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const loanApplicationCoMakers = pgTable('loan_application_co_makers', {
  id: text('id').primaryKey(),
  applicationId: text('applicationId').notNull(),
  employeeId: text('employeeId').notNull(),
  sequence: integer('sequence').notNull().default(1),
  status: text('status').notNull().default('PENDING'),
})

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('userId'),
  action: text('action').notNull(),
  entity: text('entity'),
  entityId: text('entityId'),
  changes: jsonb('changes'),
  ip: text('ip'),
  at: timestamp('at').notNull().defaultNow(),
})
