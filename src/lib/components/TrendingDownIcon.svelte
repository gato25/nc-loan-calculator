<script lang="ts">
	/** Хэмнэлтийн тэмдэг (буурч буй муруй) — inline SVG, гадны дуудлагагүй. */
	let { size = 16 }: { size?: number } = $props();
</script>

<svg
	class="trending-down-icon"
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
	<path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
	<path d="M16 17h6v-6" />
</svg>

<style>
	.trending-down-icon {
		display: block;
		flex: 0 0 auto;
		color: var(--accent-bright);
	}
</style>
