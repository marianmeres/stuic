<script>
	import { Thc } from '../../lib';
	import Layout from '../_components/Layout.svelte';
	import Foo from './Foo.svelte';
</script>

<Layout>
	<h1>
		<strong>T</strong>ext or <strong>H</strong>tml or <strong>C</strong>omponent DRY
		helper
	</h1>
	<hr class="my-4" />

	<Thc thc="Hey" />
	<Thc thc={{ text: 'ho' }} />
	<Thc thc={{ html: "&ndash; let's" }} transform={(s) => `<b>${s}</b>`} />
	<Thc thc={{ component: Foo, props: { foo: 'go' } }} />
	<hr class="my-4" />
	The above is written as:
	<pre>{`
	<Thc thc="Hey" /> // same as { text: 'Hey' }
	<Thc thc={{ text: 'ho' }} />
	<Thc thc={{ html: "&ndash; let's" }} transform={(s) => \`<b>\${s}</b>\`}/>
	<Thc thc={{ component: Foo, props: { foo: 'go' } }} />
`}</pre>
</Layout>

<style lang="scss">
	h1 {
		color: gray;
		strong {
			font-size: 1.3rem;
			@apply text-black dark:text-white;
		}
	}
</style>
