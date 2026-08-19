<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data, form }: { data: { user: { email: string; emailVerified: boolean } | null; hasDatabase: boolean; storedData: string[]; exportJson: string }; form?: { error?: string; message?: string } } = $props();
</script>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<p class="eyebrow">Privacy</p>
		<h2>Financial data controls</h2>
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		{#if form?.message}<div class="notice-panel success-panel">{form.message}</div>{/if}
		<section class="details-panel">
			<h3>Stored data</h3>
			<ul class="decision-list">{#each data.storedData as item}<li>{item}</li>{/each}</ul>
			<p class="short-note">FinSight stores this information to calculate cash-flow projections and explain purchase impact. Third-party analytics must not receive sensitive financial amounts.</p>
		</section>
		<section class="details-panel">
			<h3>Export data</h3>
			<textarea readonly rows="12">{data.exportJson || 'No persisted financial model is available yet.'}</textarea>
		</section>
		<section class="details-panel">
			<h3>Delete financial data</h3>
			<p class="short-note">This removes financial records but does not delete the authentication account. Account deletion and legal retention rules need product/legal review before launch.</p>
			<form method="POST" action="?/deleteFinancialData"><button class="secondary-action" type="submit">Delete financial data</button></form>
		</section>
	</section>
</main>
