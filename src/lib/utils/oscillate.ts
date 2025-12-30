/**
 * Returns an oscillating value using a sine wave between min and max.
 *
 * Useful for animations, pulsing effects, or any cyclic interpolation.
 *
 * @param time - The time value (typically from requestAnimationFrame or similar)
 * @param min - Minimum value of the oscillation range (default: 0)
 * @param max - Maximum value of the oscillation range (default: 1)
 * @param speed - Speed multiplier for the oscillation (default: 1)
 * @returns A value smoothly oscillating between min and max
 *
 * @example
 * ```ts
 * // Oscillate opacity between 0.5 and 1.0
 * const opacity = oscillate(timestamp / 1000, 0.5, 1.0);
 *
 * // Faster oscillation
 * const value = oscillate(time, 0, 100, 2);
 * ```
 */
export function oscillate(time: number, min: number = 0, max: number = 1, speed = 1) {
	// Calculate the midpoint (the center of the oscillation)
	// e.g., if min=10, max=50, midpoint is (50+10)/2 = 30
	const midpoint = (max + min) / 2;

	// Calculate the amplitude (half the distance between min and max)
	// e.g., if min=10, max=50, amplitude is (50-10)/2 = 20
	const amplitude = (max - min) / 2;

	// Calculate the oscillation
	// 1. Math.sin(time * speed) gives a value between -1 and 1
	// 2. Multiplying by amplitude scales it to [-amplitude, amplitude] (e.g., [-20, 20])
	// 3. Adding midpoint shifts the range to [midpoint - amplitude, midpoint + amplitude]
	//    (e.g., [30 - 20, 30 + 20] which is [10, 50])
	return midpoint + Math.sin(time * speed) * amplitude;
}
