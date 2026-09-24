<script lang="ts">
	// A piece of prose that may carry its own inline maths as `$...$` — theory
	// text, hints, reflection questions and their options.
	//
	// Written as plain `{text}`, the maths only rendered when MathJax's startup
	// pass happened to find it on a full page load. After navigating inside the
	// app the student saw raw `$f(x)=...$`, next to formulas left over from the
	// previous page, and a hint opened on a card was never typeset at all. This
	// is the same fix as Tex: renderInto writes the text and typesets it, every
	// time the text changes.
	//
	// Renders a bare <span>, so the surrounding element keeps its own styling
	// (`white-space: pre-line` for authored line breaks, say).

	import { renderInto } from '$lib/utils/mathjax';

	interface Props {
		/** Prose, with any maths delimited inline as `$...$`. */
		text: string;
	}

	let { text }: Props = $props();
	let el = $state<HTMLElement | null>(null);

	$effect(() => {
		if (!el) return;
		renderInto(el, text);
	});
</script>

<span bind:this={el}></span>
