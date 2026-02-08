<script lang="ts">
	// prettier-ignore
	let links = [
		'alert-confirm-prompt', 
		'animated-ellipsis',
		'avatar',
		'app-shell', 
		'app-shell-simple', 
		'assets-preview', 
		// 'avatar', 
		'backdrop', 
        'button', 
        'button-group-radio', 
		'carousel', 
		'collapsible', 
        'color-scheme', 
		'command-menu',
		'dismissible-message', 
        'data-table', 
        // 'drag-drop', 
        'drawer',
        'dropdown-menu',
		'file-dropzone',
		'hover-expandable-width',
		'icons',
		'input',
		'input-history',
		'kbd-shortcut',
		'list-item-button',
		'modal-dialog',
		'modal',
		'nav',
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
		'tabbed-menu',
        'thc', 
        'theme-preview', 
        'tooltip',
        'tw-check',
		// 'viewport',
		'x'
	].toSorted();
</script>

<div class="p-4">
	<ul class="space-y-2">
		{#each links as link}
			<li>
				<a
					href={link}
					class="block p-2 px-4 rounded-lg bg-neutral-200 dark:bg-neutral-900 hover:text-white hover:bg-neutral-600"
					>{link}</a
				>
			</li>
		{/each}
	</ul>
</div>
