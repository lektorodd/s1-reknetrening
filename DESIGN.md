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

| Modul | Kurs | Farge |
|---|---|---|
| Derivasjon | S1 | `#2B6CB0` blå |
| Logaritmar | S1 | `#276749` grøn |
| Integrasjon | S2 | `#9C4221` rust |

Integrasjon var sett opp med violett `#805AD5` her før modulen fanst. Det gjekk ikkje:
violett tyder alt **gjennomgått døme** overalt i appen — stigens venstrekant,
stegetikettane i ei løysing, regelboksen med `Σ`-merket. Ein violett modulfarge ville lese
som «dette er eit døme», ikkje som «dette er faget». Rust er klar av både blå og grøn, og
av violetten.

## Kurs er den øvste aksen

Modulane høyrer til eit kurs, og ei økt blandar aldri kurs. Filterpanelet i Treningsrommet
er difor tredelt: **kurs → fag → emne**, med nivå under. Vel du S2, viser panelet berre S2
sine fag. Valet blir lagra, så ein S2-elev slepp å velja på nytt kvar gong.

Lærebok held alle kursa, med kursoverskrift over fagkorta — der slår du opp, og ein
S2-elev treng framleis S1-regelen kvar metode speglar.

Kurset står òg synleg som ein brytar **S1 | S2** (`CourseSwitch`) på framsida og i
Framgang. Brytaren skriv til det same lagra filteret som Treningsrommet bruker. Då
følgjer økta, «Til repetisjon» og Framgang same val, og eleven slepp tre trykk bak
«Endre» for å byta kurs.

## Kvar side peikar vidare

Ei side som berre viser, utan å visa vegen vidare, er ein blindveg:

- **«Øv på dette» i Læreboka** går rett til emnet (`/tren/?fag=…&emne=…`).
- **Kvar rad i Framgang** har lenkjene **Øv** og **Les**. Konsept eleven ikkje har
  prøvd enno, står samla på éi linje med ei lenkje til øving.
- **Slutten av økta** viser opptil tre konsept eleven trong å øva meir på, med dei same
  to lenkjene.

## Tilgjengelegheit

- **Fokus flyttar seg til det som dukkar opp.** Knappen eleven trykte på, forsvinn, så
  fokus går til det nye:
  - eit nytt kort gir fokus til spørsmålet
  - «Vis løysing» gir fokus til løysinga
  - «Hint» gir fokus til hintet

  Det første kortet får ikkje fokus, fordi sida ikkje skal hoppa når eleven kjem inn.
- **Val blir markerte med `aria-pressed`**, ikkje berre med farge.
- **Tren har ein `aria-live`-region** som les opp «Oppgåve N av M» og «Økt fullført».
- **Tekst skal ha minst 4,5:1 i kontrast** mot flata han står på:
  - `--color-text-secondary` og `--color-text-muted` er `#5E626A`.
  - Aksentfargar som tekst på sin eigen lyse tone får ein mørkare tekstvariant:
    `--color-warning-text` og `--color-example-text`.
- **Lenkjer som står åleine** får ei trykkflate på minst 24 px.
- **`prefers-reduced-motion`** slår av animasjonar og overgangar.

## Display-matte

All matte som står på eiga line er **display-matte** (`\[...\]`), aldri inline. Inline
matte lever inne i ei tekstlinje, blir mindre enn omgjevnadene og sit ujamnt; ein
løysingssteg er ei line for seg.

MathJax gir `mjx-container[display="true"]` sine eigne `margin: 1em 0`. Ein boks som alt
har polstring får då dobbel luft, og ser dobbelt så høg ut som han er. Temaet trimmar
marginen til `0.25em`, og til `0` inne i `.step-math`, der lista sin `gap` gir lufta.
Ser ein boks for høg ut, mål før du kuttar polstringa — det er som regel ikkje ho.

### Rullefelt du ikkje bad om

`.step-math` rullar vassrett for lange formlar. CSS tillet ikkje at éin akse rullar mens
den andre er `visible`, så `overflow-y` blir `auto` òg — og då blir kvar piksel som stikk
ut til eit loddrett rullefelt.

To ting stakk ut, og ingen av dei var formelen:

1. **`mjx-assistive-mml`**, MathML-kopien MathJax lagar for skjermlesarar. Han er absolutt
   posisjonert og klippa, men `clip` hindrar berre måling, ikkje høgd. Temaet gir han den
   vanlege «visually hidden»-boksen på 1×1px, så han blir verande for skjermlesaren utan
   å ta plass.
2. **Nokre piksel overheng** frå høg matte. `.step-math` har `--space-2` loddrett
   polstring for å ta dei.

Måler du dette: `scrollHeight > clientHeight` er svaret. `offsetWidth - clientWidth` er
det ikkje — Chromium brukar overlay-rullefelt som tek null breidde.

## All matte går gjennom `Tex`

`src/lib/components/Tex.svelte` er den einaste staden appen skriv LaTeX inn i DOM-en.

Grunnen er ikkje ryddigheit. **Reaktiv matte verkar ikkje utan han.** MathJax byter ut
tekstnoden `\[...\]` med sin eigen `<mjx-container>`, og etter det står Svelte sin
reaktive tekstnode utanfor dokumentet — ein ny verdi har ingen stad å bli skriven. Skjermen
held fram med å visa den første formelen han typesette. Det var slik Læreboka kom til å
visa kjerneregelen under overskrifta «Delvis integrasjon».

`Tex` set `textContent` sjølv før han typesettar, som kastar containeren ut og legg
råteksten tilbake. Skriv du `{`\\[${...}\\]`}` rett i ein komponent, får du feilen igjen.

**Prosa med `$...$` inni går gjennom `TexProse`** — teoritekst, hint, refleksjonsspørsmål
og svaralternativ. Same mekanisme, same feil: skriv du `{entry.intro}` rett, blir matten
berre rendra når MathJax sin oppstartspass tilfeldigvis finn han ved full sidelasting.
Etter navigering inne i appen står `$f(x)=...$` rått, og eit hint som blir opna på eit kort
blir aldri typesett. `TexProse` rendrar eit nakent `<span>`, så elementet rundt beheld
stilen sin (`white-space: pre-line` for linjeskift i teksten).

Begge går gjennom `renderInto` i `utils/mathjax.ts`, som ber MathJax gløyma den gamle
matten, set teksten og typesettar i kø — MathJax 3 vil ha éin typesetting om gongen.

Komponenten heiter `Tex` og ikkje `Math`, fordi `Math` skyggar for det globale
`Math`-objektet i komponenten som importerer han.

## To aksar på stigen

Vanskegrad er **blå sirklar med tal**. Hjelp er **violette knappar med ord**:
Døme · Siste steg · To siste · Starten · Sjølv.

Dei skal ikkje sjå like ut — det er to ulike ting. Og hjelp-aksen har ord av ein grunn: han
var fem strekar på 126 × 6 px, under halvparten av dei 24 × 24 ei treffflate treng, og den
fylte streken låg lengst til høgre, der det er *minst* hjelp. Meir farge tydde mindre hjelp.
Ord ber meininga, og då finst det ikkje noko fyll som kan peika feil veg.

## Instruksjonen over oppgåva

Over kvar oppgåve, i Tren og i stigen, står det kva eleven skal gjera: «Deriver
funksjonen.», «Skriv som éin logaritme.». Instruksjonen er feit brødtekst, ikkje ein
merkelapp i versalar, fordi han er det første eleven les på kortet.

Oppgåvefeltet under held berre matte. Utan instruksjonen stod eleven med eit uttrykk og
måtte gjetta om det skulle forenklast, skrivast ut eller samlast. Instruksjonen stod før
somme stader inne i formelen, som `\text{…}`, og då vart han sett med matteskrift.

## Forteiknslinja

`SignChart` teiknar forteiknslinja slik elevane teiknar henne på papiret:
- heiltrekt linje der faktoren er positiv, stipla der han er negativ, og **0** i nullpunktet
- éi rad per faktor, og produktet nedst under ein strek over heile breidda
- punkta med lik avstand, ikkje etter målestokk, fordi det berre er rekkjefølgja som tel

Ho er eit rutenett av celler og ikkje SVG. Då går etikettane gjennom `Tex` som all anna
matte, og forteiknslinja får plass på mobil utan at sida må rullast sidelengs.
Skjermlesarar får ei beskriving i ord: «x + 3: negativ før −3, 0 i −3, positiv etter».

## Steg-etikettar

`.step-label` er ein **merkelapp**, ikkje ei setning: liten, feit, versalar, sperra.

- To til fire ord.
- **Aldri LaTeX.** MathJax rendrar matte inni han, versalane gjeld ikkje for matten, og
  «$\ln x$ skal deriverast» kjem ut som ein kursiv «ln x» limt til «SKAL DERIVERAST».
- Forklaringa høyrer heime i `hint`, eller i Læreboka sin `thinkAloud` og `workedSteps`.

Ein test i `engine.test.ts` handhevar begge for heile registeret.

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
