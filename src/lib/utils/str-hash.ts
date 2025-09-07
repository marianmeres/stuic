/**
 * a.k.a. "djb2"
 * It ensures a consistent, positive numerical representation.
 * It preserves all 32 bits of information, maintaining the full collision space.
 * The resulting values are always within the range 0 to 4,294,967,295 (2^32 - 1)
 */
export function strHash(str: string) {
	/**
	 * the expression ((hash << 5) - hash) is a common optimization that equals hash * 31
	 * (since (hash * 32) - hash = hash * 31).
	 *
	 * This multiplication by 31 is used because:
	 *
	 * 31 is a prime number, which helps with distributing hash values
	 * The computation (hash << 5) - hash is typically faster than direct multiplication
	 * It creates a good avalanche effect where small changes in input create significant changes in the hash
	 *
	 * So that line hash = ((hash << 5) - hash) + char; is effectively doing:
	 * hash = (hash * 31) + char;
	 *
	 * This is a core part of the djb2 hash algorithm, creating a strong dependency between
	 * each character's contribution to the final hash value.
	 */

	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		hash = (hash << 5) - hash + str.charCodeAt(i);
		hash = hash & hash; // Convert to 32bit integer
	}

	// ">>> 0" zero-fill right shift
	// 1. it forces the value to be treated as an unsigned 32-bit integer
	// 2. converts any negative value to its corresponding positive value in the 32-bit unsigned range
	//    (For a negative number like -10, >>> 0 converts it to 4,294,967,286 (which is 2^32 - 10).)
	// so, this step is just a cosmetic and reversible one...
	return (hash >>> 0).toString(16);
}
