<script lang="ts">
	import { KbdShortcut } from "$lib/index.js";
</script>

<div class="space-y-4">
	<div class="space-x-2">
		<KbdShortcut metas={["cmd"]} keys="K" />
		<KbdShortcut metas={["cmd"]} keys="K" forcedOs="mac" />
		<KbdShortcut metas={["cmd"]} keys="K" forcedOs="win" />
	</div>
	<div class="space-x-2">
		<KbdShortcut metas={["ctrl"]} keys="K" />
		<KbdShortcut metas={["ctrl"]} keys="K" forcedOs="mac" />
		<KbdShortcut metas={["ctrl"]} keys="K" forcedOs="win" />
	</div>
	<div class="space-x-2">
		<KbdShortcut metas={["shift"]} keys="F" />
		<KbdShortcut metas={["shift"]} keys="F" forcedOs="mac" />
		<KbdShortcut metas={["shift"]} keys="F" forcedOs="win" />
	</div>
	<div class="space-x-2">
		<KbdShortcut metas={["meta"]} keys="F" />
		<KbdShortcut metas={["meta"]} keys="F" forcedOs="mac" />
		<KbdShortcut metas={["meta"]} keys="F" forcedOs="win" />
	</div>
	<div class="space-x-2">
		<KbdShortcut metas={["cmd", "ctrl", "shift"]} keys="X" />
		<KbdShortcut metas={["cmd", "ctrl", "shift"]} keys="X" forcedOs="mac" />
		<KbdShortcut metas={["cmd", "ctrl", "shift"]} keys="X" forcedOs="win" />
	</div>
</div>
