CREATE TYPE "frequency" AS ENUM ('weekly', 'biweekly', 'semimonthly', 'monthly', 'annual', 'one_time');
CREATE TYPE "income_stability" AS ENUM ('stable', 'variable', 'seasonal', 'unpredictable');
CREATE TYPE "account_type" AS ENUM ('checking', 'savings', 'credit_card', 'loan', 'investment', 'other');
CREATE TYPE "debt_type" AS ENUM ('credit_card', 'student_loan', 'auto_loan', 'personal_loan', 'mortgage', 'other');
CREATE TYPE "goal_priority" AS ENUM ('low', 'medium', 'high');
CREATE TYPE "impact_level" AS ENUM ('LOW_IMPACT', 'MODERATE_IMPACT', 'HIGH_IMPACT', 'VERY_HIGH_IMPACT');

CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL UNIQUE,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL UNIQUE,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "two_factor" (
	"id" text PRIMARY KEY NOT NULL,
	"secret" text NOT NULL,
	"backup_codes" text NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade
);

CREATE TABLE "profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE cascade,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"country" text NOT NULL,
	"preferred_currency" text DEFAULT 'USD' NOT NULL,
	"employment_status" text,
	"emergency_fund_months" integer DEFAULT 3 NOT NULL,
	"onboarding_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "financial_accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"provider" text NOT NULL,
	"provider_account_id" text,
	"account_type" "account_type" NOT NULL,
	"account_name" text NOT NULL,
	"currency" text NOT NULL,
	"current_balance_minor" integer NOT NULL,
	"available_balance_minor" integer,
	"last_synced_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "income_sources" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"frequency" "frequency" NOT NULL,
	"stability" "income_stability" NOT NULL,
	"next_expected_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "expenses" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"category" text NOT NULL,
	"name" text NOT NULL,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"frequency" "frequency" NOT NULL,
	"next_due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "debts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"debt_type" "debt_type" NOT NULL,
	"balance_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"apr_basis_points" integer DEFAULT 0 NOT NULL,
	"minimum_payment_minor" integer NOT NULL,
	"payment_due_date" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "financial_goals" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"name" text NOT NULL,
	"target_amount_minor" integer NOT NULL,
	"current_amount_minor" integer DEFAULT 0 NOT NULL,
	"currency" text NOT NULL,
	"target_date" timestamp with time zone,
	"priority" "goal_priority" DEFAULT 'medium' NOT NULL,
	"monthly_contribution_minor" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"financial_account_id" text NOT NULL REFERENCES "financial_accounts"("id") ON DELETE cascade,
	"external_transaction_id" text,
	"amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"merchant" text,
	"normalized_merchant" text,
	"description" text NOT NULL,
	"category" text DEFAULT 'Other' NOT NULL,
	"transaction_date" timestamp with time zone NOT NULL,
	"pending" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "purchase_checks" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL REFERENCES "user"("id") ON DELETE cascade,
	"requested_amount_minor" integer NOT NULL,
	"currency" text NOT NULL,
	"category" text NOT NULL,
	"engine_version" text NOT NULL,
	"impact_level" "impact_level" NOT NULL,
	"confidence" text NOT NULL,
	"explanation_json" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "audit_events" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text REFERENCES "user"("id") ON DELETE set null,
	"action" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "session_user_id_idx" ON "session" ("user_id");
CREATE UNIQUE INDEX "session_token_idx" ON "session" ("token");
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");
CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");
CREATE INDEX "two_factor_user_id_idx" ON "two_factor" ("user_id");
CREATE INDEX "profiles_user_id_idx" ON "profiles" ("user_id");
CREATE INDEX "financial_accounts_user_id_idx" ON "financial_accounts" ("user_id");
CREATE UNIQUE INDEX "financial_accounts_provider_account_idx" ON "financial_accounts" ("user_id", "provider", "provider_account_id");
CREATE INDEX "income_sources_user_id_idx" ON "income_sources" ("user_id");
CREATE INDEX "expenses_user_id_idx" ON "expenses" ("user_id");
CREATE INDEX "debts_user_id_idx" ON "debts" ("user_id");
CREATE INDEX "financial_goals_user_id_idx" ON "financial_goals" ("user_id");
CREATE INDEX "transactions_user_id_idx" ON "transactions" ("user_id");
CREATE INDEX "transactions_account_id_idx" ON "transactions" ("financial_account_id");
CREATE INDEX "transactions_user_date_idx" ON "transactions" ("user_id", "transaction_date");
CREATE INDEX "purchase_checks_user_id_idx" ON "purchase_checks" ("user_id");
CREATE INDEX "purchase_checks_user_created_idx" ON "purchase_checks" ("user_id", "created_at");
CREATE INDEX "audit_events_user_id_idx" ON "audit_events" ("user_id");
CREATE INDEX "audit_events_action_idx" ON "audit_events" ("action");
