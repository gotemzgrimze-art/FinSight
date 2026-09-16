<script lang="ts">
	import AuthShell from '$lib/components/AuthShell.svelte';
	import type { PageProps } from './$types';
	let { data }: PageProps = $props();
</script>

<AuthShell title="Forgot your email?" subtitle="A few ways to find the email you used for FinSight.">
	<p class="auth-copy">Check your password manager or search your inboxes for a FinSight confirmation email. Your saved login may include your email address.</p>
	<p class="auth-copy">For your privacy, we cannot display an account’s email from a username. You can request a password reset for an address you own; if it matches an account, a reset email will arrive there.</p>
	<p class="auth-copy"><a class="auth-link" href="/forgot-password">Try a password reset</a></p>
	{#if data.auth.legal.email}
		<p class="auth-copy">Still need help? <a class="auth-link" href={`mailto:${data.auth.legal.email}`}>Contact support</a>. Never send your password or recovery links.</p>
	{/if}
	<a class="auth-link" href="/login">Back to Sign In</a>
</AuthShell>
