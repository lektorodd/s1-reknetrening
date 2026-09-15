# Designsystem: Lektorodd

## Kvifor

Elevane møter alt læraren sitt materiale i itslearning, bygd i Lektorodd-temaet. Appen
brukar same farge- og formkode, så eleven slepp å læra to visuelle språk. Ein violett
boks tyder gjennomgått døme same kvar han står; ein gul kant tyder «merk deg».

Kjelda er artefakten «Slik lagar du klassekart», som ber heile drakta — sidechromet med.
Skillen `itslearning-boksar` skildrar berre det ein inline-stila LMS-boks treng, og det var
difor ei tidlegare runde her mangla rutenettet, flateskalaen og display-skrifta.

## Rutenettet

Den svake rutepapir-botnen er signaturen:

```css
--color-grid: rgba(31, 41, 51, 0.045);

body {
  background-image: linear-gradient(var(--color-grid) 1px, transparent 1px),
                    linear-gradient(90deg, var(--color-grid) 1px, transparent 1px);
  background-size: 34px 34px;
  background-attachment: fixed;
}
```

Han ligg på `body`. Gir du eit element som dekkjer heile viewporten ein solid botn, målar
du rett over han — det var nettopp det `.app-shell` gjorde ei stund.

## Flateskalaen

Fire nivå, og skilnaden mellom dei ber arbeidet:

| Token | Hex | Til |
|---|---|---|
| `--color-ground` | `#F6F1E6` | sidebotn, med rutenett |
| `--color-surface` | `#FCFAF4` | mjuke panel og boksar |
| `--color-raised` | `#FFFFFF` | kort som ligg over |
| `--color-sunk` | `#EFE9DC` | **små** innfelte ting — `kbd`, `code` |

Eit innfelt felt på eit kort skal aldri låna sidebotnen sin krem. Gjer det det, ser feltet
malplassert ut. Men storleiken avgjer kor djupt det skal ligga: ein oppgåveboks eller eit
formelfelt tek eit **hakk** ned frå kortet sitt — `--color-surface` på eit kvitt kort — med
`--color-line`-ramme. `--sunk` på ei stor flate blir tung og mørk.

## Palett

| Rolle | Hex | Token |
|---|---|---|
| Kant | `#E8E1D2` | `--color-line` |
| Kant, sterk | `#D8D2C4` | `--color-line-strong` |
| Brødtekst | `#1F2933` | `--color-text` |
| Overskrifter | `#15202B` | `--color-text-strong` |
| Blå — info, primærhandling | `#2B6CB0` | `--color-primary` |
| Grøn — rett, oppgåve | `#276749` | `--color-success` |
| Raud — galt, åtvaring | `#C53030` | `--color-error` |
| Gul — merk deg | `#B7791F` | `--color-warning` |
| Violett — døme og formel | `#805AD5` | `--color-example` |
| Mint — signatur | `#98D3B4` | `--color-mint` |

Kvar aksent har ein pale variant til boksbotn (`--color-*-light`). Alle er målte med
`#1F2933` oppå: 12,7–13,1:1.

### Tint er ikkje flate

`--color-primary-50` og `-100` ligg **bak tekst** — knappe-hover, merkelappar. Dei er
ikkje spor, skinner eller søylebotnar: temaet har ingen lyseblå flate, og ein tom
framdriftsstripe i lyseblå les som ein strek utan meining. Spor er varme
(`--color-line`, `--color-line-strong`); blå ber det som er **fylt**.

### Kontrast

Brødtekst er `--color-text` `#1F2933` — 13,1:1 mot krem, 14,8:1 mot kvitt. `#6B6F77` er
**berre** for ingressar, bilettekstar og metalinjer. Måler du ein grå tone og finn han for
lys til brødtekst, er svaret som regel at brødteksten ikkje skulle vore grå.

Gul `#B7791F` er 3,64:1 på kvitt og blir difor brukt til kant, merke og overskrift — aldri
til laupande tekst. Hint-boksen har vanleg brødtekst på pale gul botn i staden.

## Form

Rolege hjørne, ikkje piller: `--radius-sm` 3px, `--radius-md` 5px, `--radius-lg` 8px.
`--radius-full` finst framleis, men berre til det som verkeleg er sirkulært —
framdriftsprikkar, nivåknappar, stegnummer, merkesirklar.

Signaturen er **4px farga venstrekant** (`--accent-edge`) på kort og boksar. Komponentar
set `--accent` for å fargeleggja han etter meining eller etter modul.

Skuggar er nedtona. Det er kanten som skil ein boks frå botnen, ikkje eit løft.

## Typografi

Tre skrifter, ikkje éi:

```
--font-display: 'Space Grotesk', 'Source Sans 3', system-ui, sans-serif;  /* overskrifter */
--font-family:  'Source Sans 3', system-ui, -apple-system, …              /* brødtekst */
--font-mono:    'JetBrains Mono', ui-monospace, …                         /* formelfelt */
```

Overskrifter: vekt 600, `letter-spacing: -0.02em` (`-0.03em` på `h1`), `text-wrap: balance`.
`html { font-size: 17px }`, `body { line-height: 1.65 }`.

Utan display-skrifta ser sida flat ut, same kor rett fargane er.

## Mint-markeringa

`.mark` er ein overstrykingspenn for tekst, ikkje eit merke:

```css
background: linear-gradient(100deg, rgba(152,211,180,0) 1%, var(--color-mint-soft) 5%,
                            var(--color-mint-deep) 95%, rgba(152,211,180,0) 99%);
```

Sirkelglyfen som opnar ein titla boks heiter `.badge-mark`.

## Kva farge tyder kva

| Flate | Farge |
|---|---|
| «Regelen»-boksen, med `Σ`-merke | violett |
| Stegnummer i gjennomgått døme | violette sirklar |
| Stegetikettar i ei løysing | violett |
| Stigen «Prøv sjølv» | violett venstrekant |
| Hugseregel, med `✓`-merke | mint botn, grønt merke |
| Hint på eit oppgåvekort | gul venstrekant, pale gul botn |
| «Din tur — N steg att» | stipla krem-kant |
| Rett / galt i refleksjonsspørsmål | grøn / raud |
| Oppgåvekort i Tren | modulen sin farge på venstrekanten, og modulnamnet i same farge |

Farge åleine seier ikkje kva faget heiter. Der ei liste eller ei økt blandar fag — Tren sitt
filter, oppgåvekortet — skal namnet stå, med fargen som støtte.

## Modulfargar

Kvar modul har ein aksent i `registry.ts`, brukt på modulkort, venstrekantar og
framgangssida:

| Modul | Farge |
|---|---|
| Derivasjon | `#2B6CB0` blå |
| Logaritmar | `#276749` grøn |
| Integrasjon (når han kjem) | `#805AD5` violett |

## Display-matte

MathJax gir `mjx-container[display="true"]` sine eigne `margin: 1em 0`. Ein boks som alt
har polstring får då dobbel luft, og ser dobbelt så høg ut som han er. Temaet trimmar
marginen til `0.25em`. Ser ein boks for høg ut, mål før du kuttar polstringa — det er
som regel ikkje ho.

## Mørk modus — ikkje implementert, men nedskriven

```
--ground:#15202B; --surface:#1B2733; --raised:#22303D; --sunk:#1A2530;
--line:rgba(255,255,255,.10); --line-strong:rgba(255,255,255,.20);
--ink:#E4E3DC; --ink-strong:#F7F5EF; --muted:#A9B4C0;
--blue:#84B6E8; --blue-deep:#A9CDF0; --green:#84CBA6; --violet:#BCA2EE;
--red:#F09292; --warn:#E2B565;
--grid:rgba(255,255,255,.035);
```

Temaet brukar både `@media (prefers-color-scheme: dark)` med
`:root:not([data-theme="light"])` og `:root[data-theme="dark"]`.

## Når du legg til noko

Bruk tokens, ikkje hex. Skal ein ny flate ha farge, spør kva han **tyder** — er det eit
døme, ei åtvaring, ein merknad? — og ta aksenten som alt ber den meininga. Ber flata
brødtekst, sjekk kontrasten mot botnen før du vel.
