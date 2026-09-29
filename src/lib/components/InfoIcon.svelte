<script lang="ts">
	/** Тайлбарын дэргэдэх мэдээллийн тэмдэг — inline SVG, гадны дуудлагагүй. */
	let { size = 16 }: { size?: number } = $props();
</script>

<svg
	class="info-icon"
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
	<circle cx="12" cy="12" r="10" />
	<path d="M12 16v-4" />
	<path d="M12 8h.01" />
</svg>

<style>
	.info-icon {
		display: block;
		flex: 0 0 auto;
		color: var(--ink-inverse-muted);
	}
</style>
