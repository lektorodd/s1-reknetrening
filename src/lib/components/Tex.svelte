<script lang="ts">
	// One maths expression, and the only place in the app that writes LaTeX into
	// the DOM.
	//
	// It exists because reactive maths does not work on its own. MathJax replaces
	// the `\[...\]` text node with its own <mjx-container>; after that, Svelte's
	// reactive text node is no longer in the document, and a new value has
	// nowhere to be written. The screen keeps showing the first formula it ever
	// typeset — which is how the Lærebok came to show the chain rule under the
	// heading "Delvis integrasjon".
	//
	// renderInto sets textContent, which throws MathJax's container out and puts
	// the raw LaTeX back, so the typesetting has something to work on. That is
	// exactly the step Svelte cannot do by itself once MathJax has taken the node.
	// Prose with `$...$` inside it goes through TexProse, the same way.
	//
	// Fields hold bare LaTeX, as CLAUDE.md requires; the delimiters go on here.
	//
	// Named Tex, not Math: `Math` shadows the global Math object inside the
	// component that imports it, and Math.min/floor then fail to compile.

	import { renderInto } from '$lib/utils/mathjax';

	interface Props {
		/** Bare LaTeX — no delimiters. */
		tex: string;
		/** Display maths on its own line, or inline within a sentence. */
		display?: boolean;
	}

	let { tex, display = true }: Props = $props();
	let el = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!el) return;
		renderInto(el, display ? `\\[${tex}\\]` : `\\(${tex}\\)`);
	});
</script>

<span bind:this={el}></span>
