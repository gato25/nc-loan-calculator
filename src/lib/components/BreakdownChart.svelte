<script lang="ts">
	import { formatTugrik } from '$lib/format';
	import type { PaymentBreakdown } from '$lib/loan';

	let { breakdown }: { breakdown: PaymentBreakdown } = $props();

	let months = $derived(breakdown.months);
	let count = $derived(months.length);

	// Бүх багана ижил өргөнтэй, хоорондын зай нь өргөний 20% — өргөн нь дэлгэцээс
	// хамаарч хувиар тогтоогддог тул 120 сар ч гүйлгэлтгүй багтана.
	let barWidth = $derived(100 / (1.2 * count - 0.2));

	// Өндрийн масштаб: хамгийн их сарын төлбөр графикийг бүтэн дүүргэнэ.
	let maxPayment = $derived(Math.max(...months.map((row) => row.principal + row.interest), 0));

	let bars = $derived(
		months.map((row, index) => {
			const payment = row.principal + row.interest;
			const total = maxPayment === 0 ? 0 : (payment / maxPayment) * 100;
			const principal = maxPayment === 0 ? 0 : (row.principal / maxPayment) * 100;

			return {
				month: row.month,
				x: `${(index * 1.2 * barWidth).toFixed(4)}%`,
				width: `${barWidth.toFixed(4)}%`,
				// Дэвсгэр нь бүтэн багана — оройн дугуйлалт үүнээс гарна.
				totalY: `${(100 - total).toFixed(4)}%`,
				totalHeight: `${total.toFixed(4)}%`,
				// Үндсэн төлбөрийн дөрвөлжин хэсэг ёроолоос дээш, доод дугуйлалтыг нуана.
				principalY: `${(100 - principal).toFixed(4)}%`,
				principalHeight: `${principal.toFixed(4)}%`,
				// Хүү 0 үед оройн 3px өөр өнгөөр харагдахаас сэргийлнэ.
				capFill: row.interest > 0 ? 'var(--chart-interest)' : 'var(--chart-principal)'
			};
		})
	);

	let middleMonth = $derived(Math.round(count / 2));
</script>

<div class="breakdown">
	<div class="legend">
		<div class="legend-item">
			<span class="swatch swatch-principal"></span>
			<span class="legend-text">
				<span class="legend-label">Үндсэн төлбөр</span>
				<span class="legend-value">
					{formatTugrik(breakdown.totalPrincipal)} · {breakdown.principalShare.toFixed(1)}%
				</span>
			</span>
		</div>
		<div class="legend-item">
			<span class="swatch swatch-interest"></span>
			<span class="legend-text">
				<span class="legend-label">Нийт хүү</span>
				<span class="legend-value">
					{formatTugrik(breakdown.totalInterest)} · {breakdown.interestShare.toFixed(1)}%
				</span>
			</span>
		</div>
	</div>

	<div class="chart">
		<!--
			`viewBox` байхгүй — багана бүрийн хэмжээ хувиар өгөгдөж, SVG эцгийнхээ
			өргөнийг дагана. Иймээс масштабын гажилт үүсэхгүй, `rx` яг 3px хэвээр.
			Багана тус бүрийг дэлгэц уншигчид уншуулахгүй — тэр мэдээлэл доорх
			хуваарийн хүснэгтэд хүснэгт хэлбэрээр аль хэдийн байгаа.
		-->
		<svg
			class="plot"
			role="img"
			aria-label="{count} сарын төлбөрийн бүтэц: хүү {breakdown.interestShare.toFixed(1)}%"
		>
			{#each bars as bar (bar.month)}
				<!-- `rx` нь CSS-ээс токеноор, атрибут нь түүнийг дэмжихгүй хөтчийн нөөц утга. -->
				<rect
					class="bar-cap"
					x={bar.x}
					y={bar.totalY}
					width={bar.width}
					height={bar.totalHeight}
					rx="3"
					fill={bar.capFill}
				/>
				<rect
					x={bar.x}
					y={bar.principalY}
					width={bar.width}
					height={bar.principalHeight}
					fill="var(--chart-principal)"
				/>
			{/each}
		</svg>

		<div class="baseline"></div>

		<div class="axis">
			<span class="axis-start">1 сар</span>
			{#if count > 2}
				<span class="axis-middle">{middleMonth} сар</span>
			{/if}
			{#if count > 1}
				<span class="axis-end">{count} сар</span>
			{/if}
		</div>
	</div>
</div>

<style>
	.breakdown {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		min-width: 0;
	}

	.legend {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		min-width: 0;
	}

	.legend-item {
		display: flex;
		gap: var(--space-3);
		min-width: 0;
	}

	.swatch {
		flex: none;
		width: 12px;
		height: 12px;
		margin-top: 4px;
		border-radius: 4px;
	}

	.swatch-principal {
		background: var(--chart-principal);
	}

	.swatch-interest {
		background: var(--chart-interest);
	}

	.legend-text {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.legend-label {
		color: var(--ink-muted);
		font-size: var(--text-hint);
		font-weight: normal;
		line-height: 1.2;
	}

	.legend-value {
		color: var(--ink);
		font-size: var(--text-body);
		font-weight: 600;
		line-height: 1.2;
		overflow-wrap: anywhere;
	}

	.chart {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		min-width: 0;
	}

	.plot {
		display: block;
		width: 100%;
		min-width: 0;
		height: var(--chart-height-mobile);
	}

	.bar-cap {
		rx: var(--chart-bar-radius);
	}

	.baseline {
		min-width: 0;
		height: 1px;
		background: var(--border-strong);
	}

	.axis {
		display: flex;
		min-width: 0;
		color: var(--ink-muted);
		font-size: var(--text-chart-axis);
		font-weight: normal;
		line-height: 1.2;
	}

	.axis span {
		flex: 1;
		min-width: 0;
	}

	.axis-middle {
		text-align: center;
	}

	.axis-end {
		text-align: right;
	}

	@media (min-width: 900px) {
		.legend {
			flex-direction: row;
			flex-wrap: wrap;
			gap: var(--space-7);
		}

		.plot {
			height: var(--chart-height-desktop);
		}
	}
</style>
