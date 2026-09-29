# Тикет #5 — Даалгаврын жагсаалт

1. **`src/lib/loan.ts`-д `ScheduleRow` төрөл, `buildSchedule` функц нэмэх.**
   Алгоритм: `payment = Math.round(calculateLoan(...).monthlyPayment)`; сар
   `1..n-1`: `interest = Math.round(balance·r)`, `principal = payment - interest`,
   `balance -= principal`; сүүлийн мөр: `interest = Math.round(balance·r)`,
   `principal = balance`, `payment = principal + interest`, `balance = 0`.
   Верификаци: `npm run typecheck` алдаагүй, `buildSchedule` экспортлогдож
   `ScheduleRow[]` буцаана.

2. **`src/lib/loan.test.ts`-д `describe('buildSchedule')` тестүүд нэмэх:**
   мөрийн тоо === `n`; сүүлийн мөрийн `balance === 0`; бүх мөрийн `principal`-ийн
   нийлбэр === `amount`; `r = 0` үед бүх `interest === 0` ба `principal === payment`;
   `n = 1` үед ганц мөр, `principal === amount`; ирмэг кэйс
   (`amount=1000, rate=30, n=36`) дээр `balance === 0` ба нийлбэр биелэх.
   Верификаци: `npm test` бүх тест ногоон.

3. **`src/app.css`-д 5 шинэ токен нэмэх** (`docs/design/ui.txt`-ийн Tokens блокоос
   яг тэр утгаар): `--text-table`, `--text-table-head`, `--table-row-y`,
   `--table-min-width`, `--surface-stripe`. Одоогийн токенуудын доор.
   Верификаци: `grep` хийхэд 5 токен бүгд `app.css`-д байгаа, утга нь `ui.txt`-тэй
   яг таарна.

4. **`src/lib/components/MoveHorizontalIcon.svelte` шинээр үүсгэх** —
   `InfoIcon.svelte`-ийн бүтцийг хуулж (`size` проп, `stroke="currentColor"`,
   `aria-hidden`), замуудыг `m18 8 4 4-4 4`, `M2 12h20`, `m6 8-4 4 4 4` болгох.
   Верификаци: `npm run typecheck` алдаагүй; компонент бусад icon-той ижил
   props интерфэйстэй.

5. **`src/lib/components/ScheduleTable.svelte` шинээр үүсгэх** — `let { rows }:
   { rows: ScheduleRow[] } = $props()`. Бүтэц: `div.scroll` (`overflow-x: auto;
   min-width: 0`) → `<table>` (`table-layout: fixed`, `<colgroup>` 9/22/24/20/25%)
   → `thead` (шошго `САР`, `ТӨЛБӨР`, `ҮНДСЭН ТӨЛБӨР`, `ХҮҮ`, `ҮЛДЭГДЭЛ`) →
   `tbody` (`{#each rows as row (row.month)}`, `formatTugrik` ашиглана) → доор нь
   `p.hint` (`↔` + `MoveHorizontalIcon`, зөвхөн `@media (max-width: 899px)`).
   Хэв маяг: `docs/design/ui.txt`, plan.md-ийн "Дизайны утгууд" хэсэгт заасан
   бүх дүрмийг (тэгш мөрийн судал, сүүлийн мөрийн өнгө, padding, зэрэгцүүлэлт)
   дагана. Верификаци: `npm run typecheck` алдаагүй; компонент тусад нь харахад
   толгой мөрийн 5 багана, `min-width` бүрхүүл дээр байгаа эсэх нүдээр харагдана.

6. **`src/lib/components/LoanCalculator.svelte`-д хуваарийг холбох** —
   `buildSchedule`, `ScheduleTable` импортлох; `let schedule = $derived(result &&
   isValidAmount(amount) && isValidRate(rate) && isValidTerm(term) ?
   buildSchedule(amount, rate, term) : null)`; `</main>`-ийн дараа, `.page`
   дотор `{#if schedule}` картанд гарчиг (`h2`), тайлбар (`p`, mobile/desktop
   хувилбартай), `<ScheduleTable rows={schedule} />`. Карт: `--surface`,
   `--border`, `--radius-lg`, mobile/desktop padding-gap ялгаа plan.md-д заасны
   дагуу. `.main`-ийн grid хэвээр үлдэнэ. Верификаци: `npm run typecheck`
   алдаагүй; `result === null` үед хуваарийн блок DOM-д алга.

7. **Desktop 1280 ба Mobile 320 дэлгэцийг `docs/design/screens/ui.png`-тэй
   харьцуулах** — байршил, өнгө, фонт хэмжээ, баганын харьцаа, тэгш мөрийн
   судал, сүүлийн мөрийн онцлол тохирч байгааг нүдээр шалгах.
   Верификаци: dev server ажиллуулж, 1280px ба 320px өргөнд Chrome
   devtools-оор (эсвэл эквивалент) дэлгэцийн зургийг `ui.png`-тэй жишиж
   тулгана; зөрүү бол засаж дахин тулгана.

8. **320px-д хуудасны хэвтээ гүйлгэлт үүсэхгүй, хүснэгт дотроо гүйлгэгддэгийг
   шалгах** — `.page`, `.main`, карт бүгдэд `min-width: 0` байгааг эх кодоос
   нягтлах (grep), 320px viewport дээр `document.documentElement.scrollWidth
   === document.documentElement.clientWidth`, харин хүснэгтийн `div.scroll`
   өөрөө хэвтээ гүйлгэгддэгийг шалгах.
   Верификаци: 320px дэлгэц дээр хуудас гүйлгэгдэхгүй, зөвхөн хүснэгт
   гүйлгэгдэнэ (ХАШ 5).

9. **Хүлээн авах шалгуур 1–8-ыг бүгдийг нэг бүрчлэн шалгах** — жишээ утгаар
   (жишээ нь 1,000,000₮, 2%, 12 сар, дараа нь 0% хүү тохиолдол) тооцоолуур
   ажиллуулж, мөрийн тоо, багана, сүүлийн үлдэгдэл `0₮`, үндсэн төлбөрийн
   нийлбэр, 0% үеийн хүү багана, хоосон/буруу оролтын үеийн харагдац, монгол
   шошго/формат бүгдийг гараар шалгах. Верификаци: 8 шалгуур тус бүр дээр
   тэмдэглэсэн PASS/FAIL, бүгд PASS.

10. **Эцсийн build шалгалт** — `npm run typecheck && npm test && npm run build`
    гурвыг дараалан ажиллуулах.
    Верификаци: гурвуулаа алдаагүй, тэг гарах кодтой (ХАШ 9) дуусна.
