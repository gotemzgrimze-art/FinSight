<script lang="ts">
	type NavItem = {
		id: string;
		name: string;
		kicker: string;
		icon: string;
	};

	let {
		items,
		activeItem,
		onSelect
	}: {
		items: NavItem[];
		activeItem: string;
		onSelect: (id: string) => void;
	} = $props();
</script>

<nav class="app-nav" aria-label="FinSight sections">
	{#each items as item}
		<button
			type="button"
			class:active-nav={activeItem === item.id}
			aria-current={activeItem === item.id ? 'page' : undefined}
			onclick={() => onSelect(item.id)}
		>
			<span class="nav-icon" aria-hidden="true">{item.icon}</span>
			<span>
				<strong>{item.name}</strong>
				<small>{item.kicker}</small>
			</span>
		</button>
	{/each}
</nav>
