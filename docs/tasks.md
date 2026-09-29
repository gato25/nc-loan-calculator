# Тикет #4 — Даалгаврын жагсаалт

1. **SvelteKit + TS + Vite скелет үүсгэх**: `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore` (`node_modules`, `.svelte-kit`, `build`), `src/app.html`.
   Verify: `npm install` алдаагүй гарна.
2. **Static adapter тохируулах**: `svelte.config.js`-д `@sveltejs/adapter-static`, `src/routes/+layout.ts`-д `export const prerender = true; export const ssr = true;`.
   Verify: (2-р алхмаас хойш) `npm run build` "could not detect production environment" алдаагүй дуусна.
3. **`src/lib/loan.ts` бичих**: `calculateLoan(amount, monthlyRatePercent, termMonths): LoanResult`, `isValidAmount`, `isValidRate`, `isValidTerm` — plan.md-ийн API хэсэгт заасан гарын үсэг, дугуйлалтгүй.
   Verify: файл Svelte/DOM импорт агуулаагүй (цэвэр TS функц).
4. **`src/lib/loan.test.ts` бичих**: 10,000,000/2/12 → `monthlyPayment` 945,595.97 ±2, `totalInterest` 1,347,151.59 ±2 (AC #5); `r=0` → `P=L/n`, `totalInterest===0` (AC #6); `n=1`; их `n`; бага `amount` тохиолдол.
   Verify: `npm test` бүх тест ногоон.
5. **`src/lib/format.ts` бичих**: `formatTugrik`, `formatGrouped`, `parseNumberInput` (`Intl.NumberFormat('en-US')` + гар аргаар `₮`).
   Verify: `formatTugrik(1250000) === '1,250,000₮'`.
6. **`src/lib/format.test.ts` бичих**: `formatTugrik(945595.97) === '945,596₮'` гэх мэт дугуйлалтын кэйс (AC #4).
   Verify: `npm test` бүх тест ногоон.
7. **`src/app.css`-д дизайны token нэмэх**: `docs/design/ui.txt`-ийн Tokens блок + `--surface-danger-soft: #FFF7F5`, `box-sizing: border-box`, `@fontsource-variable/inter` latin + cyrillic subset импорт.
   Verify: `app.css` доторх өнгө/зайн утга бүр `ui.txt` Tokens блокийн утгатай мөр мөрөөр таарна.
8. **`src/lib/components/Field.svelte` бичих**: label (14/500 `--ink-muted`) + box (`--surface`, 1px `--border-strong`, radius 12) + unit + hint; алдаатай үед `--surface-danger-soft`/`--danger` fill, hint зөвхөн алдаатай үед харагдана; `id`/`aria-invalid`/`aria-describedby` дэмжинэ.
   Verify: `docs/design/screens/ui.png`-ийн Field хэсэгтэй typography/spacing/color нэг мөр тохирно.
9. **`src/lib/components/ResultPanel.svelte` бичих**: hero (44/700 desktop, 36/700 mobile) + 3 divider + 2 Result Row (`Нийт хүү`, `Нийт төлөх дүн`) + info note; буруу оролтын үед 3 утга бүгд `—`, note нь `Утга зөв болмогц үр дүн шууд тооцоологдоно.`; блок `aria-live="polite"`.
   Verify: `ui.png`-ийн Result Panel-тэй layout/өнгө нэг мөр тохирно.
10. **`src/lib/components/BrandMark.svelte`, `InfoIcon.svelte` бичих**: inline SVG, гадны CDN/асаалт байхгүй.
    Verify: файлуудад `<img src="http...">` эсвэл гадаад URL байхгүй (`grep`).
11. **`src/lib/components/LoanCalculator.svelte` угсрах**: 3 текст input (`numeric`/`decimal`/`numeric` inputmode, анхны утга 10,000,000/2/12), `$state` + `$derived`, "Тооцоолох" товчгүй, монгол алдааны 3 мессеж (loan.ts биш энд), caret-fix (risk #4) эсвэл fallback blur-formatting.
    Verify: анхны утгаар нээхэд `945,596₮` / `1,347,151₮`(±2) / `11,347,151₮`(±2) гарна (AC #5); талбар хоосруулахад 3 үр дүн `—` болно.
12. **`src/routes/+layout.svelte`, `src/routes/+page.svelte` бичих**: `app.css` импорт, `lang="mn"`, `<svelte:head>` гарчиг, desktop (`grid 1fr 440px`, header) / mobile (нэг багана, header note нуугдана) layout `@media (min-width: 900px)`-ээр.
    Verify: `npm run build` prerender хийсэн HTML-д монгол шошго бүгд орсон байна (`grep` гарчиг/шошго).
13. **320px өргөний overflow шалгах**: бүх input `width:100%; min-width:0`, flex контейнерт `min-width:0`, result value-д `overflow-wrap: anywhere`, hero-д `font-variant-numeric: tabular-nums`.
    Verify: `app.css`/компонентуудад дээрх дүрмүүд бүгд байгааг эх кодоос нягтална (AC #8).
14. **Эцсийн шалгалт**: бүх ХАШ (AC #1–9) дахин тэмдэглэл дээр нягтлах.
    Verify: `npm run typecheck && npm test && npm run build` гурвуулаа алдаагүй дуусна (AC #9).
