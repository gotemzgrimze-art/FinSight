<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data }: { data: { user: { email: string; emailVerified: boolean } | null } } = $props();
</script>

<svelte:head>
	<title>FinSight</title>
	<meta name="description" content="Financial decision-support tools that calculate and explain purchase impact." />
</svelte:head>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen public-hero">
		<div class="question-heading compact-heading">
			<p class="eyebrow">FinSight</p>
			<h1>Calculate the impact before making a financial decision.</h1>
			<p class="disclaimer">FinSight provides financial information and decision-support tools. Results are estimates based on available data, not guarantees or financial advice.</p>
			<div class="segmented-actions">
				<a class="primary-action" href={data.user ? '/dashboard' : '/signup'}>{data.user ? 'Open dashboard' : 'Create account'}</a>
				<a class="secondary-action" href="/login">Log in</a>
			</div>
		</div>
		<div class="metric-grid three-up">
			<article class="metric-card tone-safe"><strong>Read-only</strong><p>Bank architecture</p><span>No money movement.</span></article>
			<article class="metric-card tone-caution"><strong>Deterministic</strong><p>Impact engine</p><span>Auditable reason codes.</span></article>
			<article class="metric-card tone-safe"><strong>Private</strong><p>Data controls</p><span>Export and delete foundation.</span></article>
		</div>
	</section>
	<section id="how" class="details-panel"><p class="eyebrow">How It Works</p><p class="short-note">FinSight combines accounts, income, expenses, debt, goals, emergency reserves, and cash-flow projections into an explainable purchase-impact result.</p></section>
	<section id="security" class="details-panel"><p class="eyebrow">Security</p><p class="short-note">Authentication uses provider-managed password hashing, server sessions, HttpOnly cookies, email verification, password reset, and a two-factor architecture.</p></section>
	<section id="about" class="details-panel"><p class="eyebrow">About</p><p class="short-note">FinSight is not a bank and does not move money. Bank integrations are designed to be read-only.</p></section>
</main>
