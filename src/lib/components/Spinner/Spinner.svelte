<script lang="ts">
	import { twMerge2 } from '../../utils/tw-merge2.js';

	// this is quite verbose, but very straight forward implementation,
	// and always rendered without any issues (opposed to linear-gradient hackish stuff)

	let _class = '';
	export { _class as class };

	// one "loop" duration (in ms)
	export let duration = 1000;

	// "hands" count
	export let count = 8;

	export let thickness: 'normal' | 'thin' | 'thick' = 'normal';
	export let height: 'normal' | 'tall' | 'short' = 'normal';
	export let direction: 'cw' | 'ccw' = 'cw';

	$: _count = Math.max(3, Math.min(12, count));

	let _id = 0;
	const _calcSegs = (_c: number, _d: number) => {
		const id = _id++;
		let out = [];
		for (let i = 0; i < _c; i++) {
			out.push({
				id: `${id}_${i}`,
				rotate: (360 / _c) * i,
				delay: (direction === 'ccw' ? 1 : -1) * (_d - (_d / _c) * (i + 1)),
				duration: _d,
			});
		}
		return out;
	};

	$: _segments = _calcSegs(_count, duration);

	$: _thickness =
		'thickness-' +
		(['normal', 'thin', 'thick'].includes(thickness) ? thickness : 'normal');

	$: _height =
		'height-' + (['normal', 'tall', 'short'].includes(height) ? height : 'normal');
</script>

<div class="spinner {_thickness} {_height} {twMerge2('inline-block w-5', _class)}">
	{#each _segments as s (s.id)}
		<div
			style={[
				`transform:rotate(${s.rotate}deg);`,
				`animation-delay:${s.delay}ms;`,
				`animation-duration:${s.duration}ms;`,
			].join('')}
		></div>
	{/each}
</div>

<style>
	.spinner,
	.spinner div,
	.spinner div:after {
		box-sizing: border-box;
	}

	.spinner {
		/* display: inline-block; */
		position: relative;
		aspect-ratio: 1/1;
		pointer-events: none;
	}

	.spinner div {
		width: 100%;
		height: 100%;
		position: absolute;
		inset: 0;
		/* animation: spinner 1.2s linear infinite; */
		animation-name: spinner;
		animation-timing-function: linear;
		animation-iteration-count: infinite;
	}

	.spinner div:after {
		content: ' ';
		display: block;
		position: absolute;

		top: 0;
		/* left: 46%;
		width: 8%; 
		height: 27%; */
		border-radius: 35%;
		background: currentColor;
	}
	/* thickness */
	.spinner.thickness-thin div:after {
		left: 47.5%;
		width: 5%;
	}
	.spinner.thickness-normal div:after {
		left: 46%;
		width: 8%;
	}
	.spinner.thickness-thick div:after {
		left: 44.5%;
		width: 11%;
	}

	/* height */
	.spinner.height-short div:after {
		height: 21%;
	}
	.spinner.height-normal div:after {
		height: 27%;
	}
	.spinner.height-tall div:after {
		height: 33%;
	}

	@keyframes spinner {
		0% {
			opacity: 1;
		}
		100% {
			opacity: 0;
		}
	}
</style>
