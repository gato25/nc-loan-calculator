<script lang="ts">
	import { formatGroupedInput, parseNumberInput } from '$lib/format';
	import {
		buildSchedule,
		calculateLoan,
		interestSavings,
		isValidAmount,
		isValidRate,
		isValidTerm,
		paymentBreakdown,
		type RepaymentType
	} from '$lib/loan';
	import BrandMark from './BrandMark.svelte';
	import BreakdownChart from './BreakdownChart.svelte';
	import Field from './Field.svelte';
	import RepaymentTypeField from './RepaymentTypeField.svelte';
	import ResultPanel from './ResultPanel.svelte';
	import ScheduleTable from './ScheduleTable.svelte';

	// Анхны утга — хуудас нээгдмэгц үр дүн харагдана.
	let amountRaw = $state('10,000,000');
	let rateRaw = $state('2');
	let termRaw = $state('12');
	let repaymentType = $state<RepaymentType>('annuity');

	let amount = $derived(parseNumberInput(amountRaw));
	let rate = $derived(parseNumberInput(rateRaw));
	let term = $derived(parseNumberInput(termRaw));

	let amountInvalid = $derived(!isValidAmount(amount));
	let rateInvalid = $derived(!isValidRate(rate));
	let termInvalid = $derived(!isValidTerm(term));

	// "Тооцоолох" товч байхгүй — оролт буюу эргэн төлөлтийн төрөл өөрчлөгдөх бүрд
	// $derived дахин тооцоолно.
	let result = $derived(
		isValidAmount(amount) && isValidRate(rate) && isValidTerm(term)
			? calculateLoan(amount, rate, term, repaymentType)
			: null
	);

	// Оролт зөв үед л хуваарь байгуулна — үр дүн байхгүй бол хүснэгт ч харагдахгүй.
	let schedule = $derived(
		result && isValidAmount(amount) && isValidRate(rate) && isValidTerm(term)
			? buildSchedule(amount, rate, term, repaymentType)
			: null
	);

	// График нь хуваарийн дугуйлсан мөрүүдээс гардаг тул доорх хүснэгттэйгээ таарна.
	let breakdown = $derived(
		isValidAmount(amount) && isValidRate(rate) && isValidTerm(term)
			? paymentBreakdown(amount, rate, term, repaymentType)
			: null
	);

	// Хэмнэлт нь сонгосон аргаас хамаарахгүй — хоёр аргын нийт хүүгийн зөрүү.
	let savings = $derived(
		isValidAmount(amount) && isValidRate(rate) && isValidTerm(term)
			? interestSavings(amount, rate, term)
			: null
	);

	/** Зөвхөн цифр үлдээнэ. */
	function stripDigits(raw: string): string {
		return raw.replace(/\D/g, '');
	}

	/** Цифр ба ганц аравтын цэг үлдээнэ. */
	function stripDecimal(raw: string): string {
		const cleaned = raw.replace(/[^\d.]/g, '');
		const firstDot = cleaned.indexOf('.');
		if (firstDot === -1) return cleaned;
		return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, '');
	}

	/** Мянгатын таслалыг алгасаж, `count` дэх утгатай тэмдэгтийн ард caret тавина. */
	function caretAfter(formatted: string, count: number): number {
		if (count <= 0) return 0;
		let seen = 0;
		for (let i = 0; i < formatted.length; i++) {
			if (formatted[i] === ',') continue;
			seen += 1;
			if (seen === count) return i + 1;
		}
		return formatted.length;
	}

	/**
	 * Оролтыг цэвэрлэж, форматлаад caret-ийг хэрэглэгчийн байрлалд буцааж тавина
	 * (таслал нэмэгдэхэд caret эцэст үсрэхээс сэргийлнэ).
	 */
	function handleInput(
		event: Event & { currentTarget: HTMLInputElement },
		strip: (raw: string) => string,
		format: (clean: string) => string,
		assign: (next: string) => void
	) {
		const input = event.currentTarget;
		const caret = input.selectionStart ?? input.value.length;
		const keptBefore = strip(input.value.slice(0, caret)).length;
		const next = format(strip(input.value));

		assign(next);
		if (input.value !== next) input.value = next;

		const position = caretAfter(next, keptBefore);
		input.setSelectionRange(position, position);
	}

	const identity = (value: string) => value;
</script>

<div class="page">
	<header class="header">
		<div class="brand">
			<BrandMark />
			<span class="brand-name">NetCapital</span>
		</div>
		<p class="header-note">Зээлийн урьдчилсан тооцоо</p>
	</header>

	<main class="main">
		<div class="form-column">
			<div class="intro">
				<h1 class="title">Зээлийн хүү тооцоолуур</h1>
				<p class="subtitle desktop-only">
					Зээлийн хэмжээ, сарын хүү, хугацаагаа оруулаад сар бүр төлөх төлбөр болон нийт хүүгээ
					шууд харна уу.
				</p>
				<p class="subtitle mobile-only">Утгаа оруулмагц сар бүрийн төлбөр шууд тооцоологдоно.</p>
			</div>

			<div class="form-card">
				<Field
					id="loan-amount"
					label="Зээлийн хэмжээ"
					value={amountRaw}
					unit="₮"
					inputmode="numeric"
					invalid={amountInvalid}
					hint="Зээлийн хэмжээ 0-оос их байх ёстой."
					oninput={(event) =>
						handleInput(event, stripDigits, formatGroupedInput, (next) => (amountRaw = next))}
				/>
				<Field
					id="loan-rate"
					label="Сарын хүү"
					value={rateRaw}
					unit="%"
					inputmode="decimal"
					invalid={rateInvalid}
					hint="Сарын хүү 0 буюу түүнээс их байх ёстой."
					oninput={(event) =>
						handleInput(event, stripDecimal, identity, (next) => (rateRaw = next))}
				/>
				<Field
					id="loan-term"
					label="Хугацаа"
					value={termRaw}
					unit="сар"
					inputmode="numeric"
					invalid={termInvalid}
					hint="Хугацаа 1-ээс багагүй бүхэл тоо байх ёстой."
					oninput={(event) =>
						handleInput(event, stripDigits, identity, (next) => (termRaw = next))}
				/>
				<RepaymentTypeField
					value={repaymentType}
					onchange={(next) => (repaymentType = next)}
				/>
			</div>
		</div>

		<ResultPanel {result} type={repaymentType} {savings} />
	</main>

	{#if breakdown}
		<section class="chart-card">
			<div class="chart-head">
				<h2 class="chart-title">Төлбөрийн бүтэц</h2>
				<p class="chart-subtitle desktop-only">
					{repaymentType === 'equalPrincipal'
						? 'Үндсэн төлбөр сар бүр тэнцүү тул багана аажим намсана: хүү үлдэгдлээс бодогдож буурна. Нийт хүү аннуитет аргаас бага.'
						: 'Сар бүр төлөх дүн үндсэн зээл ба хүүд хэрхэн хуваагдахыг харуулна. Эхний саруудад хүүгийн эзлэх хувь өндөр, хугацаа өнгөрөх тусам буурна.'}
				</p>
				<p class="chart-subtitle mobile-only">
					{repaymentType === 'equalPrincipal'
						? 'Үндсэн төлбөр тэнцүү тул сарын төлбөр аажим буурна.'
						: 'Сар бүрийн төлбөр үндсэн зээл ба хүүд хэрхэн хуваагдаж байгааг харуулна.'}
				</p>
			</div>

			<BreakdownChart {breakdown} />
		</section>
	{/if}

	{#if schedule}
		<section class="schedule-card">
			<div class="schedule-head">
				<h2 class="schedule-title">Эргэн төлөлтийн хуваарь</h2>
				<p class="schedule-subtitle desktop-only">
					{repaymentType === 'equalPrincipal'
						? 'Үндсэн төлбөр сар бүр ижил, хүү үлдэгдлээс бодогдох тул нийт төлбөр сар ирэх тусам буурна.'
						: 'Сар бүрийн төлбөр үндсэн зээл болон хүү хэрхэн хуваагдаж, үлдэгдэл хэрхэн буурахыг харуулна.'}
				</p>
				<p class="schedule-subtitle mobile-only">Сар бүрийн төлбөрийн задаргаа, үлдэгдэл.</p>
			</div>

			<ScheduleTable rows={schedule} />
		</section>
	{/if}
</div>

<style>
	.page {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		min-width: 0;
		max-width: 1280px;
		margin: 0 auto;
		padding: 24px 20px 32px;
		background: var(--bg-page);
	}

	.header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		min-width: 0;
	}

	.brand {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		min-width: 0;
	}

	.brand :global(.brand-mark) {
		width: 20px;
		height: 20px;
	}

	.brand-name {
		color: var(--ink);
		font-size: 17px;
		font-weight: 700;
		line-height: 1.2;
	}

	/* Header тэмдэглэл зөвхөн desktop дээр. */
	.header-note {
		display: none;
		margin: 0;
		color: var(--ink-muted);
		font-size: var(--text-body);
		font-weight: normal;
	}

	.main {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		min-width: 0;
	}

	.form-column {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		min-width: 0;
	}

	.intro {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	.title {
		margin: 0;
		color: var(--ink);
		font-size: 26px;
		font-weight: 700;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.subtitle {
		margin: 0;
		min-width: 0;
		color: var(--ink-muted);
		font-size: var(--text-label);
		font-weight: normal;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}

	.desktop-only {
		display: none;
	}

	.form-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-width: 0;
		padding: 20px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	/*
	 * Графикийн карт — хуваарийн карттай ижил хэв маяг. Дотор нь гүйлгэдэг зүйл
	 * байхгүй тул хэвтээ padding нь блокуудад бус картдаа.
	 */
	.chart-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-width: 0;
		padding: 20px 16px;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.chart-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
	}

	.chart-title {
		margin: 0;
		color: var(--ink);
		font-size: 17px;
		font-weight: 600;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.chart-subtitle {
		margin: 0;
		min-width: 0;
		color: var(--ink-muted);
		font-size: var(--text-hint);
		font-weight: normal;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}

	/*
	 * Хуваарийн карт нь main-ий доор бүтэн өргөнөөр. Хэвтээ padding-ыг картад бус
	 * дотоод блокуудад өгнө — хүснэгт өөрөө картын ирмэг хүртэл дүүрч гүйлгэгдэнэ.
	 */
	.schedule-card {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-width: 0;
		padding: 20px 0;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
	}

	.schedule-head {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		min-width: 0;
		padding: 0 var(--space-4);
	}

	.schedule-title {
		margin: 0;
		color: var(--ink);
		font-size: 17px;
		font-weight: 600;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.schedule-subtitle {
		margin: 0;
		min-width: 0;
		color: var(--ink-muted);
		font-size: 12px;
		font-weight: normal;
		line-height: 1.45;
		overflow-wrap: anywhere;
	}

	/* Хамгийн нарийн дэлгэц (320px) — хэвтээ гүйлгэлт үүсгэхгүй. */
	@media (max-width: 359px) {
		.page {
			padding: 20px 16px 28px;
		}
	}

	@media (min-width: 900px) {
		.page {
			gap: var(--space-7);
			padding: 40px 64px 56px;
		}

		.brand :global(.brand-mark) {
			width: 22px;
			height: 22px;
		}

		.brand-name {
			font-size: 19px;
		}

		.header-note {
			display: block;
		}

		.main {
			display: grid;
			grid-template-columns: minmax(0, 1fr) 440px;
			gap: var(--space-6);
			align-items: start;
		}

		.intro {
			gap: var(--space-3);
		}

		.title {
			font-size: var(--text-title);
			line-height: 1.15;
		}

		.subtitle {
			font-size: 16px;
			line-height: 1.5;
		}

		.desktop-only {
			display: block;
		}

		.mobile-only {
			display: none;
		}

		.form-card {
			gap: var(--space-5);
			padding: var(--space-6);
		}

		.chart-card {
			gap: var(--space-5);
			padding: var(--space-6);
		}

		.chart-title {
			font-size: var(--text-result);
		}

		.schedule-card {
			gap: var(--space-5);
			padding: var(--space-6);
		}

		.schedule-head {
			padding: 0;
		}

		.schedule-title {
			font-size: var(--text-result);
		}

		.schedule-subtitle {
			font-size: var(--text-hint);
		}
	}
</style>
