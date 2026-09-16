<script lang="ts">
	import type { Snippet } from 'svelte';
	let { title, subtitle, children }: { title: string; subtitle: string; children: Snippet } = $props();
</script>

<svelte:head><title>{title} · FinSight</title><meta name="robots" content="noindex" /></svelte:head>

<main class="auth-shell">
	<a class="auth-brand" href="/" aria-label="FinSight home"><span aria-hidden="true">F</span> FinSight</a>
	<section class="auth-card" aria-labelledby="auth-heading">
		<p class="auth-eyebrow">A clearer view of your money</p>
		<h1 id="auth-heading">{title}</h1>
		<p class="auth-subtitle">{subtitle}</p>
		{@render children()}
	</section>
	<footer><a href="/terms">Terms of Service</a><span aria-hidden="true">·</span><a href="/privacy">Privacy Policy</a></footer>
</main>

<style>
	.auth-shell { width: min(100% - 32px, 460px); margin: 0 auto; padding: clamp(24px, 7vh, 72px) 0 32px; }
	.auth-brand { display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 28px; font-size: 1.4rem; font-weight: 800; }
	.auth-brand span { display: grid; place-items: center; width: 38px; height: 38px; background: #075f42; color: white; border-radius: 10px; }
	.auth-card { background: white; border: 1px solid #dde3eb; border-radius: 16px; padding: clamp(20px, 5vw, 36px); box-shadow: 0 12px 36px #10182808; }
	.auth-eyebrow { margin: 0 0 12px; color: #075f42; font-size: .72rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
	h1 { margin: 0; font-size: 1.9rem; font-weight: 750; letter-spacing: -.04em; line-height: 1.2; }
	.auth-subtitle { color: #536174; line-height: 1.55; margin: 12px 0 26px; }
	footer { display: flex; justify-content: center; flex-wrap: wrap; gap: 14px; margin-top: 24px; font-size: .85rem; color: #536174; }
	footer a { padding: 8px 0; text-decoration: underline; text-underline-offset: 3px; }
	footer span { align-self: center; }
	.auth-shell :global(a:focus-visible), .auth-shell :global(button:focus-visible) { outline: 3px solid #11845b; outline-offset: 3px; }
	.auth-shell :global(.auth-link) { color: #075f42; font-weight: 650; text-decoration: underline; text-underline-offset: 3px; }
	.auth-shell :global(.auth-copy) { line-height: 1.6; color: #536174; margin: 16px 0; }
</style>
