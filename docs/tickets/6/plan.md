# Тикет #6 — Хэрэгжүүлэх төлөвлөгөө

## Approach

Давхаргууд хэвээр: цэвэр тооцоолол (`loan.ts`, дугуйлаагүй), хуваарь (`buildSchedule`,
дугуйлсан), дизайны дагуух Svelte компонент. `repaymentType` нь `LoanCalculator`-т
`$state`-ээр амьдарна, `$derived`-ээр доош дамжина — хадгалалт, URL байхгүй.

Дизайн (`docs/design/ui.txt`, `screens/ui.png`) нь spec-ээс хойш шинэчлэгдсэн бөгөөд
хэд хэдэн газар spec-ийн таамаглалыг дардаг. Доорх "Шийдвэрүүд" хэсгийг дага.

## Шийдвэрүүд (spec ↔ дизайн зөрөх газрууд)

| # | Spec-ийн таамаглал | Дагах шийдвэр |
|---|---|---|
| 1 | "Хэмнэлт" зөвхөн үндсэн төлбөр тэнцүү горимд | **Дизайн дардаг:** хоёр горимд ч харагдана. Утга нь сонголтоос хамаарахгүй (`interestSavings`), зөвхөн доорх тайлбар текст солигдоно. |
| 2 | `result === null` үед "Хэмнэлт" DOM-д байхгүй | **Дизайн дардаг:** Savings strip үлдэж, утга нь `—`, доорх тайлбар өгүүлбэр **байхгүй** (ui.txt:595-600). |
| 3 | Сонголтын hint зөвхөн desktop | **Дизайн дардаг:** 390, 320 дээр ч харагдана (ui.txt:284, 432). |
| 4 | Шинэ токен нэмэх магадлалтай | **Шаардлагагүй.** Segment/Savings-ийн бүх утга `app.css`-д аль хэдийн байна. `app.css` хөндөгдөхгүй. |
| 5 | `lastPayment = amount/n · (1+r)` | Хэвээр (10M/2%/12 → `850,000₮`). Дизайнд `850,004₮` бичсэн нь хуваарийн сүүлийн мөрөөс гаралтай. Энэ ±4₮ зөрүү нь аннуитет горимд аль хэдийн байгаа зөрүүтэй (панел `1,347,152₮` ↔ дизайн `1,347,153₮`) ижил ангилал — тикет #5-д хүлээн зөвшөөрөгдсөн. `loan.ts` дугуйлаагүй хэвээр үлдэнэ. |

## `loan.ts` — шинэ гэрээ

```ts
export type RepaymentType = 'annuity' | 'equalPrincipal';
export type LoanResult = { monthlyPayment; totalInterest; totalPayment; firstPayment; lastPayment };
```

`calculateLoan(amount, pct, n, type = 'annuity')`, `buildSchedule(amount, pct, n, type = 'annuity')` —
дөрөв дэх параметр нэмэгдэнэ, одоогийн дуудалт хөндөгдөхгүй.

**`calculateLoan`, `equalPrincipal` (r = pct/100):**
`firstPayment = amount/n + amount·r`, `lastPayment = amount/n · (1+r)`,
`totalInterest = r · amount · (n+1)/2`, `totalPayment = amount + totalInterest`,
`monthlyPayment = firstPayment` (энэ горимд ганц "сарын төлбөр" гэж байхгүй; hero
`firstPayment`-ыг уншина, талбарыг JSDoc-д тайлбарла).
Аннуитет үед `firstPayment = lastPayment = monthlyPayment`.

**`buildSchedule`, `equalPrincipal`:**
```
base = Math.round(amount / n); balance = amount
сар 1..n-1: interest = Math.round(balance * r)
            principal = Math.min(base, balance)        // ← сөрөг үлдэгдлээс хамгаална
            balance -= principal
сүүлийн мөр: interest = Math.round(balance * r); principal = balance; balance = 0
```
`Math.min` байхгүй бол жижиг дүн + урт хугацаанд (`100₮ / 36 сар`) сүүлийн мөрийн
`principal` сөрөг гарна. 10M/2%/12 дээр энэ нь ажиллахгүй тул ХАШ 3-ыг зөрчихгүй.

**`interestSavings(amount, pct, n)** = `Math.max(0, аннуитетийн totalInterest − equalPrincipal-ийн totalInterest)`.

## Файлууд

| Файл | Юу хийх |
|---|---|
| `src/lib/loan.ts` | Дээрх гэрээ. Аннуитетийн одоогийн салаа, валидаторууд хөндөгдөхгүй. |
| `src/lib/loan.test.ts` | Одоогийн тестүүд **өөрчлөгдөхгүй**. Гурван шинэ `describe`, доорх жагсаалтаар. |
| `src/lib/components/RepaymentTypeField.svelte` | **Шинэ.** `{ value: RepaymentType, onchange: (next: RepaymentType) => void }`. |
| `src/lib/components/TrendingDownIcon.svelte` | **Шинэ.** `MoveHorizontalIcon.svelte`-ийн бүтцийг хуул (`size = 16`, `stroke="currentColor"`, `aria-hidden`). Замууд: `M22 17 13.5 8.5 8.5 13.5 2 7`, `M16 17h6v-6`. `.trending-down-icon { color: var(--accent-bright) }`. |
| `src/lib/components/ResultPanel.svelte` | Шинэ проп `type: RepaymentType`, `savings: number \| null`. Hero label, мөрүүд, Savings block, note текст. |
| `src/lib/components/LoanCalculator.svelte` | `let repaymentType = $state<RepaymentType>('annuity')`; `result`/`schedule`-д 4 дэх аргумент; `let savings = $derived(... ? interestSavings(amount, rate, term) : null)`; `.form-card`-ийн **гурван талбарын доор** `RepaymentTypeField`; хуваарийн desktop тайлбар горимоор солигдоно. |

`app.css`, `ScheduleTable.svelte`, `Field.svelte`, `format.ts`, `+page.svelte` хөндөгдөхгүй.
**Өгөгдлийн өөрчлөлт байхгүй** — хадгалалт, схем, миграц алга.

## Дизайны утгууд

**Байрлал.** Дизайнд сонголт нь `.form-card`-ийн **сүүлийн** элемент (ui.txt:133, 425, 636) —
spec-ийн "гурван талбарын дээр" гэдгийг дизайн дардаг.

**RepaymentTypeField** (ui.txt:94-100, 133-140, 636-643). `<fieldset>` + `<legend class="field-label">`
"Эргэн төлөлтийн төрөл" (`Field.svelte`-ийн `.field-label` хэв маяг: 14px/500, `--ink-muted`).
Track: `--surface-inset`, 1px `--border`, `--radius-md`, `padding: var(--space-1)`, `gap: var(--space-1)`,
`align-items: stretch`. Сонголт бүр `<label>` (`flex: 1 1 0; min-width: 0`) → доторх
`<input type="radio" name="repayment-type">` нь дэлгэцэнд харагдахгүй (sr-only, `display:none` **биш** —
фокус авах ёстой) + `<span class="segment-label">` нь харагдах хайрцаг:
`padding: var(--space-3) var(--space-2)`, `--radius-sm`, төвлөрсөн, `line-height: 1.3`,
13px mobile / 14px (`--text-label`) `@media (min-width: 900px)`.
Сонгогдоогүй: `color: var(--ink-muted)`, `font-weight: 500`, **`border: 1px solid transparent`**
(сонгоход 1px үсрэхээс сэргийлнэ). Сонгогдсон (`input:checked + .segment-label`):
`background: var(--surface)`, `border-color: var(--accent)`, `color: var(--brand-deep)`, `font-weight: 600`.
`input:focus-visible + .segment-label` → `Field.svelte`-ийн focus хэв маяг
(`border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft)`).
Доор `<p class="field-hint">` — `--ink-muted`, `--text-hint`, `line-height: 1.45`
(`Field.svelte`-ийн улаан `.field-hint` биш, тусдаа класс):
аннуитет → `Сар бүр ижил дүн төлнө.`;
үндсэн төлбөр тэнцүү → `Үндсэн төлбөр сар бүр ижил, хүү үлдэгдлээс бодогдоно.`

**ResultPanel** (ui.txt:141-164, 644-671). Hero шошго: `САРЫН ТӨЛБӨР` / `ЭХНИЙ САРЫН ТӨЛБӨР`.
Hero утга: `result.firstPayment` (аннуитет үед `monthlyPayment`-тэй тэнцүү).
Мөрүүд: үндсэн төлбөр тэнцүү үед `Нийт хүү`-гийн **өмнө** `Сүүлийн сарын төлбөр` мөр
зураастайгаа нэмэгдэнэ. Бусад мөр, өнгө хэвээр.
Savings block — сүүлийн зураасны дараа, `.note`-ийн өмнө: `padding-top: var(--space-4)`
(desktop `var(--space-5)`), доторх strip `background: var(--brand-deep-soft)`, `--radius-md`,
`padding: var(--space-3) var(--space-4)`, зүүнд `TrendingDownIcon` 16px + `Хэмнэлт`
(`--accent-bright`, `--text-hint`, 600), баруунд утга (`--ink-inverse`, 18px, desktop `--text-result`, 600),
`result` байхгүй бол `—`. Strip-ийн доор `gap: var(--space-2)`-тай тайлбар
(`--ink-inverse-muted`, 12px, desktop `--text-hint`, `line-height: 1.45`), **зөвхөн `result` үед**:
- аннуитет desktop: `Хоёр аргын нийт хүүгийн зөрүү. Үндсэн төлбөр тэнцүү аргаар тооцвол нийт хүү ийм дүнгээр бага гарна.`
- аннуитет mobile: `Хоёр аргын нийт хүүгийн зөрүү. Үндсэн төлбөр тэнцүү аргаар нийт хүү ийм дүнгээр бага гарна.`
- үндсэн төлбөр тэнцүү (хоёул): `Хоёр аргын нийт хүүгийн зөрүү. Тэнцүү төлбөрт аргатай харьцуулахад нийт хүү ийм дүнгээр бага гарлаа.`

Panel note (одоогийн `.desktop-only` / `.mobile-only` хэв маягаар):
- үндсэн төлбөр тэнцүү desktop: `Үндсэн төлбөр тэнцүү аргаар тооцов. Дүн нь урьдчилсан тооцоо бөгөөд бүхэл төгрөгөөр дугуйлагдсан.`
- үндсэн төлбөр тэнцүү mobile: `Үндсэн төлбөр тэнцүү аргаар тооцсон урьдчилсан дүн. Төлбөр сар ирэх тусам буурна.`
- аннуитетийнх болон `result === null`-ийнх хэвээр.

**Хуваарийн тайлбар** (`LoanCalculator`, ui.txt:674). Desktop, үндсэн төлбөр тэнцүү үед:
`Үндсэн төлбөр сар бүр ижил, хүү үлдэгдлээс бодогдох тул нийт төлбөр сар ирэх тусам буурна.`
Mobile текст хоёр горимд хэвээр.

## Тест (`loan.test.ts`, шинэ describe-ууд)

- `calculateLoan — үндсэн төлбөр тэнцүү`: 10M/2%/12 → `firstPayment ≈ 1,033,333.33`
  (`formatTugrik` → `1,033,333`), `totalInterest === 1_300_000`, `totalPayment === 11_300_000`,
  `lastPayment ≈ 850,000`; r = 0 → `firstPayment === lastPayment === amount/n`, `totalInterest === 0`;
  4 дэх аргумент дутуу/`'annuity'` үед `firstPayment === lastPayment === monthlyPayment`.
- `buildSchedule — үндсэн төлбөр тэнцүү`: мөр 1 = `{1, 1_033_333, 833_333, 200_000, 9_166_667}`,
  мөр 12 = `{12, 850_004, 833_337, 16_667, 0}`; 1..11 дэх `principal` бүгд `833_333`;
  1..11 дэх `payment` чанд буурна (r > 0), r = 0 үед буурахгүй/тэнцүү; `principal`-ийн нийлбэр
  `=== amount`, сүүлийн `balance === 0` (`[1, 6, 12, 60, 360]` дээр); `100₮ / 30% / 36 сар` —
  нийлбэр `=== 100`, ямар ч мөрийн `principal < 0` биш.
- `interestSavings`: 10M/2%/12 → `47,153`-аас ±2 дотор; r = 0 → `0`; хэд хэдэн оролт дээр `>= 0`.

## Эрсдэл

1. **Сүүлийн сарын төлбөрийн ±4₮** (Шийдвэр 5). Панел `850,000₮`, хуваарийн 12 дахь мөр
   `850,004₮` — нэг дэлгэцэнд зөрүүтэй хоёр тоо. Тооцооллын дүрэм spec-ийн хамрах хүрээнээс
   гадуур тул хэвээр үлдээж, энд тэмдэглэв.
2. **`base > balance` ирмэг кэйс.** `Math.min` хамгаалалт мартагдвал жижиг дүнд сөрөг
   `principal` гарна — тест заавал бич.
3. **Segment-ийн 1px үсрэлт.** Сонгогдоогүй сонголтод `border: 1px solid transparent` байхгүй бол
   сонгох үед хайрцгийн өндөр/өргөн үсэрнэ.
4. **320px дээр хоёр мөр.** `Үндсэн төлбөр тэнцүү` нь 320px дээр хоёр мөр болно (дизайнд ч тийм).
   `align-items: stretch` байхгүй бол хоёр хайрцгийн өндөр зөрнө.
5. **`aria-live`.** `.panel`-д `aria-live="polite"` байгаа тул төрөл солих бүрд бүхэл панел
   уншигдана — одоогийн зан төлөв, өөрчлөхгүй.

## Verification

`npm run typecheck && npm test && npm run build` — гурвуул алдаагүй.
