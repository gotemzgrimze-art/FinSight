<script lang="ts">
	let { user }: { user: { email: string; emailVerified: boolean } | null } = $props();
</script>

<header class="platform-nav">
	<a class="brand-link" href="/">FinSight</a>
	<nav>
		{#if user}
			<a href="/dashboard">Overview</a>
			<a href="/cash-flow">Cash Flow</a>
			<a href="/transactions">Transactions</a>
			<a href="/purchase-check">Purchase Check</a>
			<a href="/settings">Profile</a>
			<form method="POST" action="/logout"><button type="submit">Log Out</button></form>
		{:else}
			<a href="/#how">How It Works</a>
			<a href="/#security">Security</a>
			<a href="/#about">About</a>
			<a href="/login">Log In</a>
			<a class="primary-nav" href="/signup">Create Account</a>
		{/if}
	</nav>
</header>
