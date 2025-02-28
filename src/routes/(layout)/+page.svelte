<script lang="ts">
	// prettier-ignore
	let links = [
		'alert-confirm-prompt', 
		'app-shell', 
		// 'avatar', 
		'backdrop', 
        'button', 
		// 'carousel', 
        'color-scheme', 
		'dismissible-message', 
        // 'drag-drop', 
        'drawer',
		// 'hover-expandable-width',
		'input',
		'modal-dialog',
		// 'notifications',
		// 'on-outside',
		// 'popover', 
		'spinner', 
        'switch', 
		// 'table', 
        'thc', 
        // 'tooltip',
		// 'viewport',
		'x'
	].toSorted();
</script>

<div class="p-4">
	<ul class="list-disc ml-4">
		{#each links as link}
			<li><a href={link} class="underline">{link}</a></li>
		{/each}
	</ul>
</div>
