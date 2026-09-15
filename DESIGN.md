# Designsystem: Lektorodd

## Kvifor

Elevane møter alt læraren sitt materiale i itslearning, bygd i Lektorodd-temaet. Appen
brukar same farge- og formkode, så eleven slepp å læra to visuelle språk. Ein violett
boks tyder gjennomgått døme same kvar han står; ein gul kant tyder «merk deg».

Kjelda for paletten er skillen `itslearning-boksar`. Endrar temaet seg der, skal det
endrast her.

## Palett

| Rolle | Hex | Token |
|---|---|---|
| Krembotn | `#F6F1E6` | `--color-bg` |
| Nøytral botn | `#FFFFFF` | `--color-surface` |
| Kant, krem | `#D8D2C4` | `--color-border-warm` |
| Kant, nøytral | `#E3E6EA` | `--color-border` |
| Brødtekst | `#1F2933` | `--color-text` |
| Blå — info, primærhandling | `#2B6CB0` | `--color-primary` |
| Grøn — rett, oppgåve | `#276749` | `--color-success` |
| Raud — galt, åtvaring | `#C53030` | `--color-error` |
| Gul — merk deg | `#B7791F` | `--color-warning` |
| Violett — døme og formel | `#805AD5` | `--color-example` |
| Mint — signatur | `#98D3B4` | `--color-mint` |

Kvar aksent har ein pale variant til boksbotn (`--color-*-light`). Alle er målte med
`#1F2933` oppå: 12,7–13,1:1.

### To målte avvik, med grunn

- **Dei grå tekstfargane er mørkna eitt hakk.** Paletten sin `#6B6F77` gir 4,48:1 på
  krem — så vidt under AA. I ein itslearning-boks ber han ei kort metalinje; her ber han
  laupande brødtekst. `--color-text-secondary` er `#5F636B` (5,35:1) og
  `--color-text-muted` er `#64686F` (4,97:1).
- **Gul `#B7791F` er 3,64:1 på kvitt.** Han blir brukt til kant, merke og overskrift —
  aldri til laupande tekst. Hint-boksen har vanleg brødtekst på pale gul botn i staden.

## Form

Rolege hjørne, ikkje piller: `--radius-sm` 4px, `--radius-md` 6px, `--radius-lg` 8px.
`--radius-full` finst framleis, men berre til det som verkeleg er sirkulært —
framdriftsprikkar, nivåknappar, stegnummer, merkesirklar.

Signaturen er **4px farga venstrekant** (`--accent-edge`) på kort og boksar. Komponentar
set `--accent` for å fargeleggja han etter meining eller etter modul.

Skuggar er nedtona. Det er kanten som skil ein boks frå botnen, ikkje eit løft.

## Typografi

```
--font-family: 'Source Sans 3', 'Segoe UI', system-ui, …
--font-mono:   'JetBrains Mono', ui-monospace, …
```

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
| Oppgåvekort i Tren | modulen sin farge på venstrekanten |

## Modulfargar

Kvar modul har ein aksent i `registry.ts`, brukt på modulkort, venstrekantar og
framgangssida:

| Modul | Farge |
|---|---|
| Derivasjon | `#2B6CB0` blå |
| Logaritmar | `#276749` grøn |
| Integrasjon (når han kjem) | `#805AD5` violett |

## Når du legg til noko

Bruk tokens, ikkje hex. Skal ein ny flate ha farge, spør kva han **tyder** — er det eit
døme, ei åtvaring, ein merknad? — og ta aksenten som alt ber den meininga. Ber flata
brødtekst, sjekk kontrasten mot botnen før du vel.
