<script lang="ts">
	import AuthShell from '$lib/components/AuthShell.svelte';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import { page } from '$app/state';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<AuthShell title="Welcome back" subtitle="Sign in to your FinSight account.">
	{#if page.url.searchParams.get('confirmation') === 'failed'}
		<p class="auth-copy" role="alert">This confirmation link is invalid or expired. Request a new password reset link, or try signing up again.</p>
	{/if}

	<AuthForm mode="login" {form} {...data.auth} />
</AuthShell>
