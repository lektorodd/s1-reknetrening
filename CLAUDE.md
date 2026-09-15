## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# CLAUDE.md

Guidance for Claude Code (claude.ai/code) when working in this repository.

## Project Overview

**Mattetrening** — a SvelteKit app for adaptive maths practice at Norwegian upper
secondary level (S1). Nynorsk only. Ships as static files (`adapter-static`), stores
everything in localStorage, and has no backend.

The goal shaping every decision: make it easy for a student to work **steadily, often,
and at their own level**. Simplicity of the student's path beats feature count.

Two legacy single-file apps sit at the repo root and are **not** part of the SvelteKit
build: `derivasjon-v2.html` (superseded) and `forteiknslinjer.html` (a sign-chart
generator, earmarked as a future module).

## The central split

Instruction and drill are deliberately separate:

- **Lærebok** (`/laer/`) — curated, hand-written content from each module's
  `theory.ts`. Read-only: no rating, no scheduling, no problems to answer.
- **Treningsrom** (`/tren/`) — the generated problem bank from each module's
  `generator.ts`. Adaptive, scheduled, rated.

**Difficulty and support are separate axes, and they live in separate places.**

- *Difficulty* is the bank's five levels per topic. A session varies this, and only this:
  every card is an ordinary problem — question, optional hint, "Vis løysing" showing the
  whole solution, then self-assessment. The topic filter at the top of `/tren/` lets a
  student pin a topic and/or level; left alone, the engine chooses.
- *Support* — how much of the solution is already filled in — is the fading ladder, and
  it is instruction. `PracticeLadder.svelte` on each Lærebok topic page walks five rungs
  from a fully worked example to an unaided problem, a different problem at each rung, at
  the student's own pace. Nothing there is rated or scheduled, and the self-explanation
  prompts live there too. The ladder carries **both** axes: the student picks a
  difficulty (1-5) as well as a rung, so `+page.ts` loads one ladder per level.

A session must never mix the two. Faded and unfaded problems drawn side by side make it
pot luck which kind of task comes next, which is what the split exists to prevent.
`fadeSteps()` is used by the ladder alone; there is deliberately no function that picks a
fading level on the student's behalf.

The Lærebok holds two things per topic: the curated theory and worked example from
`theory.ts`, and the ladder. A separate row of fixed worked examples at levels 1/3/5 was
tried and removed — the ladder's first rung is already a fully worked example, and its
difficulty selector covers the rest, so the row was a third copy of the same thing.

## Architecture

```
src/lib/
  modules/      types.ts (shared contract) · registry.ts · rng.ts · derivative/ · logarithm/
  engine/       session.ts · ladder.ts · problem-selector.ts
                spaced-repetition.ts · student-model.ts · guidance-fading.ts
  components/   AppHeader · SessionCard · TopicFilter
                TheoryArticle · PracticeLadder
  content/      strings.ts (shared UI text)
  utils/        storage.ts · mathjax.ts
src/routes/     / · /tren/ · /laer/[modul]/[emne]/ · /framgang/
```

### Module contract

`TopicModule` in `src/lib/modules/types.ts` is the only thing the rest of the app knows
about a topic. A module folder exports one of these; `MODULE_REGISTRY` lists it. Nothing
else — no route, no component, no engine branch — is per-module.

**Adding a topic (e.g. integrasjon):**
1. `src/lib/modules/integral/` with `generator.ts`, `theory.ts`, `self-explanation.ts`,
   `index.ts` exporting a `TopicModule`.
2. Add it to `MODULE_REGISTRY` in `registry.ts`.

Concept ids are **derived from the generated bank**, never hand-declared — a test
asserts every concept has problems behind it.

### Conventions that bite if broken

- **Bare LaTeX.** `Problem.q`, `Problem.a`, `StepEntry.latex`, `TheoryEntry.formula` and
  `workedSteps[].latex` hold LaTeX with **no delimiters**; the view adds `\[...\]`.
  Prose fields (`intro`, `patternRecognition`, `thinkAloud`, `mnemonic`, `example`,
  step `explanation`) may carry their own inline `$...$`. A test enforces this.
- **Deterministic ids.** A problem id is `<moduleId>:<topic>:<level>:<variant>` and the
  generator seeds its RNG from it (`rngFor` in `modules/rng.ts`), so the same id always
  yields the same problem. Never introduce unseeded `Math.random()` into a generator.
- **Storage** is namespaced `mattetrening_v1_` and every access is wrapped — a browser
  can refuse localStorage entirely.

## Development

```bash
npm install
npm run dev      # http://localhost:5190
npm run test     # vitest
npm run check    # svelte-check — keep at 0 errors
npm run build    # static output in build/
```

MathJax loads from a CDN in `src/app.html`; in a sandboxed environment it may be
blocked, so assert the `\[...\]` markup rather than rendered `mjx-container` elements.

Call `typesetElement(el)` after DOM updates that introduce maths.
