<script lang="ts">
	import type { RepaymentType } from '$lib/loan';

	/**
	 * Дизайны `Field — Эргэн төлөлтийн төрөл`: шошго + сегмент товчлуур + тайлбар.
	 * Native radio ашигласан тул сум, хоосон зайгаар сонголт солигдож, дэлгэц
	 * уншигч бүлгийг зөв зарлана. `input` нь харагдахгүй ч фокус авах ёстой тул
	 * `display: none` биш, sr-only байдлаар нуугдана.
	 */
	let {
		value,
		onchange
	}: { value: RepaymentType; onchange: (next: RepaymentType) => void } = $props();

	const OPTIONS: { value: RepaymentType; label: string }[] = [
		{ value: 'annuity', label: 'Тэнцүү төлбөрт' },
		{ value: 'equalPrincipal', label: 'Үндсэн төлбөр тэнцүү' }
	];

	let hint = $derived(
		value === 'equalPrincipal'
			? 'Үндсэн төлбөр сар бүр ижил, хүү үлдэгдлээс бодогдоно.'
			: 'Сар бүр ижил дүн төлнө.'
	);
</script>

<fieldset class="field">
	<legend class="field-label">Эргэн төлөлтийн төрөл</legend>
	<div class="segment-track">
		{#each OPTIONS as option (option.value)}
			<label class="segment-option">
				<input
					class="segment-input"
					type="radio"
					name="repayment-type"
					value={option.value}
					checked={value === option.value}
					onchange={() => onchange(option.value)}
				/>
				<span class="segment-label">{option.label}</span>
			</label>
		{/each}
	</div>
	<p class="segment-hint">{hint}</p>
</fieldset>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
		margin: 0;
		padding: 0;
		border: 0;
	}

	.field-label {
		padding: 0;
		color: var(--ink-muted);
		font-size: var(--text-label);
		font-weight: 500;
		line-height: 1.3;
	}

	.segment-track {
		display: flex;
		align-items: stretch;
		gap: var(--space-1);
		min-width: 0;
		padding: var(--space-1);
		background: var(--surface-inset);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
	}

	.segment-option {
		display: flex;
		flex: 1 1 0;
		min-width: 0;
	}

	/* Харагдахгүй ч фокус авах ёстой тул `display: none` биш. */
	.segment-input {
		position: absolute;
		width: 1px;
		height: 1px;
		margin: -1px;
		padding: 0;
		border: 0;
		overflow: hidden;
		clip: rect(0 0 0 0);
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.segment-label {
		display: flex;
		flex: 1 1 auto;
		align-items: center;
		justify-content: center;
		min-width: 0;
		padding: var(--space-3) var(--space-2);
		/* Сонгогдоход 1px үсрэхээс сэргийлж, хүрээг ил тод байлгана. */
		border: 1px solid transparent;
		border-radius: var(--radius-sm);
		color: var(--ink-muted);
		font-size: 13px;
		font-weight: 500;
		line-height: 1.3;
		text-align: center;
	}

	.segment-input:checked + .segment-label {
		background: var(--surface);
		border-color: var(--accent);
		color: var(--brand-deep);
		font-weight: 600;
	}

	.segment-input:focus-visible + .segment-label {
		border-color: var(--accent);
		box-shadow: 0 0 0 3px var(--accent-soft);
	}

	.segment-hint {
		margin: 0;
		min-width: 0;
		color: var(--ink-muted);
		font-size: var(--text-hint);
		font-weight: normal;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}

	@media (min-width: 900px) {
		.segment-label {
			font-size: var(--text-label);
		}
	}
</style>
