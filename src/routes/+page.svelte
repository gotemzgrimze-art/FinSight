<script lang="ts">
	import { onMount } from 'svelte';
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	import AllowanceTracker from '$lib/components/AllowanceTracker.svelte';
	import DebtTracker from '$lib/components/DebtTracker.svelte';
	import GlanceOverview from '$lib/components/GlanceOverview.svelte';
	import MoneyCommandCenter from '$lib/components/MoneyCommandCenter.svelte';
	import NetWorthTracker from '$lib/components/NetWorthTracker.svelte';
	import Paywall from '$lib/components/Paywall.svelte';
	import ProfileForm from '$lib/components/ProfileForm.svelte';
	import PurchaseChecker from '$lib/components/PurchaseChecker.svelte';
	import PurchaseResults from '$lib/components/PurchaseResults.svelte';
	import RecurringTracker from '$lib/components/RecurringTracker.svelte';
	import StudentDiscount from '$lib/components/StudentDiscount.svelte';
	import TransactionTracker from '$lib/components/TransactionTracker.svelte';
	import {
		calculateAffordabilityVerdict,
		calculateAllowanceRemaining,
		calculateGoalProgress,
		calculateMonthlyDebtPayment,
		optionalMoney,
		parseMoney,
		parsePercentage
	} from '$lib/calculations';
	import { demoProfile, productOptions } from '$lib/mockData';
	import type {
		Allowance,
		AssetAccount,
		Debt,
		FinancialProfile,
		Goal,
		PurchaseAssessment,
		PurchaseAssessmentOptions,
		PurchaseInput,
		RecurringItem,
		SubscriptionTier,
		Transaction
	} from '$lib/models';
	import {
		clearProfile as clearStoredProfile,
		hasSavedProfile as profileExists,
		saveProfile as saveStoredProfile,
		unlockProfile as unlockStoredProfile
	} from '$lib/profileStorage';
	import {
		canAddGoal,
		canRunPurchaseCheck,
		defaultSubscriptionState,
		getSubscriptionLimits,
		loadSubscriptionState,
		saveSubscriptionState
	} from '$lib/subscription';

	type ServiceId =
		| 'dashboard'
		| 'transactions'
		| 'recurring'
		| 'wealth'
		| 'profile'
		| 'purchase'
		| 'review';

	type Service = {
		id: ServiceId;
		name: string;
		kicker: string;
		icon: string;
	};

	let activeService = $state<ServiceId>('dashboard');
	let profile = $state<FinancialProfile>(structuredClone(demoProfile));
	let purchaseInput = $state<PurchaseInput>({
		name: '',
		cost: '',
		category: 'electronics'
	});
	let purchaseOptions = $state<Required<PurchaseAssessmentOptions>>({
		waitDays: 45,
		cheaperAlternativePercentage: 0.72,
		investmentYears: 15
	});
	let purchaseAssessment = $state<PurchaseAssessment | null>(null);
	let profilePasscode = $state('');
	let securityStatus = $state('No encrypted profile saved');
	let savedAt = $state('');
	let hasSavedProfile = $state(false);
	let validationMessage = $state('');
	let subscription = $state({ ...defaultSubscriptionState });

	const services: Service[] = [
		{ id: 'dashboard', name: 'Dashboard', kicker: 'Today', icon: '$' },
		{ id: 'transactions', name: 'Transactions', kicker: 'Spending', icon: '#' },
		{ id: 'recurring', name: 'Recurring', kicker: 'Bills', icon: '@' },
		{ id: 'wealth', name: 'Net worth', kicker: 'Assets', icon: '%' },
		{ id: 'purchase', name: 'Purchase check', kicker: 'Decide', icon: '?' },
		{ id: 'profile', name: 'Profile', kicker: 'Local data', icon: '*' },
		{ id: 'review', name: 'Overview', kicker: 'Summary', icon: '=' }
	];

	const selectedProduct = $derived(
		productOptions.find((option) => option.id === purchaseInput.category) ?? productOptions[1]
	);
	const subscriptionLimits = $derived(getSubscriptionLimits(subscription));
	const purchaseCheckAllowed = $derived(canRunPurchaseCheck(subscription));

	const setSubscriptionState = (nextSubscription: typeof subscription) => {
		subscription = nextSubscription;
		saveSubscriptionState(nextSubscription);
	};

	const selectService = (service: ServiceId) => {
		activeService = service;
	};

	const updateProfileField = (
		key: keyof Omit<
			FinancialProfile,
			'goals' | 'debts' | 'allowances' | 'transactions' | 'recurringItems' | 'assets'
		>,
		value: string
	) => {
		profile = { ...profile, [key]: value };
	};

	const normalizeProfile = (candidate: FinancialProfile): FinancialProfile => ({
		...structuredClone(demoProfile),
		...candidate,
		goals: candidate.goals ?? [],
		debts: candidate.debts ?? [],
		allowances: candidate.allowances ?? [],
		transactions: candidate.transactions ?? [],
		recurringItems: candidate.recurringItems ?? [],
		assets: candidate.assets ?? []
	});

	const validateProfile = () => {
		parseMoney(profile.annualSalary, 'annual income');
		optionalMoney(profile.bankBalance, 'bank balance');
		optionalMoney(profile.monthlyExpenses, 'monthly expenses');
		if (optionalMoney(profile.workHoursPerMonth, 'work hours per month') <= 0) {
			throw new Error('work hours per month must be greater than 0');
		}
		parsePercentage(profile.investmentReturnRate, 'investment return rate');

		for (const goal of profile.goals) {
			calculateGoalProgress(goal);
			const contribution = optionalMoney(goal.monthlyContribution, `${goal.name} monthly contribution`);
			if (contribution < 0) throw new Error('monthly contribution cannot be negative');
		}

		calculateMonthlyDebtPayment(profile.debts);
		for (const debt of profile.debts) {
			optionalMoney(debt.balance, `${debt.name} balance`);
			parsePercentage(debt.annualInterestRate, `${debt.name} interest rate`);
		}

		for (const allowance of profile.allowances) {
			calculateAllowanceRemaining(allowance.limit, allowance.spent);
		}

		for (const transaction of profile.transactions) {
			optionalMoney(transaction.amount, `${transaction.merchant || 'transaction'} amount`);
		}

		for (const item of profile.recurringItems) {
			optionalMoney(item.amount, `${item.name || 'recurring item'} amount`);
			const dueDay = optionalMoney(item.dueDay, `${item.name || 'recurring item'} due day`);
			if (dueDay < 1 || dueDay > 31) throw new Error('recurring due day must be between 1 and 31');
		}

		for (const asset of profile.assets) {
			optionalMoney(asset.balance, `${asset.name || 'asset'} balance`);
		}
	};

	const updateGoal = (goal: Goal) => {
		profile = { ...profile, goals: profile.goals.map((item) => (item.id === goal.id ? goal : item)) };
	};

	const addGoal = () => {
		if (!canAddGoal(subscription, profile.goals.length)) {
			validationMessage = 'Free tier allows 3 goals. Switch to premium or student to add more.';
			return;
		}

		profile = {
			...profile,
			goals: [
				...profile.goals,
				{
					id: `goal-${crypto.randomUUID()}`,
					name: 'New goal',
					targetAmount: '1000',
					currentAmount: '0',
					monthlyContribution: '100'
				}
			]
		};
	};

	const removeGoal = (id: string) => {
		profile = { ...profile, goals: profile.goals.filter((goal) => goal.id !== id) };
	};

	const updateDebt = (debt: Debt) => {
		profile = { ...profile, debts: profile.debts.map((item) => (item.id === debt.id ? debt : item)) };
	};

	const addDebt = () => {
		profile = {
			...profile,
			debts: [
				...profile.debts,
				{
					id: `debt-${crypto.randomUUID()}`,
					name: 'New debt',
					balance: '0',
					minimumPayment: '0',
					annualInterestRate: '0'
				}
			]
		};
	};

	const removeDebt = (id: string) => {
		profile = { ...profile, debts: profile.debts.filter((debt) => debt.id !== id) };
	};

	const updateAllowance = (allowance: Allowance) => {
		profile = {
			...profile,
			allowances: profile.allowances.map((item) => (item.id === allowance.id ? allowance : item))
		};
	};

	const addAllowance = () => {
		profile = {
			...profile,
			allowances: [
				...profile.allowances,
				{
					id: `allowance-${crypto.randomUUID()}`,
					name: 'New allowance',
					limit: '100',
					spent: '0',
					period: 'monthly'
				}
			]
		};
	};

	const removeAllowance = (id: string) => {
		profile = { ...profile, allowances: profile.allowances.filter((allowance) => allowance.id !== id) };
	};

	const updateTransaction = (transaction: Transaction) => {
		profile = {
			...profile,
			transactions: profile.transactions.map((item) => (item.id === transaction.id ? transaction : item))
		};
	};

	const addTransaction = () => {
		profile = {
			...profile,
			transactions: [
				{
					id: `txn-${crypto.randomUUID()}`,
					date: new Date().toISOString().slice(0, 10),
					merchant: 'New transaction',
					category: 'General',
					amount: '0',
					type: 'expense',
					essential: false
				},
				...profile.transactions
			]
		};
	};

	const removeTransaction = (id: string) => {
		profile = { ...profile, transactions: profile.transactions.filter((transaction) => transaction.id !== id) };
	};

	const updateRecurring = (item: RecurringItem) => {
		profile = {
			...profile,
			recurringItems: profile.recurringItems.map((current) => (current.id === item.id ? item : current))
		};
	};

	const addRecurring = () => {
		profile = {
			...profile,
			recurringItems: [
				...profile.recurringItems,
				{
					id: `rec-${crypto.randomUUID()}`,
					name: 'New bill',
					amount: '0',
					category: 'General',
					dueDay: '15',
					status: 'review'
				}
			]
		};
	};

	const removeRecurring = (id: string) => {
		profile = { ...profile, recurringItems: profile.recurringItems.filter((item) => item.id !== id) };
	};

	const updateAsset = (asset: AssetAccount) => {
		profile = {
			...profile,
			assets: profile.assets.map((item) => (item.id === asset.id ? asset : item))
		};
	};

	const addAsset = () => {
		profile = {
			...profile,
			assets: [
				...profile.assets,
				{
					id: `asset-${crypto.randomUUID()}`,
					name: 'New asset',
					type: 'other',
					balance: '0'
				}
			]
		};
	};

	const removeAsset = (id: string) => {
		profile = { ...profile, assets: profile.assets.filter((asset) => asset.id !== id) };
	};

	const updatePurchase = (key: keyof PurchaseInput, value: string) => {
		purchaseInput = { ...purchaseInput, [key]: value };
	};

	const updatePurchaseOption = (key: keyof PurchaseAssessmentOptions, value: number) => {
		const nextValue = Number.isFinite(value) && value > 0 ? value : purchaseOptions[key];
		purchaseOptions = { ...purchaseOptions, [key]: nextValue };
	};

	const runPurchaseCheck = () => {
		try {
			validateProfile();

			if (!purchaseCheckAllowed) {
				validationMessage = 'Free tier purchase-check limit reached for this month.';
				return;
			}

			purchaseAssessment = calculateAffordabilityVerdict(profile, purchaseInput, selectedProduct, purchaseOptions);
			setSubscriptionState({
				...subscription,
				purchaseChecksUsedThisMonth: subscription.purchaseChecksUsedThisMonth + 1
			});
			validationMessage = '';
		} catch (error) {
			purchaseAssessment = null;
			validationMessage = error instanceof Error ? error.message : 'Could not calculate this purchase.';
		}
	};

	const saveProfile = async () => {
		try {
			validateProfile();
			await saveStoredProfile(profilePasscode, profile);
			savedAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
			securityStatus = 'AES-GCM encrypted on this device';
			hasSavedProfile = true;
			profilePasscode = '';
			validationMessage = '';
		} catch (error) {
			securityStatus = error instanceof Error ? error.message : 'Could not save profile';
		}
	};

	const unlockProfile = async () => {
		try {
			profile = normalizeProfile(await unlockStoredProfile(profilePasscode));
			securityStatus = 'Unlocked for this session';
			savedAt = 'Saved locally';
			hasSavedProfile = true;
			profilePasscode = '';
		} catch (error) {
			securityStatus = error instanceof Error ? error.message : 'Passcode did not unlock data';
		}
	};

	const clearProfile = () => {
		clearStoredProfile();
		profile = structuredClone(demoProfile);
		purchaseAssessment = null;
		profilePasscode = '';
		savedAt = '';
		securityStatus = 'No encrypted profile saved';
		hasSavedProfile = false;
	};

	const setTier = (tier: SubscriptionTier) => {
		setSubscriptionState({
			...subscription,
			tier,
			isStudentVerified: tier === 'student' ? subscription.isStudentVerified : false
		});
	};

	const verifyStudent = () => {
		setSubscriptionState({
			...subscription,
			tier: 'student',
			isStudentVerified: true
		});
	};

	onMount(() => {
		hasSavedProfile = profileExists();
		securityStatus = hasSavedProfile ? 'Encrypted profile locked' : 'No encrypted profile saved';
		subscription = loadSubscriptionState();
	});
</script>

<svelte:head>
	<title>FinSight</title>
	<meta
		name="description"
		content="A personal finance decision engine for understanding purchase impact before you buy."
	/>
</svelte:head>

<main class="app-shell">
	<header class="topbar" aria-label="App header">
		<div>
			<p class="eyebrow">FinSight</p>
			<h1>Decide what your money can handle.</h1>
			<p class="disclaimer">
				A local-first finance command center for spending, bills, net worth, and purchase decisions.
			</p>
		</div>
	</header>

	<AppNavigation items={services} activeItem={activeService} onSelect={(id) => selectService(id as ServiceId)} />

	{#if validationMessage}
		<section class="notice-panel" role="status">{validationMessage}</section>
	{/if}

	{#if activeService === 'dashboard'}
		<MoneyCommandCenter {profile} {subscription} onSelect={(section) => selectService(section as ServiceId)} />
	{/if}

	{#if activeService === 'transactions'}
		<TransactionTracker
			transactions={profile.transactions}
			onTransactionChange={updateTransaction}
			onAddTransaction={addTransaction}
			onRemoveTransaction={removeTransaction}
		/>
	{/if}

	{#if activeService === 'recurring'}
		<RecurringTracker
			items={profile.recurringItems}
			onRecurringChange={updateRecurring}
			onAddRecurring={addRecurring}
			onRemoveRecurring={removeRecurring}
		/>
	{/if}

	{#if activeService === 'wealth'}
		<NetWorthTracker
			assets={profile.assets}
			debts={profile.debts}
			onAssetChange={updateAsset}
			onAddAsset={addAsset}
			onRemoveAsset={removeAsset}
		/>
	{/if}

	{#if activeService === 'profile'}
		<section class="screen service-screen" aria-labelledby="profile-title">
			<ProfileForm
				{profile}
				{profilePasscode}
				{securityStatus}
				{savedAt}
				{hasSavedProfile}
				onProfileField={updateProfileField}
				onGoalChange={updateGoal}
				onAddGoal={addGoal}
				onRemoveGoal={removeGoal}
				onPasscode={(value) => (profilePasscode = value)}
				onSave={saveProfile}
				onUnlock={unlockProfile}
				onClear={clearProfile}
			/>
			<DebtTracker
				debts={profile.debts}
				onDebtChange={updateDebt}
				onAddDebt={addDebt}
				onRemoveDebt={removeDebt}
			/>
			<AllowanceTracker
				allowances={profile.allowances}
				onAllowanceChange={updateAllowance}
				onAddAllowance={addAllowance}
				onRemoveAllowance={removeAllowance}
			/>
			<div class="split-layout">
				<Paywall {subscription} onTierChange={setTier} />
				<StudentDiscount isVerified={subscription.isStudentVerified} onVerify={verifyStudent} />
			</div>
		</section>
	{/if}

	{#if activeService === 'purchase'}
		<section class="screen service-screen" aria-labelledby="purchase-title">
			<div class="question-heading compact-heading">
				<p class="eyebrow">Purchase check</p>
				<h2 id="purchase-title">Should I buy this?</h2>
			</div>
			<PurchaseChecker
				purchase={purchaseInput}
				options={purchaseOptions}
				{productOptions}
				onPurchaseField={updatePurchase}
				onOptionField={updatePurchaseOption}
				onRunCheck={runPurchaseCheck}
				canRunCheck={purchaseCheckAllowed}
			/>
			{#if !purchaseCheckAllowed}
				<Paywall {subscription} onTierChange={setTier} />
			{/if}
			<PurchaseResults
				assessment={purchaseAssessment}
				{selectedProduct}
				showInvestment={subscriptionLimits.investmentOpportunityCost}
			/>
		</section>
	{/if}

	{#if activeService === 'review'}
		<GlanceOverview {profile} {subscription} />
	{/if}

	<footer class="app-footer">
		FinSight provides educational planning tools, not financial advice.
	</footer>
</main>
