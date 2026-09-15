# Utviklingslogg – Mattetrening

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
