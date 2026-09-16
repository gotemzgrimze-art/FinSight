<script lang="ts">
	import type { Snippet } from 'svelte';
	let { title, ready, children }: { title: string; ready: boolean; children: Snippet } = $props();
</script>

<svelte:head><title>{title} · FinSight</title>{#if !ready}<meta name="robots" content="noindex" />{/if}</svelte:head>
<main class="legal-page">
	<a class="back" href="/">← FinSight</a>
	<article>
		<h1>{title}</h1>
		<p class="version">Version: September 15, 2026</p>
		{#if !ready}<p class="draft" role="status">Draft for review. Operator details and publication are pending. Account creation is unavailable until these policies are finalized.</p>{/if}
		{@render children()}
	</article>
	<nav aria-label="Legal navigation"><a href="/terms">Terms of Service</a><a href="/privacy">Privacy Policy</a><a href="/signup">Create Account</a></nav>
</main>

<style>
	.legal-page { width: min(100% - 32px, 780px); margin: 0 auto; padding: 36px 0; line-height: 1.75; color: #243044; overflow-wrap: anywhere; }
	article { margin: 24px 0; padding: clamp(20px, 5vw, 44px); border: 1px solid #dde3eb; border-radius: 12px; background: white; }
	h1 { font-size: clamp(1.8rem, 5vw, 2.5rem); font-weight: 750; line-height: 1.2; color: #101828; }
	.version { color: #536174; font-size: .9rem; }
	.draft { padding: 16px; background: #fff8e9; color: #754400; border-radius: 8px; border: 1px solid #e5be7d; }
	.legal-page :global(h2) { margin: 28px 0 8px; font-size: 1.2rem; font-weight: 750; color: #101828; }
	.legal-page :global(p) { margin-block: 12px; }
	.legal-page :global(a) { color: #075f42; text-decoration: underline; text-underline-offset: 3px; }
	.legal-page :global(a:focus-visible) { outline: 3px solid #11845b; outline-offset: 3px; }
	.legal-page :global(ul) { padding-left: 24px; list-style: disc; }
	nav { display: flex; flex-wrap: wrap; gap: 24px; }
</style>
