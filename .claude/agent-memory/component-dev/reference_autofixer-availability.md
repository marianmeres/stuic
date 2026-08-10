---
name: autofixer-availability
description: svelte-autofixer is an MCP-server tool, not an npm CLI; fallback validation recipe when the MCP is not connected
metadata:
  type: reference
---

`svelte-autofixer` (referenced in AGENTS.md checklist) is a tool of the official Svelte
MCP server. It is NOT published on npm (`npx svelte-autofixer` → E404) and is not in
this repo's devDependencies, so in sessions without the Svelte MCP connected it cannot
be run.

Fallback that covers most of what it flags:

1. `node -e "require('svelte/compiler').compile(src, { generate: 'client', runes: true })"`
   and print `res.warnings` (catches non_reactive_update, state_referenced_locally, etc.)
2. `npx svelte-check --threshold warning` filtered to the component path.

When reporting, state explicitly that the autofixer itself was unavailable and the
fallback was used.
