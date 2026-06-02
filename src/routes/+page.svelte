<script lang="ts">
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
		<a class="ghost-link" href="#buy-check">Check purchase</a>
	</header>

	<section class="screen" aria-labelledby="dashboard-title">
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

	<section class="screen" id="buy-check" aria-labelledby="purchase-title">
		<div class="question-heading compact-heading">
			<p class="eyebrow">Purchase check</p>
			<h2 id="purchase-title">Should I buy this?</h2>
		</div>

		<article class="verdict-card tone-caution">
			<div class="verdict-main">
				<p class="status-label">Caution</p>
				<p class="verdict-copy">
					You can afford it, but it delays your Japan trip.
				</p>
				<div class="action-strip">
					<span>Better move</span>
					<strong>Wait 45 days</strong>
				</div>
			</div>
			<div class="verdict-facts" aria-label="Purchase result summary">
				{#each purchaseFacts as fact}
					<div>
						<strong>{fact.value}</strong>
						<span>{fact.label}</span>
					</div>
				{/each}
			</div>
		</article>

		<div class="metric-grid three-up" aria-label="Purchase impact">
			{#each purchaseMetrics as metric}
				<article class={`metric-card tone-${metric.tone ?? 'safe'}`}>
					<strong>{metric.value}</strong>
					<p>{metric.label}</p>
					<span>{metric.context}</span>
				</article>
			{/each}
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

	<section class="screen review-screen" aria-labelledby="review-title">
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
</main>
