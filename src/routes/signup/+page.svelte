<script lang="ts">
	import AuthShell from '$lib/components/AuthShell.svelte';
	import AuthForm from '$lib/components/AuthForm.svelte';
	import type { PageProps } from './$types';
	let { data, form }: PageProps = $props();
</script>

<AuthShell title="Create your account" subtitle="Start with a clearer view of your money.">
	<AuthForm mode="signup" {form} {...data.auth} />
</AuthShell>
