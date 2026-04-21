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
 * Typeset a specific element only
 */
export function typesetElement(el: HTMLElement): void {
	if (typeof window !== 'undefined' && (window as any).MathJax?.typesetPromise) {
		(window as any).MathJax.typesetPromise([el]).catch(() => {});
	}
}
