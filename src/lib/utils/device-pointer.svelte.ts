import { MediaQuery } from "svelte/reactivity";

export class DevicePointer {
	/** none - The primary input mechanism does not include a pointing device. */
	#isNone = new MediaQuery("any-pointer: none");

	/** coarse - The primary input mechanism includes a pointing device of limited accuracy,
	 * such as a finger on a touchscreen. */
	#isCoarse = new MediaQuery("any-pointer: coarse");

	/** fine - The primary input mechanism includes an accurate pointing device, such as a mouse. */
	#isFine = new MediaQuery("any-pointer: fine");

	get isNone() {
		return this.#isNone.current;
	}

	get isCoarse() {
		return this.#isCoarse.current;
	}

	get isFine() {
		return this.#isFine.current;
	}

	get dump() {
		return {
			isNone: this.isNone,
			isCoarse: this.isCoarse,
			isFine: this.isFine,
		};
	}
}
