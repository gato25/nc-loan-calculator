# Тикет #7 — Даалгаврын жагсаалт

1. **Хамаарал суулгах.** `npm ci` (timeout ≥300000ms).
   Верификаци: 0 кодоор дуусна, `node_modules/` үүснэ.

2. **`paymentBreakdown` нэмэх.** `src/lib/loan.ts`-д `PaymentBreakdown` төрөл +
   `paymentBreakdown(amount, monthlyRatePercent, termMonths, type = 'annuity')`
   экспортлох. `buildSchedule`-ийн дугуйлсан мөрүүдээс нийлбэрлэнэ;
   `totalPayment === 0` үед `principalShare`/`interestShare` хоёулаа `0`.
   Одоо байгаа функцуудыг хөндөхгүй.
   Верификаци: `npm run typecheck` алдаагүй дуусна.

3. **`paymentBreakdown` тест бичих.** `src/lib/loan.test.ts`-д
   `describe('paymentBreakdown')` нэмэх: (a) 10,000,000₮/2%/12сар/annuity →
   `Number(interestShare.toFixed(1)) === 11.9`, `totalPayment === totalPrincipal
   + totalInterest`; (b) `principalShare + interestShare` → `toBeCloseTo(100, 10)`;
   (c) `months.length === termMonths`, `months[0].month === 1`; (d)
   `equalPrincipal`-ийн `interestShare < annuity`-ийнх (ижил оролт); (e) хүү 0 үед
   `interestShare === 0`, `principalShare === 100`.
   Верификаци: `npm test` — шинэ 5 тест бүгд ногоон.

4. **Графикийн CSS токен нэмэх.** `src/app.css`-ийн `:root`-д 6 токен нэмэх
   (ui.txt мөр 43–48-аас яг тэр утгаар): `--chart-principal: var(--accent)`,
   `--chart-interest: #c8832e`, `--chart-bar-radius: 3px`,
   `--chart-height-desktop: 180px`, `--chart-height-mobile: 132px`,
   `--text-chart-axis: 11px`.
   Верификаци: `grep -c '^\s*--chart-\|--text-chart-axis' src/app.css` → `6`;
   `npm run typecheck` хэвээр алдаагүй.

5. **`BreakdownChart.svelte` бүрэлдэхүүн бичих.** Шинэ
   `src/lib/components/BreakdownChart.svelte`, ганц проп
   `breakdown: PaymentBreakdown`. Легенд (дээр, swatch+нэр+`{formatTugrik} ·
   {share.toFixed(1)}%`) → `<svg>` (хувиар `x`/`width`/`y`/`height`, `viewBox`
   ашиглахгүй, баганад хоёр `rect`: дэвсгэр `rx="3"` + дээрх дөрвөлжин, зөвхөн
   `fill`) → baseline → 1/дунд/сүүл сарын тэнхлэгийн шошго. `role="img"`,
   `aria-label="{n} сарын төлбөрийн бүтэц: хүү {interestShare.toFixed(1)}%"`.
   Верификаци: `npm run typecheck` алдаагүй; `git diff package.json` хоосон
   (шинэ сан нэмэгдээгүй).

6. **`LoanCalculator.svelte`-д холбох.** `let breakdown = $derived(...)` (оролт
   зөв үед `paymentBreakdown(amount, rate, term, repaymentType)`, эс бөгөөс
   `null`); `</main>`-ийн дараа, хуваарийн картын өмнө, `{#if breakdown}` дотор
   шинэ `<section class="chart-card">` (`.schedule-card`-тай ижил хэв маяг,
   `<h2>Төлбөрийн бүтэц</h2>` + subtitle (repayment type-оос хамаарсан desktop/
   mobile текст) + `<BreakdownChart {breakdown} />`).
   Верификаци: `npm run typecheck` алдаагүй; `breakdown === null` үед `grep`-ээр
   харахад `<section class="chart-card">` зөвхөн `{#if breakdown}` салбар дотор
   байгааг код уншиж батлана (AC #6).

7. **Бүтэн шалгалт ажиллуулах.** `npm run typecheck && npm test && npm run build`.
   Верификаци: гурвуул 0 кодоор дуусна.

8. **Хамрах хүрээний цэвэр эсэхийг батлах.** `git diff --stat package.json
   package-lock.json` болон `git status --porcelain src/`.
   Верификаци: эхнийх хоосон (AC #8); хоёрдахь нь зөвхөн
   `src/lib/loan.ts`, `src/lib/loan.test.ts`, `src/app.css`,
   `src/lib/components/BreakdownChart.svelte`,
   `src/lib/components/LoanCalculator.svelte` 5 файлыг харуулна.
</content>
