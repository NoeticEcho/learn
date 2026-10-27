<!--
	A live diagram (spec §3.4 «Живая схема»): one line of HTML, split into its parts. Choosing a
	part explains it. The words come from the lesson (props), so the component holds no copy.
-->
<script lang="ts">
	type Part = { code: string; name: string; note: string };
	let { parts, label }: { parts: Part[]; label: string } = $props();
	let active = $state(0);
	const uid = $props.id();
</script>

<figure class="anatomy">
	<div class="line" role="tablist" aria-label={label}>
		{#each parts as p, i (i)}
			<button
				type="button"
				role="tab"
				id="{uid}-t{i}"
				aria-selected={active === i}
				aria-controls="{uid}-panel"
				tabindex={active === i ? 0 : -1}
				onclick={() => (active = i)}
				onkeydown={(e) => {
					const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
					if (!d) return;
					e.preventDefault();
					active = (active + d + parts.length) % parts.length;
					document.getElementById(`${uid}-t${active}`)?.focus();
				}}><code>{p.code}</code></button
			>
		{/each}
	</div>
	<div class="note" role="tabpanel" id="{uid}-panel" aria-labelledby="{uid}-t{active}" aria-live="polite">
		<p class="name">{parts[active].name}</p>
		<p>{parts[active].note}</p>
	</div>
</figure>

<style>
	.anatomy {
		margin: var(--space-6) 0;
		padding: var(--space-5);
		border: var(--line) solid var(--border-hairline);
		background: var(--surface-body);
	}
	.line {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-1);
		font-size: var(--text-body-lg);
	}
	button {
		min-height: var(--hit-min);
		padding: 0 var(--space-2);
		border: var(--line) solid transparent;
		border-bottom-color: var(--border-rule);
		background: none;
		color: var(--text-body);
		transition: border-color var(--dur-micro) var(--ease-stop);
	}
	button:hover {
		border-bottom-color: var(--border-brass);
		color: var(--text-primary);
	}
	button[aria-selected='true'] {
		border-color: var(--accent-measure);
		color: var(--text-primary);
	}
	code {
		font-size: inherit;
	}
	.note {
		margin-top: var(--space-4);
		max-width: var(--measure);
	}
	.note p {
		margin: 0;
		color: var(--text-body);
	}
	.note .name {
		color: var(--text-primary);
		font-weight: var(--weight-medium);
		margin-bottom: var(--space-1);
	}
</style>
