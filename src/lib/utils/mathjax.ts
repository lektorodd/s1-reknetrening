// MathJax utility for Svelte components

/**
 * Call after DOM updates to re-render all MathJax on page
 */
export function typesetMath(): void {
	if (typeof window !== 'undefined' && (window as any).MathJax?.typeset) {
		try {
			(window as any).MathJax.typeset();
		} catch {
			// Suppress typeset errors during transitions
		}
	}
}

/**
 * MathJax 3 wants typeset calls one at a time: two running at once can each
 * pick up the other's half-converted nodes. Every call goes through this chain.
 */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Typeset a specific element only
 */
export function typesetElement(el: HTMLElement): void {
	if (typeof window === 'undefined') return;
	queue = queue
		.then(() => {
			// Checked when the turn comes, not when queued: MathJax loads async,
			// and if it isn't here yet its own startup pass will typeset the page.
			const mj = (window as any).MathJax;
			if (el.isConnected && mj?.typesetPromise) return mj.typesetPromise([el]);
		})
		.catch(() => {});
}

/**
 * Put text containing maths into an element and typeset it.
 *
 * The one way components write maths to the DOM. MathJax replaces the text
 * nodes it converts with its own elements, so Svelte's reactive text cannot be
 * updated afterwards — a new value has nowhere to go and the old maths stays on
 * screen. Setting textContent throws MathJax's output away and puts raw text
 * back for it to work on. MathJax is first told to forget the old maths, or its
 * list of typeset items grows with every page the student opens.
 */
export function renderInto(el: HTMLElement, text: string): void {
	const mj = typeof window !== 'undefined' ? (window as any).MathJax : undefined;
	try {
		mj?.typesetClear?.([el]);
	} catch {
		// Nothing to clear yet.
	}
	el.textContent = text;
	typesetElement(el);
}
