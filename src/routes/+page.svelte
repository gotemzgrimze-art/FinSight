<script lang="ts">
	import { onMount } from 'svelte';

	type StatusTone = 'safe' | 'caution' | 'risky' | 'danger';

	type Metric = {
		label: string;
		value: string;
		context: string;
		tone?: StatusTone;
	};

	type VerdictFact = {
		value: string;
		label: string;
	};

	type Scenario = {
		option: string;
		result: string;
		timeCost: string;
		verdict: string;
		tone: StatusTone;
	};

	type ServiceId = 'dashboard' | 'profile' | 'purchase' | 'review';

	type Service = {
		id: ServiceId;
		name: string;
	};

	type FinancialProfile = {
		creditScore: string;
		annualSalary: string;
		monthlyDebt: string;
		bankBalance: string;
		monthlyExpenses: string;
		savingsGoal: string;
	};

	type ProfileField = {
		key: keyof FinancialProfile;
		label: string;
		placeholder: string;
		impact: string;
		note: string;
	};

	type ProductCategory =
		| 'home-appliance'
		| 'electronics'
		| 'decorations'
		| 'games'
		| 'food'
		| 'clothing'
		| 'healthcare'
		| 'transportation'
		| 'education'
		| 'furniture'
		| 'subscription'
		| 'gift'
		| 'travel';

	type ProductOption = {
		id: ProductCategory;
		name: string;
		necessity: number;
		lifespan: string;
		risk: string;
	};

	type PurchaseInput = {
		name: string;
		cost: string;
		category: ProductCategory;
	};

	type PurchaseAssessment = {
		verdict: string;
		tone: StatusTone;
		necessity: string;
		impact: string;
		balanceAfter: string;
		workCost: string;
		pros: string[];
		cons: string[];
	};

	type SecurePayload = {
		salt: string;
		iv: string;
		data: string;
	};

	let activeService = $state<ServiceId>('dashboard');
	let menuOpen = $state(false);
	let savedAt = $state('');
	let profilePasscode = $state('');
	let securityStatus = $state('No encrypted profile saved');
	let hasSavedProfile = $state(false);
	let purchaseInput = $state<PurchaseInput>({
		name: '',
		cost: '',
		category: 'electronics'
	});

	const blankProfile: FinancialProfile = {
		creditScore: '',
		annualSalary: '',
		monthlyDebt: '',
		bankBalance: '',
		monthlyExpenses: '',
		savingsGoal: ''
	};

	let profile = $state<FinancialProfile>({ ...blankProfile });

	const services: Service[] = [
		{
			id: 'dashboard',
			name: 'Financial Dashboard'
		},
		{
			id: 'profile',
			name: 'Local Profile'
		},
		{
			id: 'purchase',
			name: 'Purchase Check'
		},
		{
			id: 'review',
			name: 'Glance Review'
		}
	];

	const selectService = (service: ServiceId) => {
		activeService = service;
		menuOpen = false;
	};

	const profileStorageKey = 'finsight-local-profile';
	const keyIterations = 250_000;
	const defaultHourlyIncome = 25.8;

	const productOptions: ProductOption[] = [
		{
			id: 'home-appliance',
			name: 'Home appliance',
			necessity: 8,
			lifespan: 'Long-term home use',
			risk: 'Repair or replacement urgency can justify cost'
		},
		{
			id: 'electronics',
			name: 'Electronics',
			necessity: 5,
			lifespan: 'Useful, but upgrades lose value fast',
			risk: 'Depreciates quickly'
		},
		{
			id: 'decorations',
			name: 'Decorations',
			necessity: 2,
			lifespan: 'Nice-to-have',
			risk: 'Easy to overspend on nonessential upgrades'
		},
		{
			id: 'games',
			name: 'Games',
			necessity: 2,
			lifespan: 'Entertainment value',
			risk: 'Best when paid from fun money'
		},
		{
			id: 'food',
			name: 'Food',
			necessity: 9,
			lifespan: 'Immediate need',
			risk: 'Frequent dining can quietly drain cash'
		},
		{
			id: 'clothing',
			name: 'Clothing',
			necessity: 6,
			lifespan: 'Depends on actual need',
			risk: 'Trendy items lose value fast'
		},
		{
			id: 'healthcare',
			name: 'Healthcare',
			necessity: 10,
			lifespan: 'Health and safety',
			risk: 'Delaying can create larger costs'
		},
		{
			id: 'transportation',
			name: 'Transportation',
			necessity: 8,
			lifespan: 'Work and mobility',
			risk: 'Maintenance and insurance can add up'
		},
		{
			id: 'education',
			name: 'Education',
			necessity: 7,
			lifespan: 'Skill-building',
			risk: 'Value depends on follow-through'
		},
		{
			id: 'furniture',
			name: 'Furniture',
			necessity: 5,
			lifespan: 'Longer-term home use',
			risk: 'Delivery and financing can raise cost'
		},
		{
			id: 'subscription',
			name: 'Subscription',
			necessity: 3,
			lifespan: 'Recurring cost',
			risk: 'Small monthly charges stack up'
		},
		{
			id: 'gift',
			name: 'Gift',
			necessity: 4,
			lifespan: 'Relationship value',
			risk: 'Set a limit before buying'
		},
		{
			id: 'travel',
			name: 'Travel',
			necessity: 3,
			lifespan: 'Experience value',
			risk: 'Flights, food, and lodging expand the real cost'
		}
	];

	const profileFields: ProfileField[] = [
		{
			key: 'creditScore',
			label: 'Credit score',
			placeholder: '720',
			impact: 'Loan readiness',
			note: 'Range 300-850'
		},
		{
			key: 'annualSalary',
			label: 'Annual salary',
			placeholder: '65000',
			impact: 'Monthly income',
			note: 'Before tax estimate'
		},
		{
			key: 'monthlyDebt',
			label: 'Monthly debts',
			placeholder: '850',
			impact: 'Debt ratio',
			note: 'Loans and cards'
		},
		{
			key: 'bankBalance',
			label: 'Bank balance',
			placeholder: '4250',
			impact: 'Cash runway',
			note: 'Checking and savings'
		},
		{
			key: 'monthlyExpenses',
			label: 'Monthly expenses',
			placeholder: '2800',
			impact: 'Money left',
			note: 'Bills and spending'
		},
		{
			key: 'savingsGoal',
			label: 'Savings goal',
			placeholder: '10000',
			impact: 'Goal progress',
			note: 'Current target'
		}
	];

	const parseMoney = (value: string) => Number(value.replaceAll(',', '')) || 0;

	const formatMoney = (value: number) =>
		new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(value);

	const selectedProduct = () =>
		productOptions.find((option) => option.id === purchaseInput.category) ?? productOptions[1];
	const monthlyIncome = () => parseMoney(profile.annualSalary) / 12;
	const monthlyLeft = () => monthlyIncome() - parseMoney(profile.monthlyDebt) - parseMoney(profile.monthlyExpenses);
	const debtRatio = () => (monthlyIncome() > 0 ? (parseMoney(profile.monthlyDebt) / monthlyIncome()) * 100 : 0);
	const runwayMonths = () =>
		parseMoney(profile.monthlyExpenses) > 0
			? parseMoney(profile.bankBalance) / parseMoney(profile.monthlyExpenses)
			: 0;
	const goalProgress = () =>
		parseMoney(profile.savingsGoal) > 0
			? Math.min((parseMoney(profile.bankBalance) / parseMoney(profile.savingsGoal)) * 100, 100)
			: 0;

	const updateProfile = (key: keyof FinancialProfile, value: string) => {
		profile = { ...profile, [key]: value };
	};

	const updatePurchase = (key: keyof PurchaseInput, value: string) => {
		purchaseInput = { ...purchaseInput, [key]: value };
	};

	const afterPurchaseBalance = () => parseMoney(profile.bankBalance) - parseMoney(purchaseInput.cost);
	const safeMonthlyLeft = () => (monthlyIncome() > 0 ? monthlyLeft() : 870);
	const hourlyIncome = () => (monthlyIncome() > 0 ? monthlyIncome() / 173 : defaultHourlyIncome);
	const purchaseWorkHours = () =>
		hourlyIncome() > 0 ? parseMoney(purchaseInput.cost) / hourlyIncome() : 0;

	const assessPurchase = (): PurchaseAssessment => {
		const itemName = purchaseInput.name.trim() || 'this purchase';
		const cost = parseMoney(purchaseInput.cost);
		const product = selectedProduct();
		const balance = parseMoney(profile.bankBalance);
		const balanceAfter = afterPurchaseBalance();
		const leftThisMonth = safeMonthlyLeft();
		const costShare = leftThisMonth > 0 ? cost / leftThisMonth : cost > 0 ? 2 : 0;
		const cashShare = balance > 0 ? cost / balance : 0;
		const needScore = product.necessity;
		const highNecessity = needScore >= 8;
		const mediumNecessity = needScore >= 5;
		const hasCost = cost > 0;
		const shouldAvoid = hasCost && (balanceAfter < 0 || costShare > 1.1 || (cashShare > 0.45 && !highNecessity));
		const shouldWait =
			hasCost && !shouldAvoid && (costShare > 0.45 || cashShare > 0.25 || (!mediumNecessity && costShare > 0.2));
		const tone: StatusTone = shouldAvoid ? 'danger' : shouldWait ? 'caution' : 'safe';
		const verdict = !hasCost
			? 'Add the price'
			: shouldAvoid
				? 'Do not buy yet'
				: shouldWait
					? 'Wait or find cheaper'
					: 'Buy is reasonable';
		const necessity = highNecessity ? 'Necessary' : mediumNecessity ? 'Useful' : 'Optional';
		const impact = !hasCost
			? 'Enter a cost to calculate the impact.'
			: balance
				? `${itemName} would leave ${formatMoney(balanceAfter)} in your bank balance.`
				: `${itemName} costs about ${purchaseWorkHours().toFixed(1)} work hours based on your income.`;

		const pros = [
			`${product.name} category: ${product.lifespan}.`,
			highNecessity ? 'This category can protect health, work, home, or basic needs.' : 'You can delay it without major immediate risk.',
			costShare <= 0.25 && hasCost ? 'It uses a manageable share of your monthly cushion.' : 'Comparing alternatives could lower the impact.'
		];
		const cons = [
			product.risk,
			hasCost ? `It costs about ${purchaseWorkHours().toFixed(1)} work hours.` : 'No price entered yet.',
			balance && balanceAfter < 0
				? 'It would push your current bank balance below zero.'
				: costShare > 0.45
					? 'It takes a large share of your available monthly money.'
					: 'It still reduces cash that could go to debt, savings, or emergencies.'
		];

		return {
			verdict,
			tone,
			necessity,
			impact,
			balanceAfter: hasCost && balance ? formatMoney(balanceAfter) : 'Needs profile',
			workCost: hasCost ? `${purchaseWorkHours().toFixed(1)} hrs` : 'Enter cost',
			pros,
			cons
		};
	};

	const encodeBytes = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));

	const decodeBytes = (value: string) =>
		Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

	const toArrayBuffer = (bytes: Uint8Array) =>
		bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

	const getProfileKey = async (passcode: string, salt: Uint8Array) => {
		const sourceKey = await crypto.subtle.importKey(
			'raw',
			new TextEncoder().encode(passcode),
			'PBKDF2',
			false,
			['deriveKey']
		);

		return crypto.subtle.deriveKey(
			{
				name: 'PBKDF2',
				salt: toArrayBuffer(salt),
				iterations: keyIterations,
				hash: 'SHA-256'
			},
			sourceKey,
			{ name: 'AES-GCM', length: 256 },
			false,
			['encrypt', 'decrypt']
		);
	};

	const encryptProfile = async (passcode: string, value: FinancialProfile) => {
		const salt = crypto.getRandomValues(new Uint8Array(16));
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const key = await getProfileKey(passcode, salt);
		const encryptedData = await crypto.subtle.encrypt(
			{ name: 'AES-GCM', iv: toArrayBuffer(iv) },
			key,
			new TextEncoder().encode(JSON.stringify(value))
		);

		return {
			salt: encodeBytes(salt),
			iv: encodeBytes(iv),
			data: encodeBytes(new Uint8Array(encryptedData))
		};
	};

	const decryptProfile = async (passcode: string, payload: SecurePayload) => {
		const salt = decodeBytes(payload.salt);
		const iv = decodeBytes(payload.iv);
		const key = await getProfileKey(passcode, salt);
		const decryptedData = await crypto.subtle.decrypt(
			{ name: 'AES-GCM', iv: toArrayBuffer(iv) },
			key,
			decodeBytes(payload.data)
		);

		return JSON.parse(new TextDecoder().decode(decryptedData)) as FinancialProfile;
	};

	const saveProfile = async () => {
		if (profilePasscode.length < 8) {
			securityStatus = 'Use at least 8 characters';
			return;
		}

		localStorage.setItem(profileStorageKey, JSON.stringify(await encryptProfile(profilePasscode, profile)));
		savedAt = new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
		securityStatus = 'Encrypted on this device';
		hasSavedProfile = true;
	};

	const unlockProfile = async () => {
		const storedProfile = localStorage.getItem(profileStorageKey);

		if (!storedProfile) {
			securityStatus = 'No encrypted profile saved';
			return;
		}

		try {
			profile = { ...blankProfile, ...(await decryptProfile(profilePasscode, JSON.parse(storedProfile))) };
			securityStatus = 'Unlocked for this session';
			savedAt = 'Saved locally';
		} catch {
			securityStatus = 'Passcode did not unlock data';
		}
	};

	const clearProfile = () => {
		profile = { ...blankProfile };
		savedAt = '';
		profilePasscode = '';
		securityStatus = 'No encrypted profile saved';
		hasSavedProfile = false;
		localStorage.removeItem(profileStorageKey);
	};

	onMount(() => {
		hasSavedProfile = Boolean(localStorage.getItem(profileStorageKey));
		securityStatus = hasSavedProfile ? 'Encrypted profile locked' : 'No encrypted profile saved';
	});

	const dashboardFacts: VerdictFact[] = [
		{
			value: '$4,250',
			label: 'balance'
		},
		{
			value: '$870',
			label: 'left this month'
		},
		{
			value: '$29/day',
			label: 'safe to spend'
		},
		{
			value: '72%',
			label: 'emergency fund'
		}
	];

	const dashboardMetrics: Metric[] = [
		{
			value: '$870',
			label: 'Month left',
			context: 'After bills and goals',
			tone: 'safe'
		},
		{
			value: '$29/day',
			label: 'Daily limit',
			context: 'Spend this and stay covered',
			tone: 'caution'
		},
		{
			value: '$2,800',
			label: 'Fund gap',
			context: 'To reach your emergency target',
			tone: 'safe'
		}
	];

	const purchaseFacts: VerdictFact[] = [
		{
			value: '57 hours',
			label: 'work cost'
		},
		{
			value: '$2,780',
			label: 'balance after'
		},
		{
			value: '2 months',
			label: 'goal delay'
		}
	];

	const purchaseMetrics: Metric[] = [
		{
			value: '57 hours',
			label: 'Work cost',
			context: 'This is almost 1.5 work weeks',
			tone: 'caution'
		},
		{
			value: '$2,780',
			label: 'After buy',
			context: 'Your balance stays positive',
			tone: 'safe'
		},
		{
			value: '2 months',
			label: 'Goal delay',
			context: 'Japan trip moves back',
			tone: 'caution'
		}
	];

	const scenarios: Scenario[] = [
		{
			option: 'Buy today',
			result: '$2,780 left',
			timeCost: '57 hours',
			verdict: 'Caution',
			tone: 'caution'
		},
		{
			option: 'Wait 45 days',
			result: '$3,640 left',
			timeCost: '34 hours',
			verdict: 'Best move',
			tone: 'safe'
		},
		{
			option: 'Buy used',
			result: '$3,520 left',
			timeCost: '28 hours',
			verdict: 'Safe',
			tone: 'safe'
		},
		{
			option: 'Skip it',
			result: '+$1,470 saved',
			timeCost: '0 hours',
			verdict: 'Future win',
			tone: 'safe'
		}
	];

	const checklist = [
		'Can the user understand the main answer in under 3 seconds?',
		'Is there one obvious primary action?',
		'Are there fewer than 5 key numbers above the fold?',
		'Is the most important number the largest?',
		'Are warnings impossible to miss?',
		'Are details available but not forced?'
	];
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

	{#if activeService === 'dashboard'}
	<section class="screen service-screen" aria-labelledby="dashboard-title">
		<div class="question-heading compact-heading">
			<p class="eyebrow">Dashboard</p>
			<h2 id="dashboard-title">Am I financially okay right now?</h2>
		</div>

		<article class="verdict-card tone-safe">
			<div class="verdict-main">
				<p class="status-label">Safe</p>
				<p class="verdict-copy">You are covered this month.</p>
			</div>
			<div class="verdict-facts" aria-label="Dashboard summary">
				{#each dashboardFacts as fact}
					<div>
						<strong>{fact.value}</strong>
						<span>{fact.label}</span>
					</div>
				{/each}
			</div>
		</article>

		<div class="metric-grid dashboard-grid" aria-label="Financial snapshot">
			{#each dashboardMetrics as metric}
				<article class={`metric-card tone-${metric.tone ?? 'safe'}`}>
					<strong>{metric.value}</strong>
					<p>{metric.label}</p>
					<span>{metric.context}</span>
				</article>
			{/each}
		</div>

		<section class="details-panel compact-panel detail-section" aria-labelledby="fund-title">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Details</p>
					<h3 id="fund-title">Emergency fund: 72%</h3>
				</div>
				<span class="pill tone-safe">$2,800 to go</span>
			</div>
			<div class="progress-track" aria-label="Emergency fund progress">
				<div class="progress-fill" style="width: 72%"></div>
			</div>
			<details>
				<summary>Show emergency fund details</summary>
				<p>$7,200 saved toward a $10,000 target. At the current pace, this stays on track.</p>
			</details>
		</section>
	</section>
	{/if}

	{#if activeService === 'profile'}
	<section class="screen service-screen" aria-labelledby="profile-title">
		<div class="section-heading profile-heading">
			<div>
				<p class="eyebrow">Local profile</p>
				<h2 id="profile-title">Your financial data</h2>
			</div>
			<span class="privacy-pill">Device only</span>
		</div>

		<div class="profile-layout">
			<form class="profile-form" onsubmit={(event) => event.preventDefault()}>
				<div class="profile-sheet" role="table" aria-label="Editable local financial data">
					<div class="sheet-row sheet-head" role="row">
						<span role="columnheader">Data</span>
						<span role="columnheader">Value</span>
						<span role="columnheader">Used for</span>
						<span role="columnheader">Note</span>
					</div>
					{#each profileFields as field}
						<div class="sheet-row" role="row">
							<span class="sheet-label" role="cell">{field.label}</span>
							<span role="cell">
								<input
									aria-label={field.label}
									type="number"
									inputmode="decimal"
									min="0"
									placeholder={field.placeholder}
									value={profile[field.key]}
									oninput={(event) =>
										updateProfile(field.key, event.currentTarget.value)}
								/>
							</span>
							<span role="cell">{field.impact}</span>
							<span role="cell">{field.note}</span>
						</div>
					{/each}
				</div>

				<div class="security-row">
					<label>
						<span>Local passcode</span>
						<input
							type="password"
							autocomplete="current-password"
							placeholder="8+ characters"
							bind:value={profilePasscode}
						/>
					</label>
					<p>{securityStatus}</p>
				</div>

				<div class="profile-actions">
					{#if hasSavedProfile}
						<button class="secondary-action" type="button" onclick={unlockProfile}>Unlock</button>
					{/if}
					<button class="primary-action" type="button" onclick={saveProfile}>Encrypt save</button>
					<button class="secondary-action" type="button" onclick={clearProfile}>Clear data</button>
				</div>
			</form>

			<aside class="profile-summary" aria-label="Local profile summary">
				<div>
					<span>Monthly income</span>
					<strong>{formatMoney(monthlyIncome())}</strong>
				</div>
				<div>
					<span>Money left</span>
					<strong>{formatMoney(monthlyLeft())}</strong>
				</div>
				<div>
					<span>Debt ratio</span>
					<strong>{debtRatio().toFixed(1)}%</strong>
				</div>
				<div>
					<span>Cash runway</span>
					<strong>{runwayMonths().toFixed(1)} mo</strong>
				</div>
				<div>
					<span>Goal progress</span>
					<strong>{goalProgress().toFixed(0)}%</strong>
				</div>
				<p class="local-status">{savedAt || 'Not saved yet'}</p>
			</aside>
		</div>
	</section>
	{/if}

	{#if activeService === 'purchase'}
	{@const purchaseAssessment = assessPurchase()}
	<section class="screen service-screen" aria-labelledby="purchase-title">
		<div class="question-heading compact-heading">
			<p class="eyebrow">Purchase check</p>
			<h2 id="purchase-title">Should I buy this?</h2>
		</div>

		<section class="purchase-input-panel" aria-label="Purchase details">
			<label>
				<span>What do you want to buy?</span>
				<input
					type="text"
					placeholder="Laptop, couch, dinner, headphones"
					value={purchaseInput.name}
					oninput={(event) => updatePurchase('name', event.currentTarget.value)}
				/>
			</label>
			<label>
				<span>How much does it cost?</span>
				<input
					type="number"
					inputmode="decimal"
					min="0"
					placeholder="1470"
					value={purchaseInput.cost}
					oninput={(event) => updatePurchase('cost', event.currentTarget.value)}
				/>
			</label>
			<label>
				<span>Product type</span>
				<select
					value={purchaseInput.category}
					onchange={(event) => updatePurchase('category', event.currentTarget.value)}
				>
					{#each productOptions as option}
						<option value={option.id}>{option.name}</option>
					{/each}
				</select>
			</label>
		</section>

		<article class={`verdict-card tone-${purchaseAssessment.tone}`}>
			<div class="verdict-main">
				<p class="status-label purchase-status">{purchaseAssessment.verdict}</p>
				<p class="verdict-copy">{purchaseAssessment.impact}</p>
				<div class="action-strip">
					<span>Necessity</span>
					<strong>{purchaseAssessment.necessity}</strong>
				</div>
			</div>
			<div class="verdict-facts" aria-label="Purchase result summary">
				<div>
					<strong>{purchaseAssessment.workCost}</strong>
					<span>work cost</span>
				</div>
				<div>
					<strong>{purchaseAssessment.balanceAfter}</strong>
					<span>balance after</span>
				</div>
				<div>
					<strong>{selectedProduct().name}</strong>
					<span>category</span>
				</div>
			</div>
		</article>

		<div class="pros-cons-grid" aria-label="Purchase pros and cons">
			<section class="details-panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Pros</p>
						<h3>What helps this purchase</h3>
					</div>
				</div>
				<ul class="decision-list">
					{#each purchaseAssessment.pros as pro}
						<li>{pro}</li>
					{/each}
				</ul>
			</section>

			<section class="details-panel">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Cons</p>
						<h3>What to watch</h3>
					</div>
				</div>
				<ul class="decision-list">
					{#each purchaseAssessment.cons as con}
						<li>{con}</li>
					{/each}
				</ul>
			</section>
		</div>

		<section class="details-panel detail-section" aria-labelledby="alternatives-title">
			<div class="panel-heading">
				<div>
					<p class="eyebrow">Alternatives</p>
					<h3 id="alternatives-title">Best option: wait 45 days</h3>
				</div>
				<span class="pill tone-safe">Safe</span>
			</div>

			<div class="comparison-table" role="table" aria-label="Purchase scenarios">
				<div class="table-row table-head" role="row">
					<span role="columnheader">Option</span>
					<span role="columnheader">Result</span>
					<span role="columnheader">Time cost</span>
					<span role="columnheader">Verdict</span>
				</div>
				{#each scenarios as scenario}
					<div class="table-row" role="row">
						<span class="option-cell" role="cell">{scenario.option}</span>
						<span role="cell">{scenario.result}</span>
						<span role="cell">{scenario.timeCost}</span>
						<span role="cell" class={`pill tone-${scenario.tone}`}>{scenario.verdict}</span>
					</div>
				{/each}
			</div>
		</section>

		<div class="split-layout detail-section">
			<section class="details-panel" aria-labelledby="future-title">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Future impact</p>
						<h3 id="future-title">Skipping saves more</h3>
					</div>
					<strong class="future-number">$4,980</strong>
				</div>
				<div class="simple-chart" aria-label="$1,470 can become $4,980 in 15 years">
					<div class="bar current">
						<small>Today</small>
						<span>$1,470</span>
					</div>
					<div class="bar future">
						<small>15 years</small>
						<span>$4,980</span>
					</div>
				</div>
				<p class="short-note">Investing instead could add about $3,510 over 15 years.</p>
			</section>

			<section class="details-panel" aria-labelledby="details-title">
				<div class="panel-heading">
					<div>
						<p class="eyebrow">Details</p>
						<h3 id="details-title">Calculations</h3>
					</div>
				</div>
				<details>
					<summary>Show work-hour math</summary>
					<p>$1,470 purchase / $25.80 after-tax hourly income = 57 work hours.</p>
				</details>
				<details>
					<summary>Show goal delay math</summary>
					<p>Buying today reduces your monthly goal contribution by $735 for 2 months.</p>
				</details>
				<details>
					<summary>Show investment assumption</summary>
					<p>Projection uses a 15-year period and 8.5% average annual return.</p>
				</details>
			</section>
		</div>
	</section>
	{/if}

	{#if activeService === 'review'}
	<section class="screen service-screen review-screen" aria-labelledby="review-title">
		<div class="section-heading">
			<p class="eyebrow">Internal review</p>
			<h2 id="review-title">Glance score checklist</h2>
		</div>

		<ul class="checklist">
			{#each checklist as item}
				<li>
					<span aria-hidden="true">Pass</span>
					{item}
				</li>
			{/each}
		</ul>
	</section>
	{/if}
</main>
