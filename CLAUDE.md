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

**Every card in a session is work to do.** Scaffolding varies — `selectFadingLevel()`
picks a level per concept — but a session never serves a study-only card. Level 0 is a
fully worked example, which is instruction, so it belongs to the Lærebok; practice
starts at level 1 (`MIN_PRACTICE_LEVEL`), a completion problem showing every step but
the last. Opening the Treningsrom always means practising, never a coin flip between
reading and doing. Each card links out to its Lærebok article for the worked example.

The Lærebok holds both kinds of worked example: the curated one written in `theory.ts`,
and fully solved generated problems at three difficulty levels (`WorkedExamples.svelte`),
so a student can study as many examples of the same shape as they want without any of it
being counted or scheduled.

## Architecture

```
src/lib/
  modules/      types.ts (shared contract) · registry.ts · rng.ts · derivative/ · logarithm/
  engine/       session.ts · problem-selector.ts · spaced-repetition.ts
                student-model.ts · guidance-fading.ts
  components/   AppHeader · SessionCard · TheoryArticle
  content/      strings.ts (shared UI text)
  utils/        storage.ts · mathjax.ts
src/routes/     / · /tren/ · /laer/[modul]/[emne]/ · /framgang/ · /velg/
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
