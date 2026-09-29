<script lang="ts">
	import { formatTugrik } from '$lib/format';
	import type { ScheduleRow } from '$lib/loan';
	import MoveHorizontalIcon from './MoveHorizontalIcon.svelte';

	let { rows }: { rows: ScheduleRow[] } = $props();
</script>

<!-- Хүснэгт нарийн дэлгэц дээр өөрөө хэвтээ чиглэлд гүйлгэгдэнэ — хуудас гүйлгэгдэхгүй. -->
<div class="scroll">
	<table>
		<colgroup>
			<col class="col-month" />
			<col class="col-payment" />
			<col class="col-principal" />
			<col class="col-interest" />
			<col class="col-balance" />
		</colgroup>
		<thead>
			<tr>
				<th scope="col" class="month">САР</th>
				<th scope="col">ТӨЛБӨР</th>
				<th scope="col">ҮНДСЭН ТӨЛБӨР</th>
				<th scope="col">ХҮҮ</th>
				<th scope="col">ҮЛДЭГДЭЛ</th>
			</tr>
		</thead>
		<tbody>
			{#each rows as row (row.month)}
				<tr>
					<th scope="row" class="month">{row.month}</th>
					<td>{formatTugrik(row.payment)}</td>
					<td>{formatTugrik(row.principal)}</td>
					<td>{formatTugrik(row.interest)}</td>
					<td class="balance">{formatTugrik(row.balance)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<p class="hint">
	<MoveHorizontalIcon />
	Хүснэгтийг хэвтээ чиглэлд гүйлгэнэ
</p>

<style>
	.scroll {
		min-width: 0;
		overflow-x: auto;
		-webkit-overflow-scrolling: touch;
	}

	table {
		width: 100%;
		min-width: var(--table-min-width);
		border-collapse: collapse;
		table-layout: fixed;
	}

	/* Дизайны баганын өргөний харьцаа (desktop 90/230/250/200/246). */
	.col-month {
		width: 9%;
	}

	.col-payment {
		width: 22%;
	}

	.col-principal {
		width: 24%;
	}

	.col-interest {
		width: 20%;
	}

	.col-balance {
		width: 25%;
	}

	th,
	td {
		padding: var(--table-row-y) var(--space-3);
		text-align: right;
	}

	/* Картын ирмэг хүртэл дүүрсэн хүснэгтийн гадна талын зай. */
	th:first-child,
	td:first-child {
		padding-left: var(--space-4);
	}

	th:last-child,
	td:last-child {
		padding-right: var(--space-4);
	}

	thead th {
		border-bottom: 1px solid var(--border);
		color: var(--ink-muted);
		font-size: var(--text-table-head);
		font-weight: 600;
		white-space: nowrap;
	}

	tbody th,
	tbody td {
		color: var(--ink);
		font-size: var(--text-table);
		font-weight: normal;
		font-variant-numeric: tabular-nums;
		white-space: nowrap;
	}

	.month {
		text-align: left;
		color: var(--ink-muted);
		font-weight: 600;
	}

	tbody tr:nth-child(even) {
		background: var(--surface-stripe);
	}

	/* Сүүлийн мөр — зээл бүрэн хаагдсаныг онцолно. */
	tbody tr:last-child .month {
		color: var(--ink);
	}

	tbody tr:last-child .balance {
		color: var(--accent);
		font-weight: 600;
	}

	.hint {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 0;
		padding: 0 var(--space-4);
		color: var(--ink-muted);
		font-size: 12px;
		font-weight: normal;
	}

	@media (min-width: 900px) {
		th:first-child,
		td:first-child {
			padding-left: var(--space-3);
		}

		th:last-child,
		td:last-child {
			padding-right: var(--space-3);
		}

		.hint {
			display: none;
		}
	}
</style>
