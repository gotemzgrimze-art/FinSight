<script lang="ts">
	import { onMount } from 'svelte';
	import AllowanceTracker from '$lib/components/AllowanceTracker.svelte';
	import Dashboard from '$lib/components/Dashboard.svelte';
	import DebtTracker from '$lib/components/DebtTracker.svelte';
	import GlanceOverview from '$lib/components/GlanceOverview.svelte';
	import Paywall from '$lib/components/Paywall.svelte';
	import ProfileForm from '$lib/components/ProfileForm.svelte';
	import PurchaseChecker from '$lib/components/PurchaseChecker.svelte';
	import PurchaseResults from '$lib/components/PurchaseResults.svelte';
	import StudentDiscount from '$lib/components/StudentDiscount.svelte';
	import {
		calculateAffordabilityVerdict,
		calculateGoalProgress,
		optionalMoney,
		parseMoney,
		parsePercentage
	} from '$lib/calculations';
	import { demoProfile, productOptions } from '$lib/mockData';
	import type {
		Allowance,
		Debt,
		FinancialProfile,
		Goal,
		PurchaseAssessment,
		PurchaseInput,
		SubscriptionTier
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
		getSubscriptionLimits
	} from '$lib/subscription';

	type ServiceId = 'dashboard' | 'profile' | 'purchase' | 'review';

	type Service = {
		id: ServiceId;
		name: string;
	};

	let activeService = $state<ServiceId>('dashboard');
	let menuOpen = $state(false);
	let profile = $state<FinancialProfile>(structuredClone(demoProfile));
	let purchaseInput = $state<PurchaseInput>({
		name: '',
		cost: '',
		category: 'electronics'
	});
	let purchaseAssessment = $state<PurchaseAssessment | null>(null);
	let profilePasscode = $state('');
	let securityStatus = $state('No encrypted profile saved');
	let savedAt = $state('');
	let hasSavedProfile = $state(false);
	let validationMessage = $state('');
	let subscription = $state({ ...defaultSubscriptionState });

	const services: Service[] = [
		{ id: 'dashboard', name: 'Financial Dashboard' },
		{ id: 'profile', name: 'Local Profile' },
		{ id: 'purchase', name: 'Purchase Check' },
		{ id: 'review', name: 'Glance Overview' }
	];

	const selectedProduct = $derived(
		productOptions.find((option) => option.id === purchaseInput.category) ?? productOptions[1]
	);
	const subscriptionLimits = $derived(getSubscriptionLimits(subscription));
	const purchaseCheckAllowed = $derived(canRunPurchaseCheck(subscription));

	const selectService = (service: ServiceId) => {
		activeService = service;
		menuOpen = false;
	};

	const updateProfileField = (
		key: keyof Omit<FinancialProfile, 'goals' | 'debts' | 'allowances'>,
		value: string
	) => {
		profile = { ...profile, [key]: value };
	};

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

	const updatePurchase = (key: keyof PurchaseInput, value: string) => {
		purchaseInput = { ...purchaseInput, [key]: value };
	};

	const runPurchaseCheck = () => {
		try {
			validateProfile();

			if (!purchaseCheckAllowed) {
				validationMessage = 'Free tier purchase-check limit reached for this month.';
				return;
			}

			purchaseAssessment = calculateAffordabilityVerdict(profile, purchaseInput, selectedProduct);
			subscription = {
				...subscription,
				purchaseChecksUsedThisMonth: subscription.purchaseChecksUsedThisMonth + 1
			};
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
			securityStatus = 'Encrypted on this device';
			hasSavedProfile = true;
			validationMessage = '';
		} catch (error) {
			securityStatus = error instanceof Error ? error.message : 'Could not save profile';
		}
	};

	const unlockProfile = async () => {
		try {
			profile = await unlockStoredProfile(profilePasscode);
			securityStatus = 'Unlocked for this session';
			savedAt = 'Saved locally';
			hasSavedProfile = true;
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
		subscription = {
			...subscription,
			tier,
			isStudentVerified: tier === 'student' ? subscription.isStudentVerified : false
		};
	};

	const verifyStudent = () => {
		subscription = {
			...subscription,
			tier: 'student',
			isStudentVerified: true
		};
	};

	onMount(() => {
		hasSavedProfile = profileExists();
		securityStatus = hasSavedProfile ? 'Encrypted profile locked' : 'No encrypted profile saved';
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
			<h1>One answer per money question.</h1>
			<p class="disclaimer">FinSight provides educational planning tools, not financial advice.</p>
		</div>
		<div class="menu-wrap">
			<button
				class="menu-button"
				type="button"
				aria-label="Open services menu"
				aria-expanded={menuOpen}
				aria-controls="service-menu"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span></span>
				<span></span>
				<span></span>
			</button>
			{#if menuOpen}
				<nav id="service-menu" class="service-menu" aria-label="Services">
					{#each services as service}
						<button
							type="button"
							class:active-service={activeService === service.id}
							onclick={() => selectService(service.id)}
						>
							{service.name}
						</button>
					{/each}
				</nav>
			{/if}
		</div>
	</header>

	{#if validationMessage}
		<section class="notice-panel" role="status">{validationMessage}</section>
	{/if}

	{#if activeService === 'dashboard'}
		<Dashboard {profile} />
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
				{productOptions}
				onPurchaseField={updatePurchase}
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
</main>
