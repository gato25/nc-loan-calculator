<script lang="ts">
	import { formatTugrik } from '$lib/format';
	import type { LoanResult } from '$lib/loan';
	import InfoIcon from './InfoIcon.svelte';

	/**
	 * Дизайны `Result Panel`: hero + 3 зураас + 2 үр дүнгийн мөр + тайлбар.
	 * `result` нь `null` үед (оролт буруу) гурвуулаа `—` болно.
	 */
	let { result }: { result: LoanResult | null } = $props();

	const EMPTY = '—';

	let monthly = $derived(result ? formatTugrik(result.monthlyPayment) : EMPTY);
	let interest = $derived(result ? formatTugrik(result.totalInterest) : EMPTY);
	let total = $derived(result ? formatTugrik(result.totalPayment) : EMPTY);
</script>

<section class="panel" aria-live="polite">
	<p class="hero-label">САРЫН ТӨЛБӨР</p>
	<p class="hero-value" class:empty={!result}>{monthly}</p>

	<hr class="divider" />

	<div class="row">
		<span class="row-label">Нийт хүү</span>
		<span class="row-value" class:empty={!result}>{interest}</span>
	</div>

	<hr class="divider" />

	<div class="row">
		<span class="row-label">Нийт төлөх дүн</span>
		<span class="row-value accent" class:empty={!result}>{total}</span>
	</div>

	<hr class="divider" />

	<div class="note">
		<InfoIcon size={16} />
		{#if result}
			<p class="note-text desktop-only">
				Тэнцүү төлбөрт (аннуитет) аргаар тооцов. Дүн нь урьдчилсан тооцоо бөгөөд бүхэл төгрөгөөр
				дугуйлагдсан.
			</p>
			<p class="note-text mobile-only">
				Тэнцүү төлбөрт (аннуитет) аргаар тооцсон урьдчилсан дүн.
			</p>
		{:else}
			<p class="note-text">Утга зөв болмогц үр дүн шууд тооцоологдоно.</p>
		{/if}
	</div>
</section>

<style>
	.panel {
		display: block;
		min-width: 0;
		padding: 20px;
		background: var(--brand-deep);
		border-radius: var(--radius-lg);
	}

	.hero-label {
		margin: 0 0 6px;
		color: var(--accent-bright);
		font-size: var(--text-hint);
		font-weight: 600;
		line-height: 1.3;
		letter-spacing: 0.02em;
	}

	.hero-value {
		margin: 0 0 18px;
		color: var(--ink-inverse);
		font-size: 36px;
		font-weight: 700;
		line-height: 1.1;
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
	}

	.hero-value.empty {
		color: var(--ink-inverse-muted);
	}

	.divider {
		height: 1px;
		margin: 0;
		border: 0;
		background: var(--brand-deep-soft);
	}

	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		min-width: 0;
		padding: 14px 0;
	}

	.row-label {
		flex: 0 1 auto;
		min-width: 0;
		color: var(--ink-inverse-muted);
		font-size: var(--text-label);
		font-weight: normal;
		line-height: 1.3;
	}

	.row-value {
		flex: 0 1 auto;
		min-width: 0;
		color: var(--ink-inverse);
		font-size: 18px;
		font-weight: 600;
		line-height: 1.3;
		text-align: right;
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
	}

	.row-value.accent {
		color: var(--accent-bright);
	}

	.row-value.empty {
		color: var(--ink-inverse-muted);
	}

	.note {
		display: flex;
		align-items: flex-start;
		gap: var(--space-2);
		min-width: 0;
		padding-top: var(--space-4);
	}

	.note :global(.info-icon) {
		width: 15px;
		height: 15px;
		margin-top: 1px;
	}

	.note-text {
		margin: 0;
		min-width: 0;
		color: var(--ink-inverse-muted);
		font-size: 12px;
		font-weight: normal;
		line-height: 1.45;
	}

	/* Тайлбарын дэлгэрэнгүй хувилбар зөвхөн desktop дээр. */
	.desktop-only {
		display: none;
	}

	@media (min-width: 900px) {
		.panel {
			padding: var(--space-6);
		}

		.hero-label {
			margin-bottom: var(--space-2);
		}

		.hero-value {
			margin-bottom: var(--space-5);
			font-size: var(--text-hero);
		}

		.row {
			padding: var(--space-4) 0;
		}

		.row-label {
			font-size: var(--text-body);
		}

		.row-value {
			font-size: var(--text-result);
		}

		.note {
			padding-top: 20px;
		}

		.note :global(.info-icon) {
			width: 16px;
			height: 16px;
		}

		.note-text {
			font-size: var(--text-hint);
		}

		.desktop-only {
			display: block;
		}

		.mobile-only {
			display: none;
		}
	}
</style>
