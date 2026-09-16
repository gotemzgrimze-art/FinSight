<script lang="ts">
	import AuthShell from '$lib/components/AuthShell.svelte';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<AuthShell title="Reset your password" subtitle="Enter your email and we’ll send you a reset link.">
	<AuthForm mode="forgot-password" {form} {...data.auth} />
</AuthShell>
