<script lang="ts">
	import { formatTugrik } from '$lib/format';
	import type { LoanResult, RepaymentType } from '$lib/loan';
	import InfoIcon from './InfoIcon.svelte';
	import TrendingDownIcon from './TrendingDownIcon.svelte';

	/**
	 * Дизайны `Result Panel`: hero + үр дүнгийн мөрүүд + хэмнэлтийн зурвас + тайлбар.
	 * `result` нь `null` үед (оролт буруу) бүх тоо `—` болж, тайлбар өгүүлбэрүүд
	 * алга болно. Үндсэн төлбөр тэнцүү горимд hero нь эхний сарын төлбөрийг
	 * уншиж, "Сүүлийн сарын төлбөр" нэмэлт мөр гарна.
	 */
	let {
		result,
		type = 'annuity',
		savings = null
	}: { result: LoanResult | null; type?: RepaymentType; savings?: number | null } = $props();

	const EMPTY = '—';

	let equalPrincipal = $derived(type === 'equalPrincipal');

	let hero = $derived(result ? formatTugrik(result.firstPayment) : EMPTY);
	let last = $derived(result ? formatTugrik(result.lastPayment) : EMPTY);
	let interest = $derived(result ? formatTugrik(result.totalInterest) : EMPTY);
	let total = $derived(result ? formatTugrik(result.totalPayment) : EMPTY);
	let savingsValue = $derived(result && savings !== null ? formatTugrik(savings) : EMPTY);

	let savingsCaptionDesktop = $derived(
		equalPrincipal
			? 'Хоёр аргын нийт хүүгийн зөрүү. Тэнцүү төлбөрт аргатай харьцуулахад нийт хүү ийм дүнгээр бага гарлаа.'
			: 'Хоёр аргын нийт хүүгийн зөрүү. Үндсэн төлбөр тэнцүү аргаар тооцвол нийт хүү ийм дүнгээр бага гарна.'
	);
	let savingsCaptionMobile = $derived(
		equalPrincipal
			? 'Хоёр аргын нийт хүүгийн зөрүү. Тэнцүү төлбөрт аргатай харьцуулахад нийт хүү ийм дүнгээр бага гарлаа.'
			: 'Хоёр аргын нийт хүүгийн зөрүү. Үндсэн төлбөр тэнцүү аргаар нийт хүү ийм дүнгээр бага гарна.'
	);

	let noteDesktop = $derived(
		equalPrincipal
			? 'Үндсэн төлбөр тэнцүү аргаар тооцов. Дүн нь урьдчилсан тооцоо бөгөөд бүхэл төгрөгөөр дугуйлагдсан.'
			: 'Тэнцүү төлбөрт (аннуитет) аргаар тооцов. Дүн нь урьдчилсан тооцоо бөгөөд бүхэл төгрөгөөр дугуйлагдсан.'
	);
	let noteMobile = $derived(
		equalPrincipal
			? 'Үндсэн төлбөр тэнцүү аргаар тооцсон урьдчилсан дүн. Төлбөр сар ирэх тусам буурна.'
			: 'Тэнцүү төлбөрт (аннуитет) аргаар тооцсон урьдчилсан дүн.'
	);
</script>

<section class="panel" aria-live="polite">
	<p class="hero-label">{equalPrincipal ? 'ЭХНИЙ САРЫН ТӨЛБӨР' : 'САРЫН ТӨЛБӨР'}</p>
	<p class="hero-value" class:empty={!result}>{hero}</p>

	<hr class="divider" />

	{#if equalPrincipal}
		<div class="row">
			<span class="row-label">Сүүлийн сарын төлбөр</span>
			<span class="row-value" class:empty={!result}>{last}</span>
		</div>

		<hr class="divider" />
	{/if}

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

	<div class="savings">
		<div class="savings-strip">
			<span class="savings-left">
				<TrendingDownIcon size={16} />
				<span class="savings-label">Хэмнэлт</span>
			</span>
			<span class="savings-value" class:empty={!result}>{savingsValue}</span>
		</div>
		{#if result}
			<p class="savings-caption desktop-only">{savingsCaptionDesktop}</p>
			<p class="savings-caption mobile-only">{savingsCaptionMobile}</p>
		{/if}
	</div>

	<div class="note">
		<InfoIcon size={16} />
		{#if result}
			<p class="note-text desktop-only">{noteDesktop}</p>
			<p class="note-text mobile-only">{noteMobile}</p>
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
		overflow-wrap: anywhere;
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

	.savings {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
		padding-top: var(--space-4);
	}

	.savings-strip {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		min-width: 0;
		padding: var(--space-3) var(--space-4);
		background: var(--brand-deep-soft);
		border-radius: var(--radius-md);
	}

	.savings-left {
		display: flex;
		flex: 0 1 auto;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.savings-label {
		min-width: 0;
		color: var(--accent-bright);
		font-size: var(--text-hint);
		font-weight: 600;
		line-height: 1.3;
		overflow-wrap: anywhere;
	}

	.savings-value {
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

	.savings-value.empty {
		color: var(--ink-inverse-muted);
	}

	.savings-caption {
		margin: 0;
		min-width: 0;
		color: var(--ink-inverse-muted);
		font-size: 12px;
		font-weight: normal;
		line-height: 1.45;
		overflow-wrap: anywhere;
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

		.savings {
			padding-top: var(--space-5);
		}

		.savings-value {
			font-size: var(--text-result);
		}

		.savings-caption {
			font-size: var(--text-hint);
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
