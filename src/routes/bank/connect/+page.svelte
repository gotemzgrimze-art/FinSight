<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data, form }: { data: { user: { email: string; emailVerified: boolean } | null }; form?: { message?: string; session?: { linkToken: string; demo: boolean } } } = $props();
</script>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<p class="eyebrow">Read-only bank connection</p>
		<h2>Connect your accounts</h2>
		<p class="short-note">Connect financial accounts to automatically analyze balances, income, and spending. The local provider is mock-only and cannot move money.</p>
		<form method="POST" action="?/connect" class="segmented-actions">
			<button class="primary-action" type="submit">Connect Bank</button>
			<a class="secondary-action" href="/onboarding">Continue Manually</a>
		</form>
		{#if form?.message}<div class="notice-panel success-panel">{form.message} {form.session?.demo ? 'Synthetic data only.' : ''}</div>{/if}
	</section>
</main>
