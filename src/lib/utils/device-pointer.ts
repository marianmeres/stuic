export class DevicePointer {
	// none - The primary input mechanism does not include a pointing device.
	static readonly isNone = window?.matchMedia('(any-pointer:none)').matches;

	// coarse - The primary input mechanism includes a pointing device of limited accuracy,
	// such as a finger on a touchscreen.
	static readonly isCoarse = window?.matchMedia('(any-pointer:coarse)').matches;

	// fine - The primary input mechanism includes an accurate pointing device, such as a mouse.
	static readonly isFine = window?.matchMedia('(any-pointer:fine)').matches;
}
