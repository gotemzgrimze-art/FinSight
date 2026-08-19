<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data }: { data: { user: { email: string; emailVerified: boolean } | null; account: { email: string; emailVerified: boolean; name: string } } } = $props();
</script>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<p class="eyebrow">Profile</p>
		<h2>Account settings</h2>
		<div class="details-panel">
			<p><strong>{data.account.name}</strong></p>
			<p class="short-note">{data.account.email} · {data.account.emailVerified ? 'Verified' : 'Not verified'}</p>
			<div class="segmented-actions"><a class="secondary-action" href="/settings/security">Security</a><a class="secondary-action" href="/settings/privacy">Privacy</a><a class="secondary-action" href="/onboarding">Edit financial profile</a></div>
		</div>
	</section>
</main>
