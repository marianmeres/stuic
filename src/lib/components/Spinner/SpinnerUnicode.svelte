<script module lang="ts">
	export type SpinnerUnicodeVariant =
		| "braille_bar"
		| "braille_bar_dot"
		| "braille_dot_circle"
		| "braille_dot_bounce"
		| "half_circle"
		| "quarter_circle"
		| "ascii"
		| "bar_v"
		| "bar_h"
		| "shade"
		| "arrows"
		| "arrows2"
		| "asterix"
		| "asterix2"
		| "asterix3"
		| "asterix4"
		| "asterix5";

	//
	export function spinnerCreateBackAndForthCharFrames(
		width: number,
		hiChar: string,
		loChar: string,
		glue: string = "\u200A"
	): string[] {
		if (width < 0) throw new TypeError("Expecting positive non-zero width");
		if (width === 1) return [hiChar];

		let frames: string[] = [];
		let hiIdx = 0;
		let inc = true;

		const framesCount = 2 * width - 2;

		for (let y = 0; y < framesCount; y++) {
			let rowChars = [];
			for (let x = 0; x < width; x++) {
				rowChars.push(x == hiIdx ? hiChar : loChar);
			}

			if (inc) {
				hiIdx++;
				if (hiIdx === Math.ceil(framesCount / 2)) inc = false;
			} else {
				hiIdx--;
				if (hiIdx === 0) inc = true;
			}

			frames.push(rowChars.join(glue));
		}

		return frames;
	}
</script>

<script lang="ts">
	import { onMount } from "svelte";
	import { twMerge } from "../../utils/tw-merge.js";

	let {
		class: _class = "",
		speed = 100,
		variant = "braille_bar_dot",
		reversed = false,
		frames,
	}: {
		class?: string;
		speed?: number;
		variant?: SpinnerUnicodeVariant;
		reversed?: boolean;
		frames?: string[];
	} = $props();

	const braille_bar_dot = Array.from("⣾⣷⣯⣟⡿⢿⣻⣽");
	const braille_bar = Array.from("⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏");
	const braille_dot_circle = Array.from("⠁⠈⠐⠠⢀⡀⠄⠂");
	const braille_dot_bounce = Array.from("⠈⠐⠠⢀⠠⠐");
	const half_circle = Array.from("◐◓◑◒");
	const quarter_circle = Array.from("◴◷◶◵");
	const ascii = Array.from("|/-\\");
	const bar_v = Array.from("▁▃▄▅▆▇█▇▆▅▄▃");
	const bar_h = Array.from("▏▎▍▌▋▊▉█▉▋▌▍▎");
	const shade = Array.from("░▒▓█▓▒");
	const arrows = Array.from("←↖↑↗→↘↓↙");
	const arrows2 = Array.from("⇠⇡⇢⇣");
	// https://www.amp-what.com/unicode/search/asterisk
	const asterix = Array.from("🞯🞰🞱🞲🞳🞴🞳🞲🞱🞰");
	const asterix2 = Array.from("🞵🞶🞷🞸🞹🞺🞹🞸🞷🞶");
	const asterix3 = Array.from("🞻🞼🞽🞾🞿🞾🞽🞼");
	const asterix4 = Array.from("✢✣✤✣");
	const asterix5 = Array.from(
		[
			"🞯🞵🞻🞵",
			"🞰🞶🞼🞶",
			"🞱🞷🞽🞷",
			"🞲🞸🞾🞲",
			//
			"🞱🞷🞽🞷",
			"🞰🞶🞼🞶",
		].join("")
	);

	let _frames = $derived.by(() => {
		if (frames) return frames;
		const map: Record<SpinnerUnicodeVariant, string[]> = {
			braille_bar,
			braille_bar_dot,
			braille_dot_circle,
			braille_dot_bounce,
			half_circle,
			quarter_circle,
			ascii,
			bar_v,
			bar_h,
			shade,
			arrows,
			arrows2,
			asterix,
			asterix2,
			asterix3,
			asterix4,
			asterix5,
		};

		const _frames = map[variant] ?? braille_bar;
		return reversed ? _frames.toReversed() : _frames;
	});

	let currentFrame = $state(0);
	let timer: any;
	let lastTime = 0;

	onMount(() => {
		const animate = (currentTime: number) => {
			if (currentTime - lastTime >= speed) {
				currentFrame = (currentFrame + 1) % _frames.length;
				lastTime = currentTime;
			}
			timer = requestAnimationFrame(animate);
		};

		timer = requestAnimationFrame(animate);

		return () => {
			if (timer) {
				cancelAnimationFrame(timer);
			}
		};
	});
</script>

<span class={twMerge(`inline-block font-mono leading-none text-current text-xl`, _class)}>
	{_frames[currentFrame]}
</span>
