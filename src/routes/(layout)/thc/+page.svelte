<script>
	import Thc from "$lib/components/Thc/Thc.svelte";
	import Foo from "./Foo.svelte";
</script>

<h1>
	<strong>T</strong>ext or <strong>H</strong>tml or <strong>C</strong>omponent DRY helper
</h1>
<hr class="my-4" />

<Thc thc="Hey" />
<Thc thc={{ text: "ho" }} />
<Thc thc={{ html: "&ndash; let's" }} />
<Thc thc={{ component: Foo, props: { foo: "go" } }} />
<hr class="my-4" />

The above is written as:
<pre>{`
	<Thc thc="Hey" /> // same as { text: 'Hey' }
	<Thc thc={{ text: 'ho' }} />
	<Thc thc={{ html: "&ndash; let's" }} />
	<Thc thc={{ component: Foo, props: { foo: 'go' } }} />
`}</pre>
