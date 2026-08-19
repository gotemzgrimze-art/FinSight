import {
	boolean,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uniqueIndex
} from 'drizzle-orm/pg-core';

export const frequencyEnum = pgEnum('frequency', ['weekly', 'biweekly', 'semimonthly', 'monthly', 'annual', 'one_time']);
export const stabilityEnum = pgEnum('income_stability', ['stable', 'variable', 'seasonal', 'unpredictable']);
export const accountTypeEnum = pgEnum('account_type', ['checking', 'savings', 'credit_card', 'loan', 'investment', 'other']);
export const debtTypeEnum = pgEnum('debt_type', ['credit_card', 'student_loan', 'auto_loan', 'personal_loan', 'mortgage', 'other']);
export const goalPriorityEnum = pgEnum('goal_priority', ['low', 'medium', 'high']);
export const impactLevelEnum = pgEnum('impact_level', ['LOW_IMPACT', 'MODERATE_IMPACT', 'HIGH_IMPACT', 'VERY_HIGH_IMPACT']);

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	role: text('role').notNull().default('user'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
}, (table) => ({
	userIdx: index('session_user_id_idx').on(table.userId),
	tokenIdx: uniqueIndex('session_token_idx').on(table.token)
}));

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('account_user_id_idx').on(table.userId)
}));

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	identifierIdx: index('verification_identifier_idx').on(table.identifier)
}));

export const twoFactor = pgTable('two_factor', {
	id: text('id').primaryKey(),
	secret: text('secret').notNull(),
	backupCodes: text('backup_codes').notNull(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' })
}, (table) => ({
	userIdx: index('two_factor_user_id_idx').on(table.userId)
}));

export const profiles = pgTable('profiles', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
	firstName: text('first_name').notNull(),
	lastName: text('last_name').notNull(),
	country: text('country').notNull(),
	preferredCurrency: text('preferred_currency').notNull().default('USD'),
	employmentStatus: text('employment_status'),
	emergencyFundMonths: integer('emergency_fund_months').notNull().default(3),
	onboardingCompletedAt: timestamp('onboarding_completed_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('profiles_user_id_idx').on(table.userId)
}));

export const financialAccounts = pgTable('financial_accounts', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	provider: text('provider').notNull(),
	providerAccountId: text('provider_account_id'),
	accountType: accountTypeEnum('account_type').notNull(),
	accountName: text('account_name').notNull(),
	currency: text('currency').notNull(),
	currentBalanceMinor: integer('current_balance_minor').notNull(),
	availableBalanceMinor: integer('available_balance_minor'),
	lastSyncedAt: timestamp('last_synced_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('financial_accounts_user_id_idx').on(table.userId),
	providerIdx: uniqueIndex('financial_accounts_provider_account_idx').on(table.userId, table.provider, table.providerAccountId)
}));

export const incomeSources = pgTable('income_sources', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	amountMinor: integer('amount_minor').notNull(),
	currency: text('currency').notNull(),
	frequency: frequencyEnum('frequency').notNull(),
	stability: stabilityEnum('stability').notNull(),
	nextExpectedDate: timestamp('next_expected_date', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('income_sources_user_id_idx').on(table.userId)
}));

export const expenses = pgTable('expenses', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	category: text('category').notNull(),
	name: text('name').notNull(),
	amountMinor: integer('amount_minor').notNull(),
	currency: text('currency').notNull(),
	frequency: frequencyEnum('frequency').notNull(),
	nextDueDate: timestamp('next_due_date', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('expenses_user_id_idx').on(table.userId)
}));

export const debts = pgTable('debts', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	debtType: debtTypeEnum('debt_type').notNull(),
	balanceMinor: integer('balance_minor').notNull(),
	currency: text('currency').notNull(),
	aprBasisPoints: integer('apr_basis_points').notNull().default(0),
	minimumPaymentMinor: integer('minimum_payment_minor').notNull(),
	paymentDueDate: timestamp('payment_due_date', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('debts_user_id_idx').on(table.userId)
}));

export const financialGoals = pgTable('financial_goals', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	targetAmountMinor: integer('target_amount_minor').notNull(),
	currentAmountMinor: integer('current_amount_minor').notNull().default(0),
	currency: text('currency').notNull(),
	targetDate: timestamp('target_date', { withTimezone: true }),
	priority: goalPriorityEnum('priority').notNull().default('medium'),
	monthlyContributionMinor: integer('monthly_contribution_minor').notNull().default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('financial_goals_user_id_idx').on(table.userId)
}));

export const transactions = pgTable('transactions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	financialAccountId: text('financial_account_id').notNull().references(() => financialAccounts.id, { onDelete: 'cascade' }),
	externalTransactionId: text('external_transaction_id'),
	amountMinor: integer('amount_minor').notNull(),
	currency: text('currency').notNull(),
	merchant: text('merchant'),
	normalizedMerchant: text('normalized_merchant'),
	description: text('description').notNull(),
	category: text('category').notNull().default('Other'),
	transactionDate: timestamp('transaction_date', { withTimezone: true }).notNull(),
	pending: boolean('pending').notNull().default(false),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('transactions_user_id_idx').on(table.userId),
	accountIdx: index('transactions_account_id_idx').on(table.financialAccountId),
	dateIdx: index('transactions_user_date_idx').on(table.userId, table.transactionDate)
}));

export const purchaseChecks = pgTable('purchase_checks', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	requestedAmountMinor: integer('requested_amount_minor').notNull(),
	currency: text('currency').notNull(),
	category: text('category').notNull(),
	engineVersion: text('engine_version').notNull(),
	impactLevel: impactLevelEnum('impact_level').notNull(),
	confidence: text('confidence').notNull(),
	explanationJson: jsonb('explanation_json').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('purchase_checks_user_id_idx').on(table.userId),
	createdIdx: index('purchase_checks_user_created_idx').on(table.userId, table.createdAt)
}));

export const auditEvents = pgTable('audit_events', {
	id: text('id').primaryKey(),
	userId: text('user_id').references(() => user.id, { onDelete: 'set null' }),
	action: text('action').notNull(),
	metadata: jsonb('metadata').notNull().default({}),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
}, (table) => ({
	userIdx: index('audit_events_user_id_idx').on(table.userId),
	actionIdx: index('audit_events_action_idx').on(table.action)
}));
