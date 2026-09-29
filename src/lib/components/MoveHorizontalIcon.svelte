<script lang="ts">
	/** Хэвтээ гүйлгэлтийн сануулгын тэмдэг — inline SVG, гадны дуудлагагүй. */
	let { size = 14 }: { size?: number } = $props();
</script>

<svg
	class="move-horizontal-icon"
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
	<path d="m18 8 4 4-4 4" />
	<path d="M2 12h20" />
	<path d="m6 8-4 4 4 4" />
</svg>

<style>
	.move-horizontal-icon {
		display: block;
		flex: 0 0 auto;
		color: var(--ink-muted);
	}
</style>
