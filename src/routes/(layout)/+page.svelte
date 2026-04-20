<script lang="ts">
	// prettier-ignore
	let links = [
		'accordion',
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
		'card',
		'cart',
		'checkout',
		'collapsible', 
        'color-scheme', 
		'command-menu',
		'cron-input',
		'dim-behind',
		'dismissible-message',
        'data-table', 
        // 'drag-drop', 
        'drawer',
        'dropdown-menu',
		'file-dropzone',
		'h',
		'header',
		'hover-expandable-width',
		'image-cycler',
		'icons',
		'icon-swap',
		'input',
		'input-history',
		'kbd-shortcut',
		'list-item-button',
		'login-form',
		'login-or-register-form',
		'modal-dialog',
		'modal',
		'nav',
		'notifications',
		'onboarding',
		// 'on-outside',
		'popover', 
		'pricing-table',
		'progress',
		'register-form',
		'resizable-width',
		'separator', 
		'skeleton', 
		'sliding-panels',
		'spotlight',
		'spinner',
		'style-presets',
        'switch', 
		// 'table', 
		'tabbed-menu',
        'thc', 
        'theme-preview', 
        'tooltip',
        'tree',
        'tw-check',
		'with-side-panel',
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
