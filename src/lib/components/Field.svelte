<script lang="ts">
	/**
	 * Дизайны `Field` компонент: шошго + хайрцаг (утга, нэгж) + алдааны сануулга.
	 * Сануулга зөвхөн алдаатай үед харагдана.
	 */
	interface Props {
		id: string;
		label: string;
		value: string;
		unit: string;
		inputmode?: 'numeric' | 'decimal';
		invalid?: boolean;
		hint?: string;
		oninput: (event: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		id,
		label,
		value,
		unit,
		inputmode = 'numeric',
		invalid = false,
		hint = '',
		oninput
	}: Props = $props();

	const hintId = `${id}-hint`;
</script>

<div class="field">
	<label class="field-label" for={id}>{label}</label>
	<div class="field-box" class:invalid>
		<input
			{id}
			class="field-value"
			type="text"
			{inputmode}
			autocomplete="off"
			spellcheck="false"
			{value}
			aria-invalid={invalid}
			aria-describedby={invalid && hint ? hintId : undefined}
			{oninput}
		/>
		<span class="field-unit" aria-hidden="true">{unit}</span>
	</div>
	{#if invalid && hint}
		<p class="field-hint" id={hintId}>{hint}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	.field-label {
		font-size: var(--text-label);
		font-weight: 500;
		line-height: 1.3;
		color: var(--ink-muted);
	}

	.field-box {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		min-width: 0;
		padding: 14px 16px;
		background: var(--surface);
		border: 1px solid var(--border-strong);
		border-radius: var(--radius-md);
	}

	.field-box:focus-within {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}

	.field-box.invalid {
		background: var(--surface-danger-soft);
		border-color: var(--danger);
	}

	.field-box.invalid:focus-within {
		box-shadow: none;
	}

	.field-value {
		flex: 1 1 auto;
		width: 100%;
		min-width: 0;
		padding: 0;
		margin: 0;
		background: transparent;
		border: 0;
		outline: none;
		color: var(--ink);
		font-size: var(--text-input);
		font-weight: 600;
		line-height: 1.2;
		font-variant-numeric: tabular-nums;
	}

	.field-unit {
		flex: 0 0 auto;
		color: var(--ink-muted);
		font-size: var(--text-body);
		font-weight: 500;
		line-height: 1.2;
	}

	.field-hint {
		margin: 0;
		color: var(--danger);
		font-size: var(--text-hint);
		font-weight: normal;
		line-height: 1.4;
		overflow-wrap: anywhere;
	}
</style>
