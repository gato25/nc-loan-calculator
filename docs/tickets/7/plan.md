# Тикет #7 — Хэрэгжүүлэх төлөвлөгөө

## Арга барил

`paymentBreakdown` нь `buildSchedule`-ийн дугуйлсан мөрүүдийг нийлбэрлэх цэвэр
функц — `loan.ts`-д, UI-гүй. `BreakdownChart.svelte` нь нэг пропоос легенд +
SVG график зурна. `LoanCalculator.svelte` нь `.main`-ийн **дараа**, хуваарийн
картын **өмнө** шинэ `<section class="chart-card">` нэмнэ (дизайны
`Composition Section`).

Дизайны `docs/design/ui.txt`-ийн `Composition Section` блок (desktop мөр 178–237,
mobile 382–441, 120 сар 1103–1486) бол харагдацын эх сурвалж. Дараах токенууд
`src/app.css`-ийн `:root`-д нэмэгдэнэ (ui.txt мөр 43–48-аас яг тэр утгаар):

```
--chart-principal: var(--accent);   --chart-interest: #c8832e;
--chart-bar-radius: 3px;            --chart-height-desktop: 180px;
--chart-height-mobile: 132px;       --text-chart-axis: 11px;
```

### SVG-ийн геометр (spec-ийн таамаглалаас өөрчилсөн)

Spec нь `viewBox` + `preserveAspectRatio="none"` санал болгосон. Үүний оронд
**`viewBox` огт ашиглахгүй**: `<svg>` нь CSS-ээр `width: 100%` ба
`height: var(--chart-height-*)`, багана бүрийн `x`/`width`/`y`/`height` нь
**хувиар** (`"12.5%"`) өгөгдөнө. Шалтгаан: масштаб гажилт үүсэхгүй тул дизайны
`chart-bar-radius: 3` яг 3px хэвээр гарна (`preserveAspectRatio="none"` үед
`rx` хэвтээ чиглэлд сунаж гажна). AC #7 адилхан биелнэ — SVG нь эцгийнхээ
өргөнийг дагана, доторх хувь дахин тооцоологдоно, гүйлгэлт үүсэхгүй.

- багананы өргөн `w% = 100 / (1.2·n − 0.2)`, зай нь `0.2·w` (дизайны 20% дүрэм);
  `x_i% = i · 1.2 · w`;
- өндөр нь `payment / max(payment)`; хамгийн өндөр багана нь график дүүргэнэ;
- багана бүр **хоёр `<rect>`**: (1) бүтэн өндөртэй `rx="3"`-тай дэвсгэр —
  оройн дугуйлалт үүнээс гарна, (2) түүн дээр үндсэн төлбөрийн дөрвөлжин rect
  ёроолоос дээш — дэвсгэрийн доод дугуйлалтыг бүрэн нуана.
  Дэвсгэрийн өнгө: `interest > 0` бол `--chart-interest`, эс бөгөөс
  `--chart-principal` (хүү 0 үед оройн 3px өөр өнгөөр харагдахаас сэргийлнэ);
- `stroke` хэрэглэхгүй, зөвхөн `fill`.

## Өөрчлөгдөх файлууд

| Файл | Юу |
|---|---|
| `src/lib/loan.ts` | `PaymentBreakdown` төрөл + `paymentBreakdown(amount, monthlyRatePercent, termMonths, type = 'annuity')`. `buildSchedule`-ийн мөрүүдээс нийлбэрлэнэ; `totalPayment === 0` үед хоёр хувь `0`. Одоо байгаа функцуудыг хөндөхгүй. |
| `src/lib/loan.test.ts` | Шинэ `describe('paymentBreakdown')`. |
| `src/lib/components/BreakdownChart.svelte` | **Шинэ.** Ганц проп `breakdown: PaymentBreakdown`. Легенд (дээр) → `<svg>` → baseline → тэнхлэгийн 3 шошго. |
| `src/lib/components/LoanCalculator.svelte` | `let breakdown = $derived(...)`; `{#if breakdown}` доторх шинэ `<section class="chart-card">` + `.chart-head` (h2 + subtitle) + `<BreakdownChart {breakdown} />`; холбогдох `<style>`. |
| `src/app.css` | Дээрх 6 токен. |

### `BreakdownChart.svelte` — дизайны утгууд

- **Легенд** (ui.txt 182–194): desktop хэвтээ `gap: 48px`, mobile (<900px)
  босоо `gap: 12px`. Зүйл бүр `gap: 12px`; swatch 12×12px, `border-radius: 4px`,
  `margin-top: 4px`; текст босоо `gap: 2px` — шошго 13px `--ink-muted`,
  утга 15px/600 `--ink` хэлбэртэй `{formatTugrik(total)} · {share.toFixed(1)}%`.
- Зүйл 1: `Үндсэн төлбөр` / `--chart-principal` / `totalPrincipal`,
  `principalShare`. Зүйл 2: `Нийт хүү` / `--chart-interest` / `totalInterest`,
  `interestShare`.
- **График** (ui.txt 195–237): `gap: 8px`-тэй босоо багана — svg, baseline
  (1px, `--border-strong`, бүтэн өргөн), тэнхлэг.
- **Тэнхлэг**: `1 сар` (зүүн), `{Math.round(n/2)} сар` (төв), `{n} сар` (баруун),
  11px (`--text-chart-axis`), `--ink-muted`, `display: flex` + `flex: 1`.
  `n <= 2` үед дундах шошго харагдахгүй, `n === 1` үед зөвхөн `1 сар`.
- **Хүртээмж**: `role="img"`, `aria-label="{n} сарын төлбөрийн бүтэц: хүү
  {interestShare.toFixed(1)}%"`. Багана бүрт title/aria өгөхгүй, `aria-live` үгүй.

### `LoanCalculator.svelte` — хэсгийн хүрээ

`.schedule-card`-тай ижил хэв маяг, гэхдээ дотор нь гүйлгэдэг зүйл байхгүй тул
хэвтээ padding нь картдаа: mobile `padding: 20px 16px`, `gap: 16px`;
≥900px `padding: var(--space-6)`, `gap: var(--space-5)` (ui.txt 178, 382).
Гарчиг `.schedule-title`-тай ижил (mobile 17px, desktop `--text-result`),
subtitle нь `.schedule-subtitle`-тай ижил, одоо байгаа
`.desktop-only`/`.mobile-only` хос ашиглана:

| | desktop | mobile |
|---|---|---|
| аннуитет | Сар бүр төлөх дүн үндсэн зээл ба хүүд хэрхэн хуваагдахыг харуулна. Эхний саруудад хүүгийн эзлэх хувь өндөр, хугацаа өнгөрөх тусам буурна. | Сар бүрийн төлбөр үндсэн зээл ба хүүд хэрхэн хуваагдаж байгааг харуулна. |
| үндсэн төлбөр тэнцүү | Үндсэн төлбөр сар бүр тэнцүү тул багана аажим намсана: хүү үлдэгдлээс бодогдож буурна. Нийт хүү аннуитет аргаас бага. | Үндсэн төлбөр тэнцүү тул сарын төлбөр аажим буурна. |

## Шийдсэн зүйлс

1. **Легенд графикийн дээр.** Spec "доор нь" гэсэн; дизайн (ui.txt 182 → 195)
   дээр нь байрлуулсан. Харагдацад дизайн давамгайлна.
2. **Хүүгийн өнгө `#c8832e`.** Spec-ийн түр авсан `--accent-bright` биш —
   дизайны `chart-interest`. Spec өөрөө "эцсийн өнгийг дизайн шийднэ" гэсэн.
3. **Subtitle нь `LoanCalculator`-т.** Эргэн төлөлтийн төрлөөс хамаардаг ба
   `PaymentBreakdown`-д тэр мэдээлэл байхгүй — иймээс `BreakdownChart`-ийн
   ганц проп гэсэн хязгаарлалт хэвээр, `.schedule-head`-ийн загварыг дагав.
4. **Тэнхлэгийн дунд шошго** нь `Math.round(n/2)` — дизайны 12→6, 120→60 таарна.

## Тестүүд (`describe('paymentBreakdown')`)

| Тест | Батлах |
|---|---|
| 10,000,000 / 2 / 12 / annuity | `Number(interestShare.toFixed(1)) === 11.9`; `totalPrincipal === 10_000_000`; `totalPayment === totalPrincipal + totalInterest` |
| хувийн нийлбэр | `principalShare + interestShare` → `toBeCloseTo(100, 10)` (дугуйлаагүй дүнгээр) |
| мөрийн тоо | `months.length === termMonths`, `months[0].month === 1` |
| хоёр аргын харьцуулалт | `equalPrincipal`-ийн `interestShare < annuity`-ийнх (ижил оролт) |
| хүү 0 | `interestShare === 0`, `principalShare === 100` |

## Өгөгдлийн өөрчлөлт

Байхгүй. Схем, хадгалалт, API үгүй. `package.json`-ы `dependencies`,
`devDependencies` хөндөгдөхгүй (AC #8) — SVG гараар, шинэ сан нэмэхгүй.

## Эрсдэл

1. **`node_modules` суугаагүй.** Шалгах алхмын өмнө `npm ci` (≥300000ms timeout),
   эс бөгөөс `vitest: not found` гарч ирнэ.
2. **320px дээр хэвтээ гүйлгэлт.** `.chart-card`, легенд, svg-ийн эцэг бүрт
   `min-width: 0`; `svg { display: block; width: 100%; }`. 120 сар × 320px үед
   багананы өргөн ≈1.8px, зай ≈0.4px — багана нийлж харагдах нь дизайнаар
   хүлээн зөвшөөрөгдсөн (ui.txt 1487), гол нь гүйлгэлтгүй багтах.
3. **ui.txt-ийн легендийн 2 дахь зүйл** нь `←Chart Legend Item` ref-ийн
   анхдагчийг (ногоон swatch, "Үндсэн төлбөр") хэвээр хэвлэсэн байна. Зөв утга нь
   `screens/ui.png`-д харагдах улбар шар swatch + "Нийт хүү" + `1,347,153₮ · 11.9%`.
   Бусад бүх утгыг ui.txt-ээс ав.
4. **Хоёр хувь 100.0 болохгүй тохиолдол** (49.95/50.05) — зөвхөн харагдацын
   зөрүү, spec-ээр засахгүй.
5. **Графикийн дүн ба `ResultPanel`-ийн дүн хэдэн төгрөгөөр зөрж болно** —
   график нь дугуйлсан хуваарийн нийлбэр, панель нь `calculateLoan`-ы дүн.
   Spec-ээр зориудаар сонгосон: график нь доорх хүснэгттэйгээ таарна.
6. **Хүү 0 (`rate = 0`)** — хүүгийн давхарга өндөргүй, легендэд `0₮ · 0.0%`.
   Тусгай текст нэмэхгүй.

## Шалгах

```
npm ci && npm run typecheck && npm test && npm run build
```

AC #1,2,3,5,6,7-г графикийн markup болон CSS-ээр нүдээр биш, дараах байдлаар
батална: `breakdown === null` үед `{#if}` салбар нь `<section>`-ийг DOM-д
оруулахгүй (AC #6), `$derived` нь товчгүй дахин тооцооллыг өгнө (AC #5),
`git diff package.json` хоосон (AC #8).
