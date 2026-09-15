# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.7.0] - 2026-09-15

Difficulty and support are two different axes, and this release stops mixing them.
A session varies difficulty; the fading ladder varies support and belongs to the Lærebok.

### Added
- **Practice ladder** in the Lærebok (`PracticeLadder.svelte`, `engine/ladder.ts`). Five
  rungs per topic, from a fully worked example to an unaided problem, with a *different*
  problem at each rung so the student practises the pattern rather than memorising one
  answer. The student steps through it at their own pace; nothing is rated or scheduled.
- **Topic filter** at the top of `/tren/` (`TopicFilter.svelte`) — pin a topic and/or a
  level, or leave it alone and let the engine choose. Replaces the separate `/velg/` page.

### Changed
- **A training session is the plain problem bank again.** Cards are ordinary problems:
  question, optional hint, "Vis løysing" showing the whole solution, self-assessment.
  No partially-filled solutions, no hidden steps. Previously the session drew faded and
  unfaded problems side by side, so it was pot luck which kind of task came next.
- Card badges now name **topic and level** ("Kjerneregelen · Nivå 3") rather than how
  much help is shown.
- Self-explanation prompts moved from the session to the ladder's middle rungs, which is
  the placement they were written for.
- The cold-start level cap is a preference rather than a filter. A new student who picked
  level 5 in the topic filter previously got an empty session, because cold start refuses
  anything above level 2.

### Removed
- `selectFadingLevel()` — with the ladder browsed by the student, nothing picks a fading
  level on their behalf. Removed rather than left as dead code.
- `src/routes/velg/` — the choice now lives in `/tren/` where it is used.

## [0.6.0] - 2026-09-15

A restructure around one idea: keep instruction and drill in separate places, and give
the student a single button instead of a mode menu.

### Added
- **Lærebok** (`/laer/`) — all curated theory and worked examples, deep-linkable per
  topic (`/laer/derivasjon/chain/`). Previously navigation lived in component state, so
  a refresh always dropped the student back on a dashboard.
- **Treningsrom** (`/tren/`) — one adaptive session, interleaved across every module.
- **Framgang** (`/framgang/`) — registry-driven progress: streak, success rate,
  per-concept confidence grouped by module, seven-day history, review schedule.
- **Vel sjølv** (`/velg/`) — manual topic and level escape hatch.
- `TopicModule` contract (`modules/types.ts`) and a real `registry.ts`. Adding a topic
  is now a folder plus one registry line.
- Deterministic problem ids (`derivative:chain:3:5`) with a seeded RNG (`modules/rng.ts`).
- `engine/session.ts` — builds a session and attaches a per-concept fading level, never
  below `MIN_PRACTICE_LEVEL`.
- `WorkedExamples.svelte` — fully solved generated problems at three levels, shown in the
  Lærebok under each topic's theory.
- 21 new tests (68 total), covering the generators, the registry, the math convention,
  the session builder and storage migration.

### Changed
- **Worked examples belong to the Lærebok, not to a session.** A session serves only
  cards the student does something with (fading levels 1–4); the fully worked example
  sits in the Lærebok and every card links to it. An earlier draft of this release mixed
  study-only cards into the session, which made it unpredictable whether opening the
  Treningsrom meant reading or practising.
- **Nynorsk only.** The English and Spanish tables, the language picker and
  `src/lib/i18n/` are gone; content records hold plain strings.
- `selectFadingLevel()` is now actually called. Both guided views previously walked a
  fixed `[0,1,2,3,4]` array, so the adaptive scaffolding was written, tested and
  disconnected.
- `problem-selector.ts` is module-neutral. It imported the derivative `Problem` type,
  hardcoded `['chain','product','quotient']` and split concept ids on `_`; the logarithm
  route therefore bypassed it entirely with a random shuffle.
- Concept ids are derived from the generated bank instead of hand-declared: 11 real
  concepts replace 18 declared ones, 7 of which no generator could produce.
- All LaTeX fields store bare LaTeX; views supply the delimiters. The two modules
  previously disagreed, which is why no single card component could render both.
- Storage namespace `derivasjon_v3_` → `mattetrening_v1_`, with a one-way migration.
- Renamed to Mattetrening; `app.html` now declares `lang="nn"`.

### Fixed
- Problem ids were manual offsets (`1000`, `5000`) and the bank was regenerated with
  fresh random coefficients on every mount, while progress was stored **by id** — so
  every rating pointed at a different problem after a reload.
- Fading level 3 revealed *more* steps than level 2 on short problems
  (`ceil(0.4 × 3) = 2` against `3 − 2 = 1`); the ladder is now monotonic.
- The 60/30/10 split degenerated to 60/40/**0** at the default session size, so students
  stopped meeting new concepts. `splitBudget()` now reserves the remainder.
- Self-explanation prompts always had the correct option first — answerable without
  reading. `SessionCard` shuffles them with an RNG seeded by the problem id.
- A new student received a session of nothing but study cards; worked examples are now
  capped per session (`MAX_WORKED_EXAMPLES`).
- Orphaned concepts are pruned from the student model instead of lingering forever.
- Stats hardcoded `chain/product/quotient × poly/root/exp/log`, so logarithm concepts
  were invisible or rendered as `log_product × undefined`.
- Derivative step labels were hardcoded English ('Identify', 'Differentiate g'); they
  are nynorsk in the generator now, which also removes the two hand-maintained
  translation tables that lived inside the card components.

### Removed
- `src/routes/logaritmer/+page.svelte` (1259 lines) and `src/routes/derivasjon/+page.svelte`,
  both replaced by the shared module-driven routes.
- 13 components, including the `FadedProblemCard` / `LogFadedProblemCard` fork and
  `ProblemCard` — one `SessionCard` covers fading levels 0-4 for every module.
- `src/lib/i18n/` (559 lines), `src/lib/stores/`, the per-module `types.ts` files, four
  unused barrel files, and ~190 lines of unused CSS.

## [0.5.0] - 2026-03-21

### Added
- Multi-module architecture with `registry.ts` and dynamic concept IDs
- Logarithm module: 6 topics × 5 levels × 8 variants = 240 problems
  - Product, Quotient, Power rules, Simplification, Log equations, Exponential equations
  - Full theory bank with worked examples in 3 languages
  - Self-explanation prompts for each topic
- Platform landing page at `/` with hero, module cards, and pedagogical principles
- Guided practice view for logarithms with step-by-step walkthroughs
- 27 new i18n keys across all 3 languages
- Back-to-modules navigation link in Header

### Changed
- App renamed from "Derivasjonstrening" to "Mattetrening"
- Derivative module moved to `/derivasjon/` route
- Student model now auto-discovers concepts from module registry
- `loadStudentModel()` migrates existing data automatically when new modules are added

## [0.4.0] - 2026-03-20

### Added
- Backward fading system (levels 0-4) with adaptive scaffolding
- FadedProblemCard component with animated step reveal UI
- `guidance-fading.ts` engine: `selectFadingLevel()` and `fadeSteps()`
- Self-explanation prompts (multiple choice, 3 languages) for chain/product/quotient rules
- Structured steps (`structuredSteps[]`) in all generators alongside legacy `steps` string
- 11 new i18n keys for fading prompts (NO/EN/ES)
- 8 new unit tests for guidance fading (36 total)

### Changed
- Smart Mix uses FadedProblemCard; Focus mode keeps original ProblemCard
- Problem generators now produce 5-6 discrete `StepEntry` objects per problem

## [0.3.0] - 2026-03-20

### Added
- Learning Engine with FSRS-inspired spaced repetition algorithm
- StudentModel schema: 12 concept IDs with Bayesian confidence, ease factors, and interval scheduling
- Adaptive problem selector with 60/30/10 split (review/challenge/new)
- Cold-start fallback with weighted random sampling across topics
- Success rate tracking and display on Stats page (4 stat cards)
- Due-for-review count displayed on Dashboard
- `stat_due_review` and `stat_success_rate` i18n keys (NO/EN/ES)

### Changed
- Smart Mix now uses adaptive `selectNextProblems()` instead of naive weighted-random
- `rateProblem()` now updates both legacy progress map and StudentModel via `updateAfterAttempt()`
- Stats page grid expanded from 3 to 4 columns

## [0.2.0] - 2026-03-20

### Added
- Internationalization system with Norwegian, English, and Spanish support
- LocalStorage abstraction layer with `derivasjon_v3_` prefix and SSR safety
- App state management with Svelte 5 `$state` and `$derived` runes
- Derivative module: types, theory bank, and problem generator (1200 problems)
- MathJax utility for SSR-safe typesetting
- Responsive Header component with desktop nav, mobile hamburger, and language switcher
- ProblemCard component with hint/solution toggle, MathJax re-rendering, and self-assessment rating
- Dashboard page with mode cards (Smart Mix / Focus), quick stats, and quick links
- Practice Arena with focus/mix toggle, filter panel (rule, level, type), problem list, and round-end actions
- Theory Bank with topic selector and formula display
- Stats page with CSS-only donut chart, per-topic and per-level bar charts
- Help page with mode explanations and about section

### Fixed
- Featured card text contrast (white text on dark backgrounds)
- Input examples to use keyboard-style notation (x^2)
- Progress bars using consistent primary color

## [0.1.0] - 2026-03-20

### Added
- SvelteKit project initialized with TypeScript and Svelte 5 (runes mode)
- Static adapter configured for shareable static file deployment
- Axiom Geometric design system implemented with CSS custom properties
- Epilogue font from Google Fonts as primary typeface
- Color palette: Indigo primary, Emerald success, Amber warning, Coral error
- Rounded pill buttons and 24px-radius card components
- Root layout with responsive app shell
- Welcome page verifying design system tokens
- Project structure skeleton (`lib/components`, `lib/engine`, `lib/modules`, `lib/stores`, `lib/utils`, `lib/i18n`)
- CHANGELOG.md, LOGG.md, and version-workflow document
- Git repository initialized with `.gitignore`
