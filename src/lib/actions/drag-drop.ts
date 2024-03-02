import { createClog } from '@marianmeres/clog';
import type { Writable } from 'svelte/store';

const clog = createClog('drag-drop');

const _isFn = (v: any) => typeof v === 'function';

export type EffectAllowed =
	| 'copy'
	| 'none'
	| 'copyLink'
	| 'copyMove'
	| 'link'
	| 'linkMove'
	| 'move'
	| 'all'
	| 'uninitialized';

export type DropEffect = 'copy' | 'none' | 'link' | 'move';

export interface DraggableOptions {
	id?: string;
	enabled?: boolean;
	payload?: any; // may be a function
	effectAllowed?: EffectAllowed;
	isDragged?: Writable<Record<string, boolean>>;

	// hm... I don't think this is doable with the native DnD api
	// allowedAxis?: 'x' | 'y';
}
export const draggable = (node: HTMLElement, options: DraggableOptions) => {
	const DEFAULT_OPTIONS: Partial<DraggableOptions> = {
		id: 'draggable-' + Math.random().toString(36).slice(2),
		enabled: true,
		effectAllowed: 'all',
	};
	options = { ...DEFAULT_OPTIONS, ...options };

	// initalizer
	const _init = (_opts: DraggableOptions) => {
		if (_opts.enabled) {
			node.setAttribute('draggable', 'true');
			node.setAttribute('aria-grabbed', 'false');
		} else {
			node.removeAttribute('draggable');
		}
	};

	// init now
	_init(options);

	const _payload = () => (_isFn(options?.payload) ? options.payload() : options.payload);

	//
	const onDragstart = (e: DragEvent) => {
		const pld = _payload();
		if (pld !== undefined) {
			// add "stuic" as a custom data format
			e.dataTransfer?.setData('stuic', JSON.stringify({ id: options.id, payload: pld }));
			e.dataTransfer!.effectAllowed = options.effectAllowed!;
		}
		options?.isDragged?.update((old) => ({ ...old, [options.id!]: true }));
		node.setAttribute('aria-grabbed', 'true');
	};

	const onDrag = (e: DragEvent) => {
		// const el: HTMLElement = e.currentTarget as HTMLElement;
		// clog(el);
		// ?
	};

	const onDragend = (e: DragEvent) => {
		// e.preventDefault();
		options?.isDragged?.update((old) => ({ ...old, [options.id!]: false }));
		node.setAttribute('aria-grabbed', 'false');
	};

	node.addEventListener('dragstart', onDragstart);
	node.addEventListener('drag', onDrag);
	node.addEventListener('dragend', onDragend);

	return {
		update(newOptions?: DraggableOptions) {
			options = { ...options, ...(newOptions || {}) };
			// reinit maybe
			_init(options);
		},
		destroy() {
			node.removeEventListener('dragstart', onDragstart);
			node.removeEventListener('drag', onDrag);
			node.removeEventListener('dragend', onDragend);
		},
	};
};

//////////////////////////////////////////////////////////////////////////////////////////

export interface DroppableOptions {
	id?: string;
	enabled?: boolean;
	onDrop: (data: any, e: DragEvent) => void;
	onDragover?: (data: any) => void;
	dropEffect?: DropEffect;
	isDraggedOver?: Writable<Record<string, boolean>>;
}
export const droppable = (node: HTMLElement, options: DroppableOptions) => {
	const DEFAULT_OPTIONS: Partial<DroppableOptions> = {
		id: 'droppable-' + Math.random().toString(36).slice(2),
		enabled: true,
		dropEffect: 'move',
	};
	options = { ...DEFAULT_OPTIONS, ...options };

	//
	const onDragenter = (e: DragEvent) => {
		// e.preventDefault();
		// console.log('dragover', e.dataTransfer);
		e.dataTransfer!.dropEffect = options.dropEffect!;
		options?.isDraggedOver?.update((old) => ({ ...old, [options.id!]: true }));
	};

	const onDragover = (e: DragEvent) => {
		// prevent default to allow drop
		// this alse prevents animation (todo: really?)
		e.preventDefault();
	};

	const onDragleave = (e: DragEvent) => {
		// e.preventDefault();
		options?.isDraggedOver?.update((old) => ({ ...old, [options.id!]: false }));
	};

	const onDrop = (e: DragEvent) => {
		e.preventDefault();
		const target: HTMLElement = e.target as any;
		e.dataTransfer!.dropEffect = options.dropEffect!;
		options?.isDraggedOver?.update((old) => ({ ...old, [options.id!]: false }));
		if (_isFn(options.onDrop)) {
			let stuicData: any = e.dataTransfer?.getData('stuic');
			// prettier-ignore
			try { stuicData = JSON.parse(stuicData); } catch (e) {}
			return options.onDrop(stuicData, e);
		}
	};

	const _removeListeners = () => {
		node.removeEventListener('dragenter', onDragenter);
		node.removeEventListener('dragover', onDragover);
		node.removeEventListener('dragleave', onDragleave);
		node.removeEventListener('drop', onDrop);
	};

	//
	const _init = (_opts: DroppableOptions) => {
		_removeListeners();
		if (_opts.enabled) {
			node.addEventListener('dragenter', onDragenter);
			node.addEventListener('dragover', onDragover);
			node.addEventListener('dragleave', onDragleave);
			node.addEventListener('drop', onDrop);
		}
	};

	// init now
	_init(options);

	return {
		update(newOptions?: DroppableOptions) {
			options = { ...options, ...(newOptions || {}) };
			// reinit maybe
			_init(options);
		},
		destroy() {
			_removeListeners();
		},
	};
};
