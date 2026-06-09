<script lang="ts">
	import type { FinancialProfile, Goal } from '$lib/models';

	type Props = {
		profile: FinancialProfile;
		profilePasscode: string;
		securityStatus: string;
		savedAt: string;
		hasSavedProfile: boolean;
		onProfileField: (key: keyof Omit<FinancialProfile, 'goals' | 'debts' | 'allowances'>, value: string) => void;
		onGoalChange: (goal: Goal) => void;
		onAddGoal: () => void;
		onRemoveGoal: (id: string) => void;
		onPasscode: (value: string) => void;
		onSave: () => void;
		onUnlock: () => void;
		onClear: () => void;
	};

	let {
		profile,
		profilePasscode,
		securityStatus,
		savedAt,
		hasSavedProfile,
		onProfileField,
		onGoalChange,
		onAddGoal,
		onRemoveGoal,
		onPasscode,
		onSave,
		onUnlock,
		onClear
	}: Props = $props();

	const fields = [
		['creditScore', 'Credit score', '720', 'Loan readiness'],
		['annualSalary', 'Annual salary', '65000', 'Monthly income'],
		['bankBalance', 'Bank balance', '4250', 'Cash runway'],
		['monthlyExpenses', 'Monthly expenses', '2800', 'Money left'],
		['workHoursPerMonth', 'Work hours/month', '173', 'Work-hour cost'],
		['investmentReturnRate', 'Investment return %', '8.5', 'Future value']
	] as const;
</script>

<section class="details-panel">
	<div class="section-heading profile-heading">
		<div>
			<p class="eyebrow">Local profile</p>
			<h2>Customer financial data</h2>
		</div>
		<span class="privacy-pill">Device only</span>
	</div>

	<form class="profile-form" onsubmit={(event) => event.preventDefault()}>
		<div class="profile-sheet" role="table" aria-label="Editable local financial data">
			<div class="sheet-row sheet-head" role="row">
				<span role="columnheader">Data</span>
				<span role="columnheader">Value</span>
				<span role="columnheader">Used for</span>
			</div>
			{#each fields as field}
				<div class="sheet-row" role="row">
					<span class="sheet-label" role="cell">{field[1]}</span>
					<span role="cell">
						<input
							aria-label={field[1]}
							type="number"
							inputmode="decimal"
							min="0"
							placeholder={field[2]}
							value={profile[field[0]]}
							oninput={(event) => onProfileField(field[0], event.currentTarget.value)}
						/>
					</span>
					<span role="cell">{field[3]}</span>
				</div>
			{/each}
		</div>

		<div class="section-heading tight-heading">
			<div>
				<p class="eyebrow">Goals</p>
				<h3>Savings targets</h3>
			</div>
			<button class="secondary-action" type="button" onclick={onAddGoal}>Add goal</button>
		</div>

		<div class="stack-list">
			{#each profile.goals as goal}
				<div class="mini-grid">
					<input
						aria-label="Goal name"
						placeholder="Goal"
						value={goal.name}
						oninput={(event) => onGoalChange({ ...goal, name: event.currentTarget.value })}
					/>
					<input
						aria-label="Goal target"
						type="number"
						min="1"
						placeholder="Target"
						value={goal.targetAmount}
						oninput={(event) => onGoalChange({ ...goal, targetAmount: event.currentTarget.value })}
					/>
					<input
						aria-label="Goal saved"
						type="number"
						min="0"
						placeholder="Saved"
						value={goal.currentAmount}
						oninput={(event) => onGoalChange({ ...goal, currentAmount: event.currentTarget.value })}
					/>
					<input
						aria-label="Goal contribution"
						type="number"
						min="0"
						placeholder="Monthly"
						value={goal.monthlyContribution}
						oninput={(event) => onGoalChange({ ...goal, monthlyContribution: event.currentTarget.value })}
					/>
					<button class="secondary-action" type="button" onclick={() => onRemoveGoal(goal.id)}>Remove</button>
				</div>
			{/each}
		</div>

		<div class="security-row">
			<label>
				<span>Local passcode</span>
				<input
					type="password"
					autocomplete="current-password"
					placeholder="8+ characters"
					value={profilePasscode}
					oninput={(event) => onPasscode(event.currentTarget.value)}
				/>
			</label>
			<p>{securityStatus}</p>
		</div>

		<div class="profile-actions">
			{#if hasSavedProfile}
				<button class="secondary-action" type="button" onclick={onUnlock}>Unlock</button>
			{/if}
			<button class="primary-action" type="button" onclick={onSave}>Encrypt save</button>
			<button class="secondary-action" type="button" onclick={onClear}>Clear data</button>
		</div>
		<p class="local-status">{savedAt || 'Not saved yet'}</p>
	</form>
</section>
