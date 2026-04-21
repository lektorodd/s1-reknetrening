## Project Configuration

- **Language**: TypeScript
- **Package Manager**: npm
- **Add-ons**: none

---

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains two standalone educational web applications for teaching mathematics at the Norwegian secondary school level (videregående skole):

1. **derivasjon-v2.html** - Interactive derivative practice application ("Ferdighetstrening Derivasjon")
2. **forteiknslinjer.html** - Sign chart generator ("Forteiknsskjemagenerator")

Both applications are self-contained single-file HTML applications with embedded JavaScript, CSS, and use external CDN dependencies.

## Architecture

### Technology Stack
- **Frontend Framework**: Vanilla JavaScript (no build system)
- **Styling**: Tailwind CSS (CDN) for derivasjon-v2.html, custom CSS for forteiknslinjer.html
- **Math Rendering**: MathJax 3 for LaTeX rendering
- **Charts**: Chart.js (derivasjon-v2.html only)
- **Fonts**: Google Fonts (Inter, JetBrains Mono)
- **Icons**: FontAwesome 6.4.0 (derivasjon-v2.html only)

### Application Structure

Both applications follow a similar pattern:
- Single HTML file with inline `<script>` and `<style>` tags
- Client-side state management using JavaScript objects
- LocalStorage for persistence
- Multi-language support (Norwegian, English, Spanish)

## Derivasjon-v2.html (Derivative Practice)

### Core Features
- **Smart Mix Mode**: Adaptive algorithm that prioritizes problems the student needs practice with
- **Focus Mode**: Allows students to filter problems by rule, difficulty level (1-5), and math area
- **Three Derivative Rules**: Chain rule, Product rule, Quotient rule
- **Problem Types**: Polynomials, roots, exponential, logarithms
- **Progress Tracking**: LocalStorage-based progress with Chart.js visualizations

### Key State Management
```javascript
state = {
    currentView: 'dashboard' | 'theory' | 'practice' | 'stats' | 'help',
    language: 'no' | 'en' | 'es',
    activeTopic: 'chain' | 'product' | 'quotient',
    mode: 'focus' | 'mix',
    progress: {}, // Maps problem ID to 'mastered' | 'practice'
    hints: [],    // Array of problem IDs where hints were used
    activeProblems: [],
    filters: { levels: [1-5], types: ['poly', 'root', 'exp', 'log'] }
}
```

### Problem Generation
- Problems are generated procedurally in `generateProblemBank()` at runtime
- Each problem includes: question (LaTeX), answer, step-by-step solution, and hint
- ~1200 problems generated (3 rules × 5 levels × 4 types × 20 variations)

### Navigation
- Single-page application with view switching via `navigateTo(viewId)`
- Views: dashboard, theory, practice, stats, help

## Forteiknslinjer.html (Sign Chart Generator)

### Core Features
- Interactive sign chart generator for rational functions
- Supports multiple factors in numerator and denominator
- Automatic zero detection and sign analysis
- SVG-based rendering with MathJax integration

### Mathematical Parsing
- Parses linear expressions: `ax + b`, `b + ax`, `ax`, `-x`
- Supports special constants: `pi`, `e`, `rot(n)` (square root)
- Supports fractions: `1/2`, exponents: `2^3`
- Automatic symbolic representation with LaTeX

### Key Functions
- `parseSingleFactor(raw)`: Parses mathematical expressions into evaluable functions
- `generateSignChart()`: Main orchestration function
- `drawSignLine()`: SVG rendering for sign intervals
- `parseValue(str)`: Recursive parser for mathematical values

### Factor Reordering
- Users can reorder factors with up/down arrow buttons
- `moveFactorUp()`, `moveFactorDown()`, `updateArrowStates()`

## Development Workflow

### Testing
No automated tests exist. Manual testing workflow:
1. Open HTML files directly in a browser
2. Test mathematical expression parsing with edge cases
3. Verify MathJax rendering completes
4. Test LocalStorage persistence (derivasjon-v2.html)
5. Test across browsers (Safari, Chrome, Firefox)

### Localization
Both apps use i18n objects:
```javascript
const i18n = {
    nn: { key: "Norsk tekst" },
    en: { key: "English text" },
    es: { key: "Texto español" }
}
```
Update translations in all three languages when adding features.

### MathJax Integration
- Both apps use `MathJax.typeset()` after DOM updates
- For dynamic content: `await MathJax.typesetPromise([container])`
- Inline math: `$...$` or `\(...\)`
- Display math: `$$...$$` or `\[...\]`

## Common Patterns

### Adding New Problem Types (derivasjon-v2.html)
1. Add type to `types` array in `generateProblemBank()`
2. Extend the switch/if logic in `generateSingleProblem()` for each rule
3. Update filter UI in HTML to include new type checkbox
4. Add translations for the new type in `i18n` object

### Modifying Sign Chart Rendering (forteiknslinjer.html)
1. SVG dimensions: `CHART_WIDTH`, `ROW_HEIGHT`, `PADDING` constants
2. Scaling function: `scale(x)` maps domain values to pixel coordinates
3. All rendering uses SVG primitives or MathJax foreignObject elements

## File References
- derivasjon-v2.html:305-318 - Core state object definition
- derivasjon-v2.html:503-526 - Problem bank generation
- derivasjon-v2.html:528-698 - Problem generation logic by rule
- forteiknslinjer.html:592-750 - Main sign chart generation
- forteiknslinjer.html:865-992 - Mathematical expression parser
