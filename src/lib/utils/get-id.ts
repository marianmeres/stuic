let _id = 0;

/**
 * Generates a unique sequential ID with an optional prefix.
 *
 * IDs are guaranteed unique within the current runtime session (not persisted).
 *
 * @param prefix - String to prepend to the numeric ID (default: "id-")
 * @returns A unique string identifier
 *
 * @example
 * ```ts
 * getId();          // "id-1"
 * getId();          // "id-2"
 * getId("btn-");    // "btn-3"
 * getId("item-");   // "item-4"
 * ```
 */
export function getId(prefix: string = "id-") {
	return `${prefix}${++_id}`;
}
