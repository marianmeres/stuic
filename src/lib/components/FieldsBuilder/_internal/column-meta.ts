import { getId } from "../../../utils/get-id.js";
import type { FieldColumnDef } from "../types.js";

/**
 * INTERNAL to FieldsBuilder — not exported from the package.
 *
 * Per-column editing state, index-aligned with `FieldDef.columns` and kept in
 * lockstep by `ColumnsEditor`. It lives on the parent's `Row` (not inside the
 * editor) on purpose: the row body — and so the editor — is unmounted while a
 * row is collapsed, and a mount-time snapshot would freeze the key of a column
 * added this session, and lose the stored/new distinction the veto hooks
 * depend on, the moment the user collapsed and re-expanded the row.
 */
export interface ColumnMeta {
	/** Stable render id (columns have no identity of their own). */
	cid: string;
	/** Key at (re)load time; `undefined` = column added this session. */
	initialKey?: string;
	/** Type at (re)load time (drives the warning and the veto). */
	initialType?: string;
	/** Key derivation from the label stops once true. Loaded columns: true. */
	keyTouched: boolean;
	/** The options / extras sub-block is open. */
	expanded: boolean;
}

/** Meta of a column present in `value` at (re)load time. */
export function loadedColumnMeta(column: FieldColumnDef): ColumnMeta {
	return {
		cid: getId(),
		initialKey: column.key || undefined,
		initialType: column.type || undefined,
		keyTouched: true,
		expanded: false,
	};
}

/** Meta of a column added in this editing session. */
export function newColumnMeta(expanded = false): ColumnMeta {
	return { cid: getId(), keyTouched: false, expanded };
}
