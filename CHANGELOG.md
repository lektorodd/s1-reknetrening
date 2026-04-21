# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
