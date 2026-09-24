# Utviklingslogg – Mattetrening

---

## Stage 10b – Drøfting, og ei forteiknslinje som kan reknast på (v0.13.0)
**Dato:** 2026-09-24

Nytt S1-stoff, som brukaren valde:
- ein eigen modul for bruk av den deriverte
- ei teikna forteiknslinje
- optimering både på intervall og som tekstoppgåver

### Bygd baklengs frå svaret

Kvar funksjon i Drøfting blir laga ut frå nullpunkta til den deriverte. Døme:
`f' = 6(x − r)(x − s)` gir `f = 2x³ − 3(r+s)x² + 6rsx + c`. Då blir alle verdiane
eleven reknar ut heile tal, og forteiknslinja blir eksakt.

Forteikna blir ikkje skrivne inn for hand. `signChart()` får faktorane som funksjonar og
reknar ut forteiknet i kvart intervall. Testen kontrollerer forteiknslinja uavhengig av
dette: han les LaTeX-en i kvar rad, reknar ut verdien og samanliknar forteikn for forteikn.
For å vita at testen verkar, gjorde eg forteiknet i første intervall feil med vilje, og
testen feila.

### To feil testane fann undervegs

- **Ei evig løkke.** Optimering nivå 3 skulle unngå at to kandidatar fekk same verdi,
  og utvida difor intervallet. Men løkka utvida berre høgre endepunkt, og det er ikkje
  alltid det som gir den like verdien. Testkøyringa hang.
- **Ein test som aldri kontrollerte noko.** Testen for tangent nivå 4 leitte etter
  «stigningstal» med eit regulært uttrykk, men instruksjonen seier «stigingstal». Då vart
  kontrollen hoppa over utan at nokon merka det. No er ordet likt overalt, og
  «stigning» står på lista over bokmålsord.

### Å sjå på forteiknslinja

Det første skjermbiletet viste to feil:
- `-6(x + 3)(x)` skal vera `-6x(x + 3)`.
- Streken over produktrada var broten og låg på ulik høgd.

No er han éi rad over heile breidda.

---

## Stage 10a – Innhald som tåler å bli rekna på (v0.12.0)
**Dato:** 2026-09-24

### Testane først

Før eg endra ei einaste oppgåve, skreiv eg ein liten LaTeX-evaluator, `latex-eval.ts`,
som berre testane bruker. Han les strengane generatorane skriv, som tal.

- **Derivasjon:** kvar `f(x)` blir derivert numerisk og samanlikna med svaret og med
  kvar mellomlinje.
- **Logaritmar:** kvar oppgåve blir rekna ut og samanlikna med svaret, og kvart
  likningssvar blir sett inn att.

Testane gjekk grøne mot den gamle koden: matten var rett. Evaluatoren har difor sine
eigne testar, mellom anna éin som viser at han skil ein feil derivert frå ein rett.

Reglane for heile registeret feila derimot:

| Regel | Talet på brot |
|---|---|
| Under 6 ulike oppgåver per emne/nivå | 17 |
| Svar-steg som berre gjentek førre steg | 9 emne/nivå |
| Instruksjon inne i `q` | 3 |
| `1x`, `+ -` og uforkorta svar | 25, mellom dei 11 i integrasjon, som gjennomgangen ikkje hadde fanga |
| Bokmålsord | 484 treff |

### Kjerneregelen

Typen følgde nivået (`lvl <= 2 ? 'poly' : …`), så konseptet «rot» var «alt på nivå 3».
No følgjer typen den ytre funksjonen, og nivået følgjer den indre. Familien blir
vald ut frå variantnummeret, så kvar familie finst garantert på kvart nivå han høyrer
til. Koeffisienten følgjer òg variantnummeret, sidan tilfeldige trekk gav to like
`e^{2x+3}`.

### Stigen

Når dei gjentekne svar-stega forsvann, vart fleire logaritmeoppgåver endå kortare, og
trinna fall saman endå meir. Løysinga ligg difor i stigen: `distinctRungs` tek berre med
trinn som gøymer fleire steg enn trinnet før. Ei oppgåve med eitt steg får «Døme · Sjølv»,
og det er ærleg.

### Resultat i simuleringa

Motoren er ikkje endra. Likevel fekk den svake eleven 4 % av korta på nivå 4–5, ned frå
11 %. Grunnen er at alle kjerneregelkonsepta no har eit lett nivå, så motoren har noko å
gi han.

---

## Stage 9c – Elevvegen (v0.11.0)
**Dato:** 2026-09-24

Fase 3 handla mindre om å leggja til ting enn om å kopla saman det som alt fanst.
Gjennomgangen fann fleire blindvegar. Ingen av dei var store, men saman gjorde dei appen
vanskelegare å bruka:

- Læreboka sende eleven til eit tilfeldig kort.
- Framgang lenkja ikkje vidare nokon stad.
- Slutten av økta sa berre «kom att i morgon».
- Kurset låg gøymt tre trykk inne.

### Éin kjelde for kurset

Det lagra Tren-filteret var alt kjelda til kva kurs eleven øvde på. Framsida og
Framgang les og skriv no det same filteret (`loadFilter`/`saveFilter`), i staden for
å få ein eigen innstilling. Då kan dei tre sidene aldri visa ulike kurs.

### Lenkjer inn i øvinga

`/tren/?fag=integral&emne=parts` blir lese i `afterNavigate`, og ikkje berre ved
oppstart. Det er naudsynt fordi «Øv meir» på slutten av økta er ein navigasjon frå
`/tren/` til `/tren/`, og då blir ikkje sida montert på nytt. Etterpå ryddar Tren
adressa, så ein reload held fram med økta i staden for å starta ei ny.

### Målt i nettlesaren

A/B mot førre bygg:

| | Gamal | Ny |
|---|---|---|
| «Øv på dette» frå Delvis integrasjon | `S1 · alle fag`, ni ulike emne | `S2 · Integrasjon · Delvis integrasjon`, berre det emnet |
| Slutten av økta | ingen vidare veg | dei konsepta eleven bomma på, med «Øv meir» og «Les» |
| Fokus etter «Fekk det til» | `body` | spørsmålet på det nye kortet |
| Filterbyte midt i økta | byter utan å spørja | spør først |
| Framgang for ein S1-elev på mobil | 3650 px, 20 rader «Ikkje prøvd», 0 lenkjer | 1955 px, 9 rader, 18 lenkjer |
| Ukjend adresse | vertsserveren si side | «Fann ikkje sida» |
| Blokkert lagring | ingenting | melding |

Feilsida er testa gjennom ein liten server som fell tilbake på `404.html`, slik
GitHub Pages gjer. Chromium loggar «Unable to preload CSS» på den sida. Begge
stilarka blir likevel lasta med status 200 og brukte, så meldinga er ufarleg og kjem av
SPA-fallbacken.

---

## Stage 9b – Motoren, målt med simulerte elevar (v0.10.0)
**Dato:** 2026-09-24

Fase 2 starta med testane, ikkje med koden. Gjennomgangen fann motorfeila i
simuleringar, og dei simuleringane er no ein fast del av testsuiten
(`simulation.test.ts`). Dei bruker seeda tilfeldigheit og ei falsk klokke, og kvar
simulert elev øver éi økt kvar ettermiddag. Alle seks feila mot den gamle motoren
før eg endra ei einaste line.

### Éin idé: nivå per konsept

Fire av funna hadde same rot: `overallLevel`, eitt tal for heile eleven.

- Det er grunnen til at ein S1-veteran fekk nivå 5 i S2.
- Det er grunnen til at ein svak elev fekk 54 % av korta på nivå 4–5.
- Det er grunnen til at eit enkelt emne ikkje tilpassa seg.

No har kvart konsept eit eige arbeidsnivå, og selektoren vel det nærmaste nivået
konseptet har.

Den første versjonen gav eitt steg opp for kvart rett svar. Då stod den svake eleven
framleis på 23 %. Eg rekna på det: ei trapp som går opp etter kvar rette, stabiliserer
seg der eleven får rett 35 % av gongene. «To opp, éin ned» er den klassiske
staircase-metoden frå psykofysikken, og ho landar på om lag 71 %.

### Det simuleringa fann som ingen hadde sett

Sjølv med trappa stod den svake eleven på 19 %. Fordelinga per konsept viste kvifor:
`chain_root` finst berre på nivå 3 og `chain_exp` berre på nivå 4–5. Eleven bomma på dei,
tilliten fall til 0,01, og då trekte både repetisjonen og fokusdelen dei att kvar dag.
Berre desse to konsepta stod for 99 av 300 kort.

Motoren kan ikkje finna ei oppgåve på nivå 1 som ikkje finst. Rettinga her er at
fokusdelen hoppar over konsept som ligg meir enn eitt nivå over arbeidsnivået.
Den eigentlege løysinga er innhald: kjerneregelen treng oppgåver på alle nivå.
Det står i fase 4.

### Tala

Sjå tabellen i CHANGELOG. Testane held i tillegg med fem andre seed-sett, så
resultatet er ikkje flaks med éitt seed.

### I nettlesaren

A/B mot førre bygg:

| | Gamal | Ny |
|---|---|---|
| Reload etter 3 kort | 1 av 10, ny oppgåve | 4 av 10, same oppgåve |
| `tren_filter = null` | Tren viser ingen kort | fungerer |
| `null` i øktloggen | Framgang krasjar | fungerer |
| Streak etter tre veker | 12 | 0 |

---

## Stage 9a – Rett matte og rett visning (v0.9.3)
**Dato:** 2026-09-24

Første fase etter ein full gjennomgang av appen: tre agentar (pedagogikk og matte,
læringsmotor og data, UI og kode) og ein gjennomgang som ny elev i Chromium.
Funna og planen for fase 2–5 ligg i den godkjende planen. Denne fasen tek dei tre
kritiske funna og to mindre.

### K1 — repetisjonen som slutta å repetera

Intervallet vart gonga med ease-faktoren ved kvar rett vurdering, uansett om konseptet var
forfalle. I ei økt kjem same konsept att fleire gonger, så intervallet vart dobla kvar
gong. Ein simulert elev som øvde kvar dag, hadde ingenting forfalle frå dag 5, og etter 30
dagar var intervallet 4·10¹⁸ dagar.

No veks intervallet berre ved ein repetisjon som faktisk var forfallen. Det har eit tak på
60 dagar, og ein bom gir 1 dag. `effectiveInterval` reparerer lagra modellar med
`null` (som er `Infinity` etter JSON) eller for store verdiar.

Dei to gamle testane som skildra feilen som ønskt åtferd, er erstatta av seks nye. Fem av
dei feilar mot den gamle koden. Ein av dei simulerer 30 dagar med dagleg øving og krev at
det framleis finst noko å repetera.

### K2 — svar som mista halve løysingsmengda

`lg(x²) + lg 2 = 2` vart løyst via `2 lg x`, som stiller kravet x > 0 i det stille.
Løysinga isolerer no `x²` og tek med ±. Hjelparen `sqrtFraction` gir rasjonalisert og
forenkla form (`100/3` → `10√3/3`, `e²/4` → `e/2`).

Eksponentiallikninga på nivå 5 hadde x = 1 i alle åtte oppgåvene. No blir høgresida trekt
slik at ho ikkje er ein potens av grunntalet.

Testane i `logarithm.test.ts` løyser likninga numerisk ut frå spørsmålet. Dei samanliknar
altså med matten, ikkje med ein annan bit generatorkode. Seks av sju feilar mot den gamle
generatoren.

### K3 — prosa-matte

Dette er same mekanisme som i v0.9.2, berre i prosa: `{entry.intro}` blir ein tekstnode
som MathJax tek over. Målt A/B med MathJax servert lokalt, både med forseinking 0 ms og
2500 ms:

```
                          gamal                   ny
navigert parts → partial  rå$=58 mjx=40          rå$=0 mjx=36 (= full lasting)
refleksjonsspørsmål       rå$= 8 mjx= 0           rå$=0 mjx= 4
hint i Tren S2            rå$= 4 mjx= 0           rå$=0 mjx= 2
```

`TexProse` og `Tex` går no begge gjennom `renderInto`. Den kallar `typesetClear` før han
set teksten, slik at MathJax gløymer dei gamle nodane, og typesettar i ein kø.

### Stigen

`buildLadder` lova i kommentaren å aldri visa same oppgåve to gonger. Han sjekka id-ar, men
ikkje oppgåvetekst, og 11 emne/nivå har færre enn fem ulike oppgåver. Den nye testen
fann òg ein dublett i `chain` nivå 1 som oversikta mi hadde gått glipp av.

Ein kortare stige beheld begge endane (`rungsFor`: 2 → 0-4, 4 → 0-1-3-4). Eleven skal alltid
få sjå eit gjennomgått døme først og prøva sjølv til slutt.

### Datoar

`toISOString()` gav UTC-datoen. `localISO` bruker lokal tid. `dates.test.ts` køyrer i
`Europe/Oslo` og sveipar eit heilt år i kvarterssteg. Med UTC var det 24 kvarter med
dublettdagar i vekegrafen, og kvar av dei krasja Framgang-sida.

---

## Stage 8c – Ein knapp som ikkje verka, og ein lærebok som løgg (v0.9.2)
**Dato:** 2026-09-16

Brukaren melde fire ting om stigen. Den første — «knappane til venstre endrar ikkje
oppgåva» — såg ut som ein liten reaktivitetsfeil i ein komponent. Han var det ikkje.

### Målinga som opna det

Same side, same klikk, to nettlesarar: éin med MathJax, éin utan.

```
utan MathJax    nivå 1: \int -\frac{3}{3x-2}\,dx     nivå 5: \int \frac{x}{\sqrt{x+3}}\,dx
med  MathJax    nivå 1: ∫ ln x / x dx              nivå 5: ∫ ln x / x dx
```

Svelte gjorde altså jobben sin heile tida. Det var skjermen som ikkje følgde etter.

MathJax byter ut tekstnoden `\[...\]` med sin eigen `<mjx-container>`. Etter det peikar
Svelte sin reaktive tekstnode på noko som ikkje står i dokumentet lenger, og ein ny verdi
har ingen stad å bli skriven. `$effect`-en kalla `typesetElement` på nytt, men teksten han
skulle setja var borte.

Kortet i Tren slapp unna — ikkje fordi det var betre skrive, men fordi `tren/+page.svelte`
tilfeldigvis pakkar det i `{#key current.problem.id}`, som byggjer DOM-en på nytt.

### Det eg fann då eg leita vidare

Eg kunne ha stoppa ved stigen. I staden spurde eg kvar elles matte blir rendra reaktivt, og
prøvde å navigera mellom to emne i Læreboka:

```
start          tittel "Variabelskifte"      formel ∫g(u(x))·u'(x)dx …
etter klikk    tittel "Delvis integrasjon"  formel ∫g(u(x))·u'(x)dx …
```

Tittelen er vanleg tekst og bytte. Formelen og heile det gjennomgåtte dømet er MathJax og
stod att. **Ein elev som las «Delvis integrasjon» fekk sjå kjerneregelen.** Det er feil
fagleg innhald, og det er mykje verre enn knappen brukaren faktisk melde.

Sju stader i tre komponentar hadde same feilen. Alle går no gjennom `Tex.svelte`, som set
`textContent` sjølv før han typesettar — det er nettopp steget Svelte ikkje får gjort etter
at MathJax har teke noden.

**Lærdomen:** ei melding om ein knapp er ikkje ei melding om ein knapp. Spør kvar elles same
mekanismen gjeld før du fiksar staden du vart peika på.

### Og ein liten ein

Komponenten heitte `Math` i fem minutt. `Math.min` og `Math.floor` slutta å kompilera i
komponenten som importerte han, fordi namnet skyggar for det globale objektet. Han heiter
`Tex` no.

### Hjelp-aksen

Dei tre andre punkta var same kontroll: fem strekar på 126 × 6 px — under halvparten av dei
24 × 24 ei treffflate treng — med den fylte streken lengst til høgre, der det er *minst*
hjelp. «Meir farge → mindre hjelp. Kontraintuitivt», som brukaren skreiv, og han har rett:
ein målar som fyller seg opp skal tyda meir av noko.

Løysinga var ikkje å snu målaren, men å bli kvitt han. Fem knappar med ord på — Døme,
Siste steg, To siste, Starten, Sjølv — er 72 × 44 px og treng ingen metafor i det heile.
Lina under som gjentok namnet på steget kunne gå same vegen.

---

## Stage 8b – Tre ting som såg ut som éin feil (v0.9.1)
**Dato:** 2026-09-16

Brukaren sende eit skjermbilete av eit delvis-integrasjon-kort med tre merknader:
rullefelt i alle boksane, inline matte som såg rar ut, og «LN X» øvst som såg VELDIG rar
ut. Alle tre var reelle. Ingen av dei hadde den årsaka eg trudde.

### Etiketten: min feil, ikkje stilen sin

`.step-label` er ein merkelapp — liten, feit, versalar, sperra. Derivasjon og logaritmar
gir han to til fire ord og null LaTeX. Eg hadde skrive fulle setningar med `$...$` i, 30
av 192 av dei. MathJax rendrar matten inni merkelappen, versalane gjeld ikkje for matte,
og ut kom «ln x» i kursiv limt til «SKAL DERIVERAST».

Enkel diagnose, og eg burde sett han då eg skreiv dei. Alle 192 er korte merkelappar no,
og ein test handhevar det for heile registeret — så det gjeld neste modul òg.

### Rullefeltet: eg tok feil to gonger før eg målte rett

Første hypotese: `overflow-x: auto` tvingar `overflow-y` til `auto` (det stemmer), og
inline matte er høgare enn tekstlinja, så brøkar renn over. Plausibelt, og
skjermbiletet passa — rullefelt nøyaktig på dei stega som hadde brøk.

Så bygde eg fire simuleringar av inline matte med ulik `vertical-align`. **Ingen av dei
gav rullefelt.** Hypotesen min feila sin eigen test.

Det som løyste det var å slutta å gjetta og skaffa MathJax. CDN-en er blokkert av
egress-proxyen, men `npm install --no-save mathjax@3` går gjennom registeret, og
Playwright sin `page.route` kan servera fila i staden for den blokkerte URL-en. Då hadde
eg ekte rendra matte å måla på, for første gong i heile dette arbeidet.

Med det på plass: bygg den gamle versjonen frå git stash, server han på ein annan port,
og mål begge sider av same oppgåve. Gammal: 33/35, 34/36 — renn over på alle fire stega.

Og då eg spurde *kva* som stakk ut, var svaret ikkje formelen i det heile:
**`mjx-assistive-mml`**, MathML-kopien MathJax lagar for skjermlesarar. Han er absolutt
posisjonert og klippa med `clip`, men `clip` hindrar berre måling — han beheld full høgd,
og den høgda tel som overflyt inne i containeren. Ein tilgjengelegheitsnode bak formelen
var det som teikna rullefeltet.

### Eit måletriks som løygde

Eg sveipte sju emne og fekk «0 rullefelt» — på **begge** versjonar. Målet mitt var
`offsetWidth - clientWidth`, altså kor brei rullefeltet er. Chromium brukar
overlay-rullefelt som tek null breidde. Målet kunne ikkje sjå det det leita etter.

`scrollHeight > clientHeight` er det rette spørsmålet: *kan* elementet rulla. Med det:
48 av 85 steg før, 6 av 81 etter, og 0 av 82 etter litt meir polstring.

**Lærdomen, tredje gong i dette prosjektet:** ei måling som gir det svaret du håpar på, er
ikkje det same som ei måling som stiller rett spørsmål. Førre gong var det
`getComputedStyle` som sa at rutenettet var der mens skjermbiletet viste at det ikkje var
det. Denne gongen var det eit rullefelt utan breidde.

---

## Stage 8 – Integrasjon, og kurs som eiga akse (v0.9.0)
**Dato:** 2026-09-16

Brukaren kom med kunnskapsgrunnlaget for integrasjon og éin klar premiss: det er S2-stoff,
så det bør kunna haldast utanfor det andre. «Irriterande med logaritmeoppgåver når ein
terper delvis int.»

Filteret frå v0.8.2 kunne alt avgrensa til eitt fag, men valet vart gløymt ved kvar økt, og
appen hadde ikkje noko omgrep om at integrasjon høyrer til eit anna kurs. Difor to ting i
same endring: modulen, og kurs som akse over faga — med valet lagra.

### Generering bakvegen

Det viktigaste grepet, og det som gjer modulen til å stole på: **generatoren integrerer
aldri.** Den antideriverte blir vald først, og integranden følgjer av henne, utleidd frå dei
same parametrane. Då kan oppgåve og fasit ikkje koma i utakt — det er ikkje to utrekningar
som må stemme overeins, det er éi.

For derivasjon spelar dette mindre rolle, fordi den vegen er mekanisk. For integrasjon er
det heile skilnaden.

### Matematikken før LaTeX-en

Eg skreiv ikkje ein einaste LaTeX-streng før alle 109 familieformlane var sjekka numerisk:
sentraldifferanse på $F$, samanlikna med $f$ i fleire punkt innanfor definisjonsmengda.
Same kontroll som kunnskapsgrunnlaget sjølv køyrde med sympy.

Grunnen er ikkje ryddigheit. Ein feil antiderivert er den eine feilen i denne appen ein
elev ikkje kan fanga: dei får sjå ei løysing, og har ingen grunn til å tvile på henne. Alt
anna — ein stygg parentes, ein dublett — ser dei sjølve.

Kontrollen ligg att som test, så han gjeld neste gong òg.

### Kva verifiseringa faktisk fann

Tre ting, og det er verdt å skilja dei:

**Ein ekte designfeil.** Integrasjonskonsepta lever på *eitt* nivå kvar —
`substitution_definite` finst berre på nivå 4, `parts_combined` berre på 5. Det er ærleg
for faget, men `fallbackSelection` fall tilbake til heile konseptet når ingenting låg
innanfor nivåtaket, så ein fersk elev fekk nivå-5-integral i første økt. Derivasjon og
logaritmar har konsept som spenner fleire nivå, så dette hadde aldri bite før.

Fallback-en finst av ein grunn: eit smalna filter skal ikkje gi tom økt. Fiksen skil dei to
tilfella — taket biter per konsept når *banken* har noko lett, og slepper berre når han
ikkje har det. Den eksisterande testen `cold-start prefers easy levels` fanga det, med 2,52
mot 2,5. Ein terskel eg kunne ha slakka; det ville skjult ein reell feil.

**To malfeil.** `e^{-x}(-(x) - )` — eit heilt konstantledd forsvann, fordi hjelparen som
droppar ein koeffisient på 1 vart brukt der 1-talet *var* leddet. Og `-(2x-3)` skrive
`-2x-3`, som er eit anna polynom. Begge kom av at eg attbrukte ein hjelpar utanfor det han
var laga for.

**Ein kvalitetsfeil.** Same oppgåve tre gonger på eitt nivå. Re-seeding på ein salta id ved
kollisjon tok det frå 20+ til 1, utan å røre determinismen: id-en er framleis kanonisk.

**Lærdomen:** ein test som feilar på 2,52 mot 2,5 ser ut som ein terskel som må justerast.
Han var det ikkje. Sjå på kvifor talet flytta seg før du flyttar grensa.

### Ein farge eg hadde lova bort

DESIGN.md hadde reservert violett `#805AD5` til integrasjon, skrive før modulen fanst. Det
gjekk ikkje: violett tyder gjennomgått døme overalt elles i appen. Modulen fekk rust
`#9C4221`, og DESIGN.md fekk grunngjevinga.

---

## Stage 7c – Fag som eiga inndeling i Tren (v0.8.2)
**Dato:** 2026-09-15

Filteret i Treningsrommet listar emna flatt: «Kjerneregelen · Produktregelen ·
Brøkregelen · Produktsetninga · Kvotientsetninga …». Ein elev som ikkje alt veit kva fag
kvart namn høyrer til, har ingen sjanse. Resten av appen — Lærebok, Framgang — grupperer
etter modul. Tren var den einaste staden som ikkje gjorde det.

Økta blandar framleis fag. Det er heile poenget med interleaving, og det er ikkje
*utvalet* som var problemet, berre kor tydeleg appen seier kva du ser på. Difor fekk
kortet òg modulnamnet: farge på venstrekanten er ikkje nok når to fag byter på.

Filtertilstanden var éin streng, `"derivative:chain"`. Den forma kan ikkje uttrykkja
«heile derivasjon», så ho vart to felt, og filtreringa flytta ut av sida og inn i
`filterBank()` der ho kan testast.

**To fargefeil i same slengen.** Brukaren peika på ei lyseblå linje og ein for mørk
oppgåveboks. Begge var mine:

`--color-primary-50` er ein tint til å liggja *bak tekst* — knappe-hover, merkelappar.
Eg hadde brukt han som flate: framdriftssporet i Tren, hjelpe-prikkane i stigen,
søylespora på Framgang. Ved start er framdriftsfyllet null breitt, så det einaste ein ser
er sporet: ein blå strek tvers over sida, utan meining. Spor er varme no.

Oppgåveboksen sette eg til `--color-sunk` førre runde, for å retta at han lånte
sidebotnen sin krem. Rett diagnose, for hard kur: `--sunk` ber `kbd` og `code`, ikkje ein
slab på 700px. Eit hakk mjukare, med tynn ramme, gjer same jobben.

**Målt før eg rørte noko:** boksen såg uforholdsmessig høg ut, og eg skulle til å kutta
polstringa. `getBoundingClientRect()` på `.question` og på MathJax-containeren inni viste
at polstringa var 21px og resten var MathJax sine eigne `margin: 1em 0` på display-matte.
Hadde eg kutta polstringa, ville boksen vore like høg og teksten klemt mot ramma.

---

## Stage 7b – Drakta mot rett kjelde (v0.8.1)
**Dato:** 2026-09-15

Første runde med Lektorodd-drakta bygde på skillen `itslearning-boksar`. Den skillen er
laga for inline-stil i ein LMS-editor og har difor berre det ein boks treng — ikkje
sidechromet. Difor mangla rutenettet, flateskalaen og display-skrifta.

Den fulle drakta låg i ein artefakt frå ein tidlegare samtale. `lektorodd.no` er blokkert
av egress-proxyen, og repoet er ikkje oppdatert, så artefakten var einaste veg inn.

Tre ting brukaren peika på hadde éi felles årsak: eg hadde flata ut ein fireleddet
flateskala til to. Difor låg eit innfelt felt på sidebotnen sin krem inni eit kvitt kort.
Linjene mine var kalde `#E3E6EA` mot varm krem, og knappane mangla `--ink-strong` og
`--line-strong` heilt.

**Lærdomen:** ein skill som skildrar ein komponent er ikkje det same som eit tema. Eg
generaliserte frå boksen til heile sida og fann opp det som mangla i staden for å leita
vidare etter kjelda.

**Og ein til:** eg mørkna begge gråtonane forrige runde fordi brødteksten berre klarte
4,48:1. Det var symptombehandling. Temaet set `body { color: var(--ink) }` — brødtekst er
full ink, og grå er berre for ingressar og metalinjer. Feilen var den globale `p`-regelen.

**Verifisering som faktisk fann noko:** `getComputedStyle(document.body)` sa at rutenettet
var på plass, men skjermbiletet viste ingenting. `.app-shell` målte ein solid krembotn
rett oppå. Ei berekna verdi på rett element beviser ikkje at noko er synleg.

---

## Stage 7 – Lektorodd-drakt (v0.8.0)
**Dato:** 2026-09-15

Appen er flytta frå «Axiom Geometric» — indigo, kald grå botn, Epilogue, pilleknappar —
til Lektorodd-temaet som læraren sitt itslearning-materiale alt brukar. Krembotn,
Source Sans 3, rolege 4/6/8px-hjørne, og den 4px farga venstrekanten som er signaturen i
boksane. Paletten er henta frå skillen `itslearning-boksar`, ikkje funnen opp på nytt.

Det mest verdifulle var ikkje fargane, men at fargane no **tyder** noko: violett er
gjennomgått døme og formel overalt, gult er «merk deg», grønt og raudt er rett og galt.
Eleven lærer éin kode som gjeld begge stader.

**Kva gjekk bra:** tokenlaget heldt. Fordi komponentane alt brukte `var(--…)` nesten
overalt, var det berre tre hardkoda fargar att i heile appen. Logikken vart ikkje rørt,
og alle 73 testar stod urørte gjennom heile omlegginga.

**Det skjermbiletet avslørte:** eg hadde rekna kontrast på den dempa tekstfargen i éi
rolle, men gløymt at den globale `p`-regelen brukar same fargen til all brødtekst.
`#6B6F77` gir 4,48:1 på krem — under AA. Begge dei grå er no mørkna eitt hakk. Lærdomen
er at det ikkje held å måla paletten; ein må måla han der han faktisk blir brukt.

**Potensielle utfordringar:** MathJax-rendering er framleis ikkje verifiserbar her (CDN
blokkert av proxyen), så det er farge og form som er sjekka, ikkje formelrendering.

---

## Stage 6 – Stigen inn i Lærebok (v0.7.0)
**Dato:** 2026-09-15

To akser har vore blanda: vanskegrad (nivå 1-5 i oppgåvebanken) og mengd hjelp (kor mykje
av løysinga som alt er fylt ut). Økta varierte begge, så eleven visste aldri om neste kort
var ei oppgåve å løysa eller ei halvferdig løysing å fullføra.

No varierer økta berre vanskegrad — vanlege oppgåver, som den opphavlege ferdighetstreninga.
Mengd hjelp er blitt ein stige i Lærebok: fem trinn, fem ulike oppgåver av same type, frå
heilt gjennomgått til heilt utan hjelp, som eleven blar seg gjennom sjølv. Refleksjons-
spørsmåla flytta med. Tren fekk til gjengjeld ei synleg filterrad for emne og nivå, så
`/velg/` fall bort.

**Kva gjekk bra:** `fadeSteps()` trong ingen endring — han var alltid rein. At stigen har
ei eiga oppgåve per trinn kom ut av at brukaren valde det; det er betre enn å visa same
oppgåva fem gonger, der eleven allereie har sett fasiten på første trinn.

**Det eg tok feil om, tredje gong:** eg har no tre gonger late fading og oppgåvebank flyta
saman, kvar gong med ei grunngjeving frå forskingsrapporten. Rapporten argumenterer for at
gjennomgått løysing skal koma *før* øving — ikkje at oppgåvebanken skal husa lesestoff.
Skiljet brukaren bad om frå første melding var det rette heile vegen.

**Ein reell bug funnen på vegen:** kaldstarten kappa nivået hardt til maks 2. Ein fersk
elev som valde nivå 5 i filteret ville fått null oppgåver. Taket er no ein preferanse.

**Rydding etter gjennomgang av ei emneside:** sida viste gjennomgått døme tre stader —
det kuraterte med prosaforklaring, ein rad med tre genererte på nivå 1/3/5, og stigen sitt
første trinn. Raden er fjerna, og stigen har i staden fått ein vanskegrad-veljar, så begge
aksene ligg i same modulen. Ein ting til å merka seg for seinare: i alle tre
derivasjonsemna løyser «Tenk høgt» same uttrykket som «Gjennomgått døme», heilt fram til
svaret. Logaritmeemna gjer det ikkje. Det er innhald, ikkje kode.

Dobbelten i derivasjonsteorien er òg retta no: «Tenk høgt» brukar eit anna uttrykk enn
stegtabellen i alle tre emna, og helst ein annan funksjonsfamilie, så sida dekkjer rot og
logaritme i tillegg til polynom. Brøkregelen viste same brøken tre stader og er verst
råka. Alle nye deriverte er sjekka numerisk mot ein sentraldifferanse før dei vart skrivne
inn — handrekning som ingen kontrollerer er ikkje verdt risikoen i fagstoff elevar les.

**Potensielle utfordringar:** fading er no brukt éin stad. Om elevane sjeldan opnar stigen,
er spørsmålet om han bør lenkast tydelegare frå kort dei vurderte til «Trong øving» — men
det krev observasjon, ikkje gjetting.

---

## Stage 5 – Lærebok og Treningsrom (v0.6.0)
**Dato:** 2026-09-15

Appen er delt i to på app-nivå: **Lærebok** for kuratert teori og gjennomgåtte døme, og
**Treningsrom** for den genererte oppgåvebanken. Framsida er redusert til éin knapp,
«Start økta», og modusvala (Smart Miks / Fokus / Rettleia) er borte. Stillasbygging er
ikkje lenger ein eigen stad, men ho blandar seg heller ikkje inn i oppgåvebanken: kvart
kort i økta får eit fading-nivå valt per konsept, og botnen er nivå 1 — noko eleven skal
gjera. Det heilt gjennomgåtte dømet ligg i Lærebok, med lenke frå kvart kort.

Første utkast la nivå 0 inn i økta med tilvising til forskingsrapporten. Det braut med
sjølve premissen: då vart det tilfeldig om «Start økta» gav deg noko å lesa eller noko å
løysa. Retta før merge — Lærebok fekk i staden tre ferdig løyste døme per emne.

Vi vurderte først to spor per emne, men det ville låst treninga inne i kvar modul og
hindra veksling mellom emne — som er heile poenget med interleaving. App-nivå vann.

`registry.ts` er no ein ekte `TopicModule`-kontrakt. Integrasjon blir ei mappe pluss ei
linje. Konsept-IDar vert utleidde frå banken, og ein test låser at kvart konsept faktisk
har oppgåver bak seg.

**Kva gjekk bra:** Læringsmotoren tolte ombygginga godt — `spaced-repetition.ts` og
`guidance-fading.ts` var allereie modulnøytrale og trong nesten ingen endring. Å
konvertere innhaldet til nynorsk ved å importere og re-serialisere, i staden for regex
over LaTeX, gjekk feilfritt.

**Det som overraska:** Fleire ting var skrivne, testa og fråkopla. `selectFadingLevel()`
vart aldri kalla utanom testane. Veljaren var derivasjonsforma, så logaritmeruta brukte
han ikkje. Sju av tolv derivasjonskonsept kunne aldri oppstå. Oppgåve-IDar dreiv mellom
lastingar medan framgang vart lagra på id. Alle 15 sjølvforklaringsspørsmåla hadde
fasiten øvst. Den gamle testsuiten såg ingen av desse, fordi han bygde ein syntetisk
bank med nettopp dei kombinasjonane generatoren ikkje kan lage.

**Potensielle utfordringar:** Produkt- og brøkregelen genererer framleis berre
polynomvariantar, så dei er eitt konsept kvar der kjerneregelen har tre. Å utvide dei
er innhaldsarbeid, ikkje arkitektur. MathJax vert lasta frå CDN, og kan ikkje
verifiserast i eit sandkassemiljø der CDN-en er blokkert.

---

## Stage 4 – Multi-modul-arkitektur + logaritmar (v0.5.0)
**Dato:** 2026-03-21, 22:50 CET

Appen er refaktorert frå ein einskildfag-applikasjon til ein fleirfagsplattform. Ny modul-registry (`registry.ts`) definerer metadata for kvart fag og gjer at `StudentModel` dynamisk hentar konsept-IDar. Eksisterande brukardata vert migrert automatisk når nye moduler vert lagt til. Derivasjonsmodulen er flytta til `/derivasjon/`, og ein ny logaritmemodul er lagt til under `/logaritmer/` med 6 emne: produktsetning, kvotientsetning, potenssetning, forenkling, logaritmiske likningar og eksponentiallikningar — kvart med 5 vanskelegnivå og 8 variantar (240 oppgåver totalt). Teoribankinnhald og sjølvforklaringsspørsmål er lokalisert til tre språk.

Ei ny landingsside på `/` fungerer som inngang med modulkort, framgangsvising og pedagogiske prinsipp (mellomromsrepetisjon, gradvis meistring, tilpassa vanskegrad). Header er oppdatert med «← Alle emne»-lenke og nytt namn: Mattetrening.

**Kva gjekk bra:** Modul-registry-mønsteret gjer det enkelt å leggje til fleire fag seinare. Migrasjonslogikken i `loadStudentModel()` bevarer eksisterande data saumlaust. Alle 46 testar passerer, og bygget produserer statiske filer for alle 3 ruter.

**Potensielle utfordringar:** Logaritme-modulen har sin eigen inline-UI i `+page.svelte` i staden for å bruke delte komponentar som derivasjonsmodulen. Rettleia øving for logaritmar er enklare enn derivasjonsversjonen. Bør harmoniserast med ein delt `ModulePage.svelte` i neste stage.

---

## Stage 3 – Veiledningsfading (v0.4.0)
**Dato:** 2026-03-20, 14:20 CET

Bakover-fading (backward fading) er nå implementert i Smart Mix. Nye studenter ser fullstendige løysingseksempel (nivå 0) med alle steg synlege og ein «Studer dette»-melding. Etter kvart som konfidens og treffsikkerheit aukar, gøymer systemet fleire steg: nivå 1 gøymer siste steg, nivå 2 gøymer dei to siste, nivå 3 viser berre identifikasjon (40%), og nivå 4 er fullstendig sjølvstendig øving. FadedProblemCard-komponenten viser animerte steg med label-tags (IDENTIFY, DIFFERENTIATE, APPLY, SUBSTITUTE, SIMPLIFY), ein «Din tur!»-markør der stega er gøymde, og ein «Vis løysing»-knapp.

Sjølvforklaringsspørsmål (self-explanation prompts) er lagt til som fleirvalsspørsmål etter svaravsløring på nivå 1-3. Desse spør kvifor ein bestemt regel er brukt (t.d. «Kvifor kjerneregelen og ikkje produktregelen?»), med riktig/galt-tilbakemelding. Spørsmåla er lokaliserte til alle tre språk.

**Kva gjekk bra:** Separasjonen mellom `structuredSteps[]` og legacy-streng gjer at eksisterande kode (Fokus-modus, Stats-vising) framleis fungerer utan endringar. Testdekninga voks til 36 testar.

**Potensielle utfordringar:** Quotient-generatoren har placeholder-steg (`u = ?, v = ?`) i structured steps sidan den ikkje alltid set inn riktige verdiar. Bør fiksast i seinare stage.

---

## Stage 2 – Læringsmotor v1 (v0.3.0)
**Dato:** 2026-03-20, 12:10 CET

Den naive vektede tilfeldig-utvelgelsen i Smart Mix er erstattet med en adaptiv læringsmotor inspirert av FSRS (Free Spaced Repetition Scheduler). Motoren bestir seg tre filer: `student-model.ts` definerer 12 konsept-IDer (kjerneregel × 4 funksjonstyper = 12) med Bayesiansk konfidens, ease-faktor og intervallplanlegging. `spaced-repetition.ts` håndterer oppdatering etter hvert forsøk – riktig svar øker intervallet med ease-faktoren, feil halverer det. `problem-selector.ts` implementerer 60/30/10-fordelingen: 60% repetisjon av forfalt stoff prioritert etter hastegraden, 30% utfordring av svake konsepter over nåværende nivå, og 10% nye konsepter. Kaldstart-modus gir diversifisert trekning på tvers av emner med vektet sannsynlighet.

**Hva gikk bra:** Separasjonen av StudentModel fra legacy progress-kartet gjør at vi kan beholde bakoverkompatibilitet med Stage 1 samtidig som motoren sporer rikere data. Interleaving virker umiddelbart – oppgavene i Smart Mix kommer nå fra ulike regler og typer. Stats-siden viser nå treffsikkerhet som et eget kort.

**Potensielle utfordringer:** FSRS-parameterne (ease-faktor, intervall) er satt med fornuftige standardverdier men er ikke kalibrert mot ekte brukerdata. Bayesiansk oppdatering bruker faste likelihood-verdier (0.85/0.15) som kan være for aggressive. Tidssporing (sekunder per oppgave) er ennå ikke implementert – den bør inn i Stage 3 eller 4.

---

## Stage 1 – Port av kjernefunksjoner (v0.2.0)
**Dato:** 2026-03-20, 11:30 CET

All kjernefunksjonalitet fra v2 er nå portert til den nye SvelteKit-arkitekturen. Det inkluderer komplett i18n-system med norsk, engelsk og spansk, hele oppgavebanken med 1200 derivasjonsoppgaver (kjerne-, produkt- og brøkregel × 5 nivåer × 4 typer), treningsarenaen med fokus- og miksmodus, teoribanken, statistikksiden med CSS-basert donut-diagram, og hjelpesiden. Header-navigasjonen er responsiv med mobilmeny. ProblemCard-komponenten har hint- og fasit-toggle med MathJax re-rendering og vurderingsknapper. State management bruker Svelte 5 runes (`$state` og `$derived`) konsekvent.

**Hva gikk bra:** Porteringen gikk overraskende glatt. MathJax-integrasjonen i Svelte fungerer pålitelig med `typesetMath()` / `typesetElement()`. CSS-donut-diagrammet erstatter Chart.js-avhengigheten helt – en CDN-avhengighet mindre. Alle designsystemtokens fra Stage 0 holder seg konsistente gjennom alle sidene.

**Potensielle utfordringer:** Oppgavegeneratoren produserer oppgaver på kjøretid (1200 stk), noe som kan bli merkbart på trege enheter. Hint-tracking bruker fortsatt en enkel array – bør optimaliseres med Set i neste iterasjon. Statistikksiden beregner alt on-the-fly fra hele banken, som skalerer dårlig om banken vokser.

---

## Stage 0 – Prosjektoppsett (v0.1.0)
**Dato:** 2026-03-20, 10:53 CET

Prosjektet er nå satt opp fra bunnen av med SvelteKit og TypeScript. Vi forlater den gamle monolittiske HTML-filen og bygger en moderne, modulær arkitektur. Hele designsystemet «Axiom Geometric» er implementert som CSS custom properties med Epilogue-fonten, avrundede knapper og kort, og fargeskalaen fra DESIGN.md. Mappestrukturen er lagt opp etter anbefalingene i future-report.md med separate mapper for læringsmotoren, fagmoduler, komponenter, state management og i18n. Versjonering, changelog og denne loggen er etablert med en egen workflow-dokumentasjon.

**Hva gikk bra:** SvelteKit-oppsettet med `sv create` gikk smertefritt. Svelte 5 med runes er aktivert out-of-the-box. Adapter-static lar oss bygge til rene statiske filer, akkurat som kravene tilsier.

**Potensielle utfordringer:** MathJax-integrasjon i SvelteKit krever litt ekstra arbeid – skriptet må lastes fra CDN i `app.html` og `MathJax.typeset()` må kalles manuelt etter Svelte-oppdateringer. Vi må også passe på at runes-syntaksen er konsekvent brukt da prosjektet vokser.
