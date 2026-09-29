<script lang="ts">
	/** NetCapital-ийн тэмдэг — inline SVG, гадны дуудлагагүй. */
	let { size = 22 }: { size?: number } = $props();
</script>

<svg
	class="brand-mark"
	width={size}
	height={size}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
	focusable="false"
>
	<path d="M12 16v5" />
	<path d="M16 14v7" />
	<path d="M20 10v11" />
	<path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" />
	<path d="M4 18v3" />
	<path d="M8 14v7" />
</svg>

<style>
	.brand-mark {
		display: block;
		flex: 0 0 auto;
		color: var(--accent);
	}
</style>
