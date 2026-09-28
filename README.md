# Mattetrening

Adaptiv rekneterping for S1 og S2. Nynorsk, ingen innlogging, ingen server — alt ligg i
nettlesaren, og appen byggjer til statiske filer.

Målet er at eleven skal jobbe **jamt, ofte og på sitt eige nivå**. Difor opnar appen
med éin knapp i staden for ein meny.

## Dei fire stadene

| Rute | Kva det er |
|---|---|
| `/` | Heim — kursval (S1 \| S2), «Start økta», rekkje og kva som ventar på repetisjon |
| `/tren/` | Treningsrom — ei økt på ti oppgåver, blanda på tvers av emne. Filteret øvst lèt eleven låsa fag, emne eller nivå |
| `/laer/` | Lærebok — teori, gjennomgått døme og ein stige frå fullt løyst døme til eiga oppgåve |
| `/framgang/` | Framgang — kva du kan, kva som står for tur, og lenkjer til øving og teori |

Skiljet mellom **Lærebok** (kuratert, handskrive, ingen vurdering) og **Treningsrom**
(generert, adaptivt, planlagt) er med vilje. Treningsrommet varierer berre
vanskegraden. Kor mykje av løysinga som er ferdig utfylt, vel eleven sjølv på stigen i
Læreboka.

## Emne

| Modul | Kurs | Emne |
|---|---|---|
| Derivasjon | S1 | Potensregelen, kjerneregelen, produktregelen, brøkregelen |
| Drøfting | S1 | Tangenten, topp- og botnpunkt med forteiknslinje, optimering |
| Logaritmar | S1 | Definisjonen, produkt-, kvotient- og potenssetninga, forenkling, logaritme- og eksponentiallikningar |
| Integrasjon | S2 | Variabelskifte, delvis integrasjon, delbrøkoppspalting, blanda metodar |

Kvart emne har fem nivå. Oppgåvene blir genererte deterministisk: same oppgåve-id gir
alltid same oppgåve. Testane reknar svara og kvart mellomsteg etter numerisk.

## Kom i gang

```sh
npm install
npm run dev      # http://localhost:5190
```

```sh
npm run test     # vitest
npm run check    # svelte-check
npm run build    # statiske filer i build/
npm run preview
```

MathJax kjem frå appen sjølv, ikkje frå ein CDN. `npm run dev` og `npm run build`
kopierer den låste versjonen frå `node_modules` til `static/mathjax/`.

## Leggje til eit emne

Lag ei mappe under `src/lib/modules/` som eksporterer eit `TopicModule`
(sjå `src/lib/modules/types.ts`), og legg det til i `MODULE_REGISTRY` i
`src/lib/modules/registry.ts`. Ingen nye ruter eller komponentar trengst.

Detaljar og konvensjonar står i [AGENTS.md](AGENTS.md). Designet står i
[DESIGN.md](DESIGN.md), endringane i [CHANGELOG.md](CHANGELOG.md).

Gamle utkast og den første designrapporten ligg i `docs/archive/`.
