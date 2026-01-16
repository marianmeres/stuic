<script lang="ts">
	// prettier-ignore
	let links = [
		'alert-confirm-prompt', 
		'animated-ellipsis',
		'avatar-initials',
		'app-shell', 
		'app-shell-simple', 
		'assets-preview', 
		// 'avatar', 
		'backdrop', 
        'button', 
        'button-group-radio', 
		// 'carousel', 
		'collapsible', 
        'color-scheme', 
		'command-menu',
		'dismissible-message', 
        // 'drag-drop', 
        'drawer',
        'dropdown-menu',
		'file-dropzone',
		'hover-expandable-width',
		'input',
		'input-history',
		'kbd-shortcut',
		'modal-dialog',
		'modal',
		'notifications',
		// 'on-outside',
		'popover', 
		'progress',
		'resizable-width',
		'skeleton', 
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
