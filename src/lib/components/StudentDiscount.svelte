<script lang="ts">
	let {
		isVerified,
		onVerify
	}: {
		isVerified: boolean;
		onVerify: () => void;
	} = $props();
</script>

<section class="details-panel">
	<div class="panel-heading">
		<div>
			<p class="eyebrow">Student discount</p>
			<h3>{isVerified ? 'Mock verified' : 'Mock verification'}</h3>
		</div>
		<button class="secondary-action" type="button" onclick={onVerify}>Verify</button>
	</div>
	<p class="short-note">
		This is not real student verification. It only toggles the discounted student tier for the MVP prototype.
	</p>
</section>
