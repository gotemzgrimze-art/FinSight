<script lang="ts">
	import AppNavigation from '$lib/components/AppNavigation.svelte';
	let { data, form }: { data: { user: { email: string; emailVerified: boolean } | null; account: { email: string; emailVerified: boolean }; sessions: Array<{ id: string; expiresAt: Date; userAgent?: string | null; ipAddress?: string | null }> }; form?: { error?: string; message?: string } } = $props();
</script>

<main class="app-shell">
	<AppNavigation user={data.user} />
	<section class="screen service-screen">
		<p class="eyebrow">Security</p>
		<h2>Account protection</h2>
		{#if form?.error}<div class="notice-panel">{form.error}</div>{/if}
		{#if form?.message}<div class="notice-panel success-panel">{form.message}</div>{/if}
		<div class="details-panel"><div class="table-row"><span>Email</span><span>{data.account.email}</span><span>{data.account.emailVerified ? 'Verified' : 'Not verified'}</span></div><div class="table-row"><span>Two-factor authentication</span><span>Architecture enabled</span><span>Provider UX pending</span></div><div class="table-row"><span>Recovery codes</span><span>Supported by auth provider</span><span>Setup pending</span></div></div>
		<form method="POST" action="?/changePassword" class="details-panel auth-form"><h3>Change password</h3><label><span>Current password</span><input name="currentPassword" type="password" autocomplete="current-password" required /></label><label><span>New password</span><input name="newPassword" type="password" autocomplete="new-password" minlength="12" required /></label><button class="primary-action" type="submit">Change password</button></form>
		<section class="details-panel"><div class="panel-heading"><h3>Active sessions</h3><form method="POST" action="?/logoutAll"><button class="secondary-action" type="submit">Logout all sessions</button></form></div>{#each data.sessions as session}<p class="short-note">{session.userAgent ?? 'Unknown device'} · expires {new Date(session.expiresAt).toLocaleDateString()}</p>{:else}<p class="short-note">Session list unavailable until the auth database is configured.</p>{/each}</section>
	</section>
</main>
