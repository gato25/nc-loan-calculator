# Тикет #6 — Даалгаврын жагсаалт

1. **`src/lib/loan.ts`-д `RepaymentType` төрөл нэмэх ба `calculateLoan`-ыг
   өргөтгөх.** `export type RepaymentType = 'annuity' | 'equalPrincipal'`;
   `calculateLoan(amount, monthlyRatePercent, termMonths, type: RepaymentType = 'annuity')`;
   `LoanResult`-д `firstPayment`, `lastPayment` талбар нэмэх (аннуитет үед хоёул
   `monthlyPayment`-тэй тэнцүү). `equalPrincipal` салаа: `firstPayment = amount/n + amount·r`,
   `lastPayment = amount/n · (1+r)`, `totalInterest = r·amount·(n+1)/2`,
   `totalPayment = amount + totalInterest`, `monthlyPayment = firstPayment`.
   Верификаци: `npm run typecheck` алдаагүй; одоогийн 3 аргументтэй дуудалтууд
   өөрчлөгдөхгүйгээр хуучин утгыг буцаана.

2. **`buildSchedule`-ыг `type` параметртэй болгож `equalPrincipal` салаа нэмэх.**
   `buildSchedule(amount, pct, n, type: RepaymentType = 'annuity')`. Алгоритм:
   `base = Math.round(amount/n)`; сар `1..n-1`: `interest = Math.round(balance·r)`,
   `principal = Math.min(base, balance)`, `balance -= principal`; сүүлийн мөр:
   `interest = Math.round(balance·r)`, `principal = balance`, `balance = 0`.
   `ScheduleRow` бүтэц өөрчлөгдөхгүй. `Math.min` хамгаалалтыг мартахгүй байх
   (жижиг дүн/урт хугацаанд сөрөг `principal`-аас сэргийлнэ).
   Верификаци: `npm run typecheck` алдаагүй.

3. **`interestSavings(amount, monthlyRatePercent, termMonths): number` функц
   нэмэх.** `Math.max(0, аннуитетийн totalInterest − equalPrincipal-ийн totalInterest)`.
   Верификаци: `npm run typecheck` алдаагүй, функц экспортлогдоно.

4. **`src/lib/loan.test.ts`-д гурван шинэ `describe` нэмэх** (одоогийн тестүүд
   өөрчлөгдөхгүй):
   - `calculateLoan — үндсэн төлбөр тэнцүү`: 10M/2%/12 → `firstPayment ≈ 1,033,333.33`,
     `totalInterest === 1_300_000`, `totalPayment === 11_300_000`, `lastPayment ≈ 850,000`;
     `r = 0` → `firstPayment === lastPayment === amount/n`, `totalInterest === 0`;
     4 дэх аргумент дутуу/`'annuity'` үед `firstPayment === lastPayment === monthlyPayment`.
   - `buildSchedule — үндсэн төлбөр тэнцүү`: мөр 1 = `{1, 1_033_333, 833_333, 200_000, 9_166_667}`,
     мөр 12 = `{12, 850_004, 833_337, 16_667, 0}`; мөр 1..11 `principal` бүгд `833_333`;
     мөр 1..11 `payment` чанд буурна (`r > 0`); `principal`-ийн нийлбэр `=== amount`;
     сүүлийн `balance === 0` (`[1, 6, 12, 60, 360]` хугацаанд); `amount=100, rate=30, n=36`
     дээр нийлбэр `=== 100`, ямар ч мөрийн `principal < 0` биш.
   - `interestSavings`: 10M/2%/12 → `47,153`-аас ±2 дотор; `r = 0` → `0`; хэд хэдэн
     оролт дээр `>= 0`.
   Верификаци: `npm test` — шинэ болон одоогийн бүх тест ногоон.

5. **`src/lib/components/RepaymentTypeField.svelte` шинээр үүсгэх.**
   `{ value: RepaymentType, onchange: (next: RepaymentType) => void }` проп.
   `<fieldset>` + `<legend class="field-label">Эргэн төлөлтийн төрөл</legend>`;
   track (`--surface-inset`, `--border`, `--radius-md`, `padding/gap: var(--space-1)`,
   `align-items: stretch`); сонголт бүр `<label>` доторх `<input type="radio"
   name="repayment-type">` (sr-only, `display:none` биш) + `<span class="segment-label">`
   ("Тэнцүү төлбөрт", "Үндсэн төлбөр тэнцүү"); сонгогдоогүйд
   `border: 1px solid transparent`; сонгогдсонд (`input:checked + .segment-label`)
   `background: var(--surface); border-color: var(--accent); color: var(--brand-deep);
   font-weight: 600`; `input:focus-visible + .segment-label` → `Field.svelte`-ийн
   focus хэв маяг. Доор `<p class="field-hint">` горимоор солигдох текст
   (аннуитет: "Сар бүр ижил дүн төлнө."; үндсэн төлбөр тэнцүү: "Үндсэн төлбөр
   сар бүр ижил, хүү үлдэгдлээс бодогдоно.").
   Верификаци: `npm run typecheck` алдаагүй; Tab дарж radio-нд фокус орж,
   сум/хоосон зайгаар сонголт солигдоно (native radio семантик); сонгогдоогүй →
   сонгогдсон шилжихэд хайрцгийн хэмжээ үсэрдэггүй (transparent border-той харьцуулж
   нүдээр шалгах).

6. **`src/lib/components/TrendingDownIcon.svelte` шинээр үүсгэх** —
   `MoveHorizontalIcon.svelte`-ийн бүтцийг хуулж (`size = 16`, `stroke="currentColor"`,
   `aria-hidden`), замуудыг `M22 17 13.5 8.5 8.5 13.5 2 7`, `M16 17h6v-6` болгож,
   `.trending-down-icon { color: var(--accent-bright) }` нэмэх.
   Верификаци: `npm run typecheck` алдаагүй; props интерфэйс бусад icon-тэй ижил.

7. **`src/lib/components/ResultPanel.svelte`-д `type: RepaymentType`, `savings:
   number | null` проп нэмэх.** Hero шошго: аннуитет → "САРЫН ТӨЛБӨР", үндсэн
   төлбөр тэнцүү → "ЭХНИЙ САРЫН ТӨЛБӨР"; hero утга `result.firstPayment`. Үндсэн
   төлбөр тэнцүү үед "Нийт хүү"-гийн өмнө "Сүүлийн сарын төлбөр" мөр нэмэгдэнэ
   (`result.lastPayment`). Savings strip хоёр горимд ч харагдана (`TrendingDownIcon`
   + "Хэмнэлт" + `formatTugrik(savings)`, `result` байхгүй бол "—"); strip-ийн доорх
   тайлбар зөвхөн `result` үед, горим/desktop-mobile хослолоор 3 өөр текст
   (plan.md-ийн "ResultPanel" хэсэгт заасан яг үг хэллэгээр). Panel `.note`
   мессеж горимоор солигдоно (мөн тэнд заасан яг үг хэллэгээр).
   Верификаци: `npm run typecheck` алдаагүй; `result === null` үед 3 үндсэн утга
   "—", хуваарь DOM-д алга, savings strip "—" харуулна (тайлбар мөр алга).

8. **`src/lib/components/LoanCalculator.svelte`-д сонголтыг холбох.**
   `let repaymentType = $state<RepaymentType>('annuity')`; `result`, `schedule`-ийн
   `$derived`-д 4 дэх аргумент болгож дамжуулах; `let savings = $derived(isValidAmount
   ... ? interestSavings(amount, rate, term) : null)`; `RepaymentTypeField`-ийг
   `.form-card`-ийн сүүлийн элемент болгож нэмэх (гурван оролтын талбарын доор,
   дизайны шийдвэрээр); `ResultPanel`-д `type`, `savings` дамжуулах; хуваарийн
   desktop тайлбар өгүүлбэрийг горимоор солих ("Үндсэн төлбөр сар бүр ижил, хүү
   үлдэгдлээс бодогдох тул нийт төлбөр сар ирэх тусам буурна." vs одоогийн текст).
   Верификаци: dev server дээр товч дарахгүйгээр сонголт солиход панел болон
   хуваарь шууд шинэчлэгддэг эсэхийг нүдээр шалгах; хуудас нээгдэхэд "Тэнцүү
   төлбөрт" идэвхтэй байна.

9. **Desktop 1280 ба Mobile 320/390 дэлгэцийг `docs/design/screens/ui.png`-тэй
   харьцуулах** — сегмент товчлуурын байрлал/өнгө, hero шошго, "Сүүлийн сарын
   төлбөр" мөр, Savings strip, тайлбар текстүүд, 320px дээр сегмент хоёр мөр
   болох эсэх (`align-items: stretch` ажиллаж буй эсэх). ±4₮ зөрүү (панел
   `850,000₮` ↔ хуваарийн 12 дахь мөр `850,004₮`) хүлээгдэж буй, тикет #5-тэй
   ижил ангиллын зөрүү тул засахгүй.
   Верификаци: 1280px ба 320/390px өргөнд авсан дэлгэцийн зургийг `ui.png`-тэй
   тулгаж, зөрүү байвал засаж дахин тулгана.

10. **Хүлээн авах шалгуур 1–9-ийг бүгдийг нэг бүрчлэн шалгах** (`spec.md`-ийн
    хүснэгт): (1) хуудас нээгдэхэд "Тэнцүү төлбөрт" идэвхтэй; (2) сонголт
    солиход товч дарахгүйгээр панел+хуваарь шинэчлэгдэнэ; (3) үндсэн төлбөр
    тэнцүү горимд мөр 1..n−1 `principal` ижил, `payment` буурна; (4) hero
    "Эхний сарын төлбөр" болж "Сүүлийн сарын төлбөр" тусдаа мөрөнд гарна;
    (5) "Хэмнэлт" мөр `formatTugrik`-аар зөрүүг харуулна; (6) тэр горимын
    хуваарийн сүүлийн мөрийн Үлдэгдэл `0₮`, principal-ийн нийлбэр = зээлийн
    хэмжээ; (7) 10M/2%/12/equalPrincipal → эхний сарын төлбөр `1,033,333`,
    нийт хүү `1,300,000`; (8) `loan.test.ts`-ийн одоогийн бүх тест ногоон;
    (9) гурван build командын шалгалт (даалгавар 11-т давхар шалгагдана).
    Верификаци: 9 шалгуур тус бүрийг PASS/FAIL гэж тэмдэглэж, бүгд PASS болно.

11. **Эцсийн build шалгалт** — `npm run typecheck && npm test && npm run build`
    дараалан ажиллуулах.
    Верификаци: гурвуулаа алдаагүй, тэг гарах кодтой дуусна.
</content>
