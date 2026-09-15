# Mattetrening

Adaptiv rekneterping for S1. Nynorsk, ingen innlogging, ingen server — alt ligg i
nettlesaren og appen byggjer til statiske filer.

Målet er at eleven skal jobbe **jamt, ofte og på sitt eige nivå**. Difor opnar appen
med éin knapp i staden for ein meny.

## Dei fire stadene

| Rute | Kva det er |
|---|---|
| `/` | Heim — «Start økta», rekkje og kva som ventar på repetisjon |
| `/tren/` | Treningsrom — ei kort økt på ti oppgåver, blanda på tvers av emne |
| `/laer/` | Lærebok — teori og gjennomgåtte døme, til oppslag |
| `/framgang/` | Framgang — kva du kan, og kva som står for tur |
| `/velg/` | Vel sjølv — manuelt emne- og nivåval |

Skiljet mellom **Lærebok** (kuratert, handskrive) og **Treningsrom** (generert,
adaptivt) er med vilje. Inne i økta avgjer motoren kor mykje støtte kvart kort får:
eit heilt nytt emne kjem som eit gjennomgått døme, eit kjent emne som bar oppgåve.

## Emne

Derivasjon (kjerneregelen, produktregelen, brøkregelen) og logaritmar (dei tre
reknereglane, forenkling, logaritme- og eksponentiallikningar). 360 oppgåver, generert
deterministisk — same oppgåve-id gir alltid same oppgåve.

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

## Leggje til eit emne

Lag ei mappe under `src/lib/modules/` som eksporterer eit `TopicModule`
(sjå `src/lib/modules/types.ts`), og legg det til i `MODULE_REGISTRY` i
`src/lib/modules/registry.ts`. Ingen nye ruter eller komponentar trengst.

Detaljar i [CLAUDE.md](CLAUDE.md).
