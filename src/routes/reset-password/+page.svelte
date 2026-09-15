<script lang="ts">
	import AuthShell from '$lib/components/AuthShell.svelte';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<AuthShell title="Choose a new password" subtitle="Set a new password for your FinSight account.">
	<AuthForm mode="reset-password" {form} {...data.auth} />
</AuthShell>
