# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.9.1] - 2026-09-16

Tre ting brukaren peika på i løysingsstega, og alle tre viste seg å ha ei anna årsak enn
det såg ut som.

### Fixed
- **Rullefelt i kvart einaste steg.** `.step-math` rullar vassrett for lange formlar, og
  CSS tillet ikkje at éin akse rullar mens den andre er `visible` — så `overflow-y` blir
  `auto`, og alt som stikk ut blir eit loddrett rullefelt. Det som stakk ut var ikkje
  formelen, men `mjx-assistive-mml`: MathML-kopien MathJax lagar for skjermlesarar, som er
  klippa men beheld full høgd. Han får no den vanlege 1×1px-boksen, og stega litt meir
  polstring til resten. Målt: **48 av 85 steg kunne rulla før, 0 av 82 no.**
- **Inline matte i stega.** Stega brukte `\(...\)`, som blir mindre enn omgjevnadene og
  sit ujamnt. Dei er display-matte no, som i Læreboka, og venstrestilte så løysinga blir
  lesen nedover med kvar line under sin eigen etikett.
- **«LN X» øvst i eit steg.** `.step-label` er ein merkelapp — liten, feit, versalar — og
  eg hadde skrive fulle setningar med LaTeX i. MathJax rendra matten inni merkelappen, så
  «$\ln x$ skal deriverast — vi kan ikkje integrere han direkte» kom ut som ein kursiv
  «ln x» limt til resten i versalar. Alle 192 etikettane i integrasjonsmodulen er korte
  merkelappar no, som i dei andre modulane.

### Added
- Ein test som handhevar etikettforma for **heile registeret**: ingen `StepEntry.label`
  kan innehalde LaTeX, og ingen kan vere over 40 teikn.

## [0.9.0] - 2026-09-16

Integrasjon kjem inn, og med han eit kurs-skilje: S2-stoff blandar seg ikkje inn i ei
S1-økt. Å terpe delvis integrasjon og få ei logaritmelikning i neste kort er støy — dei to
er ikkje alternativ til kvarandre slik S1-reglane er.

### Added
- **Integrasjonsmodulen** (S2): variabelskifte, delvis integrasjon, delbrøkoppspalting og
  blanda metodar, fem nivå kvar, 160 oppgåver. Kvar metode blir introdusert som ein
  derivasjonsregel lesen baklengs — det er ikkje berre ein metafor, delvis integrasjon
  *er* produktregelen integrert på begge sider.
- **Kurs som øvste akse.** `TopicModule` har `course: 'S1' | 'S2'`, og filterpanelet er
  tredelt: kurs → fag → emne. Vel du S2, viser panelet berre integrasjon.
- **Filteret blir hugsa** under `tren_filter`, så valet står mellom økter. Standard for ein
  ny elev er S1, det appen var.
- `filterBank({ course })`, og eit «blanda»-emne der metodevalet er sjølve ferdigheita:
  grunnregel-oppgåver og eit variabelskifte forkledd som delbrøk ligg innimellom, så
  modusen ikkje i seg sjølv røper at ein metode trengst.
- **Numerisk kontroll av kvar antiderivert som test.** Alle familieformlane blir sjekka
  med sentraldifferanse: $F' = f$ i fleire punkt. Ein feil fasit er den eine feilen ein
  elev ikkje kan fanga — appen viser dei ei løysing, og dei har ingen grunn til å tvile.

### Changed
- Fallback-en i `filterBank` utvidar eitt steg om gongen — slepp nivået, så emnet, så
  faget — og **forlèt aldri kurset**. Før fall han rett til heile banken, som med kurs ville
  bety at ei S2-økt stilt gav logaritmeoppgåver: akkurat feilen skiljet skal fjerne.
- Lærebok grupperer fagkorta under kursoverskrifter.

### Fixed
- **Nivåtaket i kaldstarten var ikkje eit tak.** Integrasjonskonsepta lever på eitt nivå
  kvar, og veljaren fall tilbake til heile konseptet når ingenting låg innanfor taket — så
  ein fersk elev fekk nivå-5-integral i første økt. Taket biter no per konsept når banken
  har noko lett, og slepper berre når han ikkje har det.
- Eit konstantledd forsvann ut av svaret når koeffisienten var 1: `e^{-x}(-(x) - )`.
- `-(2x-3)` vart skrive `-2x-3`. Negering av ein sum utan parentes er eit anna polynom.
- Same oppgåve kunne dukke opp tre gonger på eitt nivå. Generatoren re-seedar no på ein
  salta id ved kollisjon; id-en er framleis kanonisk, så determinismen held.

## [0.8.2] - 2026-09-15

Treningsrommet seier no kva fag ein oppgåve høyrer til. Filteret listar emna under
fagoverskrifter i staden for flatt, og kortet ber modulnamnet.

### Added
- **Filteret er gruppert per fag**, med fagets ikon og farge som overskrift — same
  mønster som Lærebok og Framgang. «Potenssetninga» seier ingenting til ein elev som
  ikkje alt veit at ho er logaritmar, og med integrasjon ville den flate lista blitt
  fjorten emne lang.
- **«Alle» per fag**, det steget mellom «alle fag» og eitt emne som ikkje fanst. Ein kan
  no trena heile derivasjon utan å velja eitt emne.
- **Modulnamnet på oppgåvekortet**, som eigen merkelapp i fagfargen framfor emne og nivå.
  Kortet hadde alt fagfargen på venstrekanten, men farge åleine seier ikkje kva faget
  heiter, og ei økt blandar fag med vilje.
- `filterBank(bank, { moduleId, topic, level })` i `engine/session.ts` — filtreringa låg
  inline i sida og kunne ikkje testast. «Tom? bruk heile banken»-utvegen ligg no på éin
  stad.

### Changed
- Filtertilstanden er `moduleId` + `topic` i staden for éin samanslegen streng
  `"derivative:chain"`, som ikkje kunne uttrykkja «heile derivasjon».
- Oppsummeringslinja seier «Derivasjon · Kjerneregelen · nivå 3», ikkje «Alle emne».

### Fixed
- **Lyseblå strekar over sida.** `--color-primary-50/-100` var tekne i bruk som flater.
  Verst var framdriftsstripa i Tren: ved start er fyllet null breitt, så heile sporet
  stod att som ein blå strek. Spor og skinner er varme no — stripa, stigens hjelpe-
  prikkar og søylene på Framgang. Blå ber det som er *fylt*.
- **Oppgåveboksen var for mørk.** Førre runde sette han til `--color-sunk` for å hindra at
  han lånte sidebotnen sin krem; det var ei overkorrigering. `--sunk` ber små innfelte
  ting som `kbd` og `code`, ikkje ei stor flate. Boksen, stigens formelfelt og felta i
  gjennomgått døme ligg no eit hakk mjukare, med `--color-line`-ramme.
- **Oppgåveboksen var uforholdsmessig høg.** Høgda kom ikkje frå polstringa, men frå
  MathJax sine eigne 1em-marginar på display-matte oppå polstringa. Dei er trimma.

## [0.8.1] - 2026-09-15

Corrects the Lektorodd theme against its real source. The first pass took the palette
from the `itslearning-boksar` skill, which only describes what an inline-styled LMS box
needs — not the page chrome. The full theme lives in the "Slik lagar du klassekart"
artifact.

### Added
- **The squared-paper grid**, the theme's signature ground: two 1px linear-gradients in
  `rgba(31,41,51,.045)` at `34px 34px`, fixed.
- **Space Grotesk** for headings, alongside Source Sans 3 for body and JetBrains Mono.
  Without the display face the page reads flat however right the colours are.
- A four-step surface scale — ground `#F6F1E6`, surface `#FCFAF4`, raised `#FFFFFF`,
  sunk `#EFE9DC` — replacing the two-step one.
- The real `.mark`: a mint highlighter swept across a run of text. The circular glyph
  that opens a titled box is now `.badge-mark`.

### Fixed
- **An inset field borrowed the page's cream** inside a raised card, which is what made
  the question box look out of place. Inset fields take `--color-sunk`.
- **Rules and borders were cool grey** `#E3E6EA` against a warm cream ground. They are
  `--color-line #E8E1D2` now.
- **Ghost buttons read as washed out** — muted grey on no surface. They carry ink-strong
  labels on `--color-surface` with a `--color-line-strong` border.
- Body text is `--color-text` again. The previous release darkened both greys to clear
  AA, but the cause was the global `p` rule painting all body copy muted; the theme uses
  full ink for body and reserves `#6B6F77` for ledes, captions and meta lines.
- `.app-shell` painted a solid cream fill over the whole viewport, which would have
  hidden the grid. It is transparent.

## [0.8.0] - 2026-09-15

The app now wears the Lektorodd theme, the same one the teacher's own itslearning
material uses, so a student meets one visual language in both places.

### Changed
- **Palette** from the `itslearning-boksar` skill: cream `#F6F1E6` ground, `#1F2933`
  body text, and the four accents that each carry a fixed meaning — blue `#2B6CB0`
  (info, primary action), green `#276749` (correct), red `#C53030` (warning), violet
  `#805AD5` (worked example and formula), plus mint `#98D3B4` as the house highlight.
- **Typography** Epilogue → Source Sans 3, with JetBrains Mono available for formula
  fields.
- **Form**: pills are gone. Radii drop to 4/6/8px, and cards and boxes carry the 4px
  coloured left edge that marks a Lektorodd box. `--radius-full` survives only for
  genuinely circular things — progress dots, level buttons, step numbers.
- **Colour now means something specific.** The rule box is violet with a `Σ` mark,
  worked-example steps are numbered in violet circles, the mnemonic sits on mint with a
  `✓`, a hint has a yellow edge, and right/wrong are green/red — the same coding as in
  the itslearning boxes.
- **Module accents**: derivative `#3F51B5` → `#2B6CB0`, logarithm `#0D9488` → `#276749`.
- `DESIGN.md` rewritten from "Axiom Geometric" to Lektorodd.

### Fixed
- Body text met only 4.48:1 against the cream ground, under AA. Both muted greys are a
  step darker than the palette's `#6B6F77` — `#5F636B` (5.35:1) and `#64686F` (4.97:1) —
  because this app puts running text where an itslearning box puts a short meta line.

## [0.7.0] - 2026-09-15

Difficulty and support are two different axes, and this release stops mixing them.
A session varies difficulty; the fading ladder varies support and belongs to the Lærebok.

### Added
- The ladder carries **both axes**: a difficulty selector (1-5) alongside the support
  rungs, so a student can rerun the same sequence on harder problems.
- **Practice ladder** in the Lærebok (`PracticeLadder.svelte`, `engine/ladder.ts`). Five
  rungs per topic, from a fully worked example to an unaided problem, with a *different*
  problem at each rung so the student practises the pattern rather than memorising one
  answer. The student steps through it at their own pace; nothing is rated or scheduled.
- **Topic filter** at the top of `/tren/` (`TopicFilter.svelte`) — pin a topic and/or a
  level, or leave it alone and let the engine choose. Replaces the separate `/velg/` page.

### Changed
- Derivative theory no longer shows the same expression twice. "Tenk høgt" narrated the
  exact problem "Gjennomgått døme" then solved again, answer included, in all three
  topics — and the quotient rule showed `x/(x+1)` a third time in its `example` line.
  Each section now uses a different expression, and a different function family where it
  helps: the chain rule reasons about a root, the product rule about `x·ln x`. Every new
  derivative was checked numerically against a central difference before being written.
- `ruleText` means the same thing in both modules. In the logarithm module it was an
  explanatory sentence; in the derivative module it was a fragment of the formula
  (`"g'(u) · u'(x)"`) printed as bare text directly beneath the formula containing it.
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
- The "Fleire gjennomgåtte døme" row (three fixed worked examples at levels 1/3/5) and
  `WorkedExamples.svelte`. The ladder's first rung is already a fully worked example and
  its difficulty selector covers the spread, so the row was a third copy of the same
  thing on an already long page.
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
