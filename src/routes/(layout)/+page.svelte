<script lang="ts">
	// prettier-ignore
	let links = [
		'alert-confirm-prompt', 
		'animated-ellipsis',
		'app-shell', 
		// 'avatar', 
		'backdrop', 
        'button', 
        'button-group-radio', 
		// 'carousel', 
        'color-scheme', 
		'command-menu',
		'dismissible-message', 
        // 'drag-drop', 
        'drawer',
		'file-dropzone',
		'hover-expandable-width',
		'input',
		'kbd-shortcut',
		'modal-dialog',
		'modal',
		'notifications',
		// 'on-outside',
		// 'popover', 
		'progress',
		'resizable-width',
		'sliding-panels',
		'spinner', 
        'switch', 
		// 'table', 
        'thc', 
        'tooltip',
        'tw-check',
		// 'viewport',
		'x'
	].toSorted();
</script>

<div class="p-4">
	<ul class="list-disc ml-4 space-y-1">
		{#each links as link}
			<li><a href={link} class="underline">{link}</a></li>
		{/each}
	</ul>
</div>
