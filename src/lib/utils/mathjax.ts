// MathJax for Svelte components.
//
// The app serves its own pinned copy (scripts/copy-mathjax.mjs puts it in
// static/mathjax/), and loads it the first time something asks for maths, so a
// page without maths never downloads it.

import { base } from '$app/paths';

let loading: Promise<any> | null = null;

/**
 * Load MathJax once and resolve when it is ready to typeset. A page that never
 * shows maths never calls this. If the script fails to load, the promise
 * rejects and the maths stays on screen as raw LaTeX.
 */
function loadMathJax(): Promise<any> {
	if (loading) return loading;
	loading = new Promise((resolve, reject) => {
		const w = window as any;
		w.MathJax = {
			tex: {
				inlineMath: [['$', '$'], ['\\(', '\\)']],
				displayMath: [['$$', '$$'], ['\\[', '\\]']]
			},
			startup: {
				// Every element with maths asks for its own typeset through the
				// queue below, so the whole-page pass at startup is not needed.
				typeset: false,
				ready: () => {
					w.MathJax.startup.defaultReady();
					w.MathJax.startup.promise.then(() => resolve(w.MathJax));
				}
			}
		};
		const script = document.createElement('script');
		script.src = `${base}/mathjax/tex-mml-chtml.js`;
		script.async = true;
		script.onerror = () => reject(new Error('MathJax did not load'));
		document.head.appendChild(script);
	});
	return loading;
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
		.then(loadMathJax)
		.then((mj) => {
			// Checked when the turn comes, not when queued: the element may have
			// left the page while MathJax was loading.
			if (el.isConnected) return mj.typesetPromise([el]);
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
		// Nothing to clear yet, or MathJax is still loading.
	}
	el.textContent = text;
	typesetElement(el);
}
