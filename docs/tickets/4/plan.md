# Тикет #4 — Хэрэгжүүлэх төлөвлөгөө

## Approach

Репо хоосон (зөвхөн `README.MD`, `docs/`). Төслийг эхнээс нь SvelteKit + TypeScript +
Vite + Vitest дээр үүсгэнэ. Гурван давхарга:

1. `src/lib/loan.ts` — цэвэр тооцоолол, DOM/Svelte-гүй. Бүтэн нарийвчлалтай тоо буцаана.
2. `src/lib/format.ts` — харуулах форматлалт (`Math.round` + мянгатын таслал + `₮`).
3. `src/lib/components/` — дизайны дагуу зурсан Svelte компонентууд, төлөв нь
   `$state`/`$derived` рунууд. "Тооцоолох" товч байхгүй — `$derived` нь оролт өөрчлөгдөх
   бүрд дахин тооцоолно.

Дизайны токенууд `src/app.css`-д CSS custom property-гээр нэг дор тавигдана; компонентууд
hex бичихгүй, зөвхөн `var(--…)` ашиглана.

## Stack decisions

| Асуудал | Шийдэл |
|---|---|
| Package manager | `npm` (spec нь `npm run …` скрипт заасан). `package-lock.json` commit хийнэ. |
| Svelte | Svelte 5, рун синтакс (`$state`, `$derived`). |
| Adapter | `@sveltejs/adapter-static` + `src/routes/+layout.ts`-д `export const prerender = true`. `adapter-auto` нь энэ контейнерт `npm run build` үед "could not detect production environment" гэж унадаг. |
| Font | `@fontsource-variable/inter` (self-hosted npm). Гадны CDN дуудлага байхгүй. |
| Icon | `chart-no-axes-combined`, `info` хоёрыг inline SVG-ээр бичнэ. Lucide dependency нэмэхгүй. |
| Test | `vitest run` (нэг удаа ажиллаад гарна). jsdom шаардлагагүй — тест нь зөвхөн `loan.ts`/`format.ts`. |

## Files

| Файл | Яагаад |
|---|---|
| `package.json` | `dev`/`build`/`preview`/`typecheck`/`test` скрипт. `typecheck` = `svelte-kit sync && svelte-check --tsconfig ./tsconfig.json`. |
| `package-lock.json`, `.gitignore`, `tsconfig.json`, `svelte.config.js`, `vite.config.ts` | Төслийн суурь. `.gitignore`-д `node_modules`, `.svelte-kit`, `build`. |
| `src/app.html`, `src/app.css` | Skeleton + дизайны токенууд, `box-sizing: border-box`, Inter импорт. |
| `src/routes/+layout.ts` | `prerender = true`, `ssr = true`. |
| `src/routes/+layout.svelte` | `app.css` импорт. |
| `src/routes/+page.svelte` | Хуудасны бүрхүүл: `<svelte:head>` гарчиг, `lang="mn"`, `<LoanCalculator />`. |
| `src/lib/loan.ts` | Тооцоолол + оролтын шалгалтын предикатууд. |
| `src/lib/loan.test.ts` | Unit тест. |
| `src/lib/format.ts` | `formatTugrik`, `formatGrouped`, `parseNumberInput`. |
| `src/lib/format.test.ts` | Форматлалтын тест (AC #4 нотлох). |
| `src/lib/components/LoanCalculator.svelte` | Төлөв, шалгалт, монгол хэлний бүх мөр, desktop/mobile layout. |
| `src/lib/components/Field.svelte` | Дизайны `Field` компонент (label + box + unit + hint, алдааны төлөв). |
| `src/lib/components/ResultPanel.svelte` | Дизайны `Result Panel` (hero + 3 divider + 2 Result Row + note). |
| `src/lib/components/BrandMark.svelte`, `InfoIcon.svelte` | Inline SVG icon. |

## API

```ts
// loan.ts
export type LoanResult = { monthlyPayment: number; totalInterest: number; totalPayment: number }
export function calculateLoan(amount: number, monthlyRatePercent: number, termMonths: number): LoanResult
export function isValidAmount(v: number | null): boolean   // Number.isFinite && v > 0
export function isValidRate(v: number | null): boolean     // Number.isFinite && v >= 0
export function isValidTerm(v: number | null): boolean     // Number.isInteger && v >= 1
```

`calculateLoan` нь `r = monthlyRatePercent / 100`; `r === 0` үед `P = L / n`, бусад үед
`P = L·r / (1 − (1+r)^−n)`. `totalPayment = P·n`, `totalInterest = P·n − L`. Дугуйлалт хийхгүй.

Алдааны монгол текст `loan.ts`-д биш `LoanCalculator.svelte`-д байна (loan.ts нь UI-аас
бүрэн хамааралгүй байх ёстой):

- Зээлийн хэмжээ — `Зээлийн хэмжээ 0-оос их байх ёстой.` (дизайнаас шууд)
- Сарын хүү — `Сарын хүү 0 буюу түүнээс их байх ёстой.`
- Хугацаа — `Хугацаа 1-ээс багагүй бүхэл тоо байх ёстой.`

## Design mapping

Токенууд `ui.txt`-ийн Tokens блокоос яг тэр утгаараа. Нэмэлт: `--surface-danger-soft: #FFF7F5`
(алдаатай Field Box-ын дэвсгэр, токен жагсаалтад ороогүй боловч дизайнд байна).

**Field** — label 14/500 `--ink-muted`; box `--surface`, 1px `--border-strong`, radius 12,
padding 14/16, space-between; value 22/600 `--ink`; unit 15/500 `--ink-muted`; gap 8.
Алдаатай үед box fill `--surface-danger-soft`, stroke `--danger`, доор нь hint 13/normal `--danger`.
**Hint зөвхөн алдаатай үед харагдана.**

**Result Panel** — `--brand-deep`, radius 20. Hero label 13/600 `--accent-bright`; 8px зай;
hero value 44/700 `--ink-inverse` lh 1.1; 24px зай; дараа нь divider (`--brand-deep-soft`, 1px)
→ `Нийт хүү` мөр → divider → `Нийт төлөх дүн` мөр → divider → note. Мөрийн padding 16/0,
label 15 `--ink-inverse-muted`, value 20/600; `Нийт төлөх дүн`-ий утга `--accent-bright`.
Note: info icon 16px + 13/1.45 `--ink-inverse-muted`, padding-top 20.

**Буруу оролтын төлөв** — аль нэг талбар буруу бол гурвуулаа `—` (`--ink-inverse-muted`)
болж, note текст `Утга зөв болмогц үр дүн шууд тооцоологдоно.` болж солигдоно.

**Layout** — `@media (min-width: 900px)` дээр desktop: header (brand зүүн, `Зээлийн урьдчилсан
тооцоо` баруун), Main нь grid `1fr 440px` gap 32, хуудасны padding 40/64/56/64, max-width 1280 төвлөрсөн,
title 34/700, subtitle 16/1.5, Form Card padding 32 gap 24.
Үүнээс доош mobile: header note нуугдана, нэг багана, Result Panel маягтын доор, хуудасны
padding 24/20/32/20, title 26/700, subtitle 14/1.45, Form Card padding 20 gap 16, hero 36px,
мөрийн padding 14/0, label 14 / value 18, note 12px.
**320px**: `padding: 20px 16px 28px`, бүх input `width: 100%`, `min-width: 0`, flex дээр
`min-width: 0` — хэвтээ гүйлгэлт үүсэхгүй.

Desktop болон mobile-ийн subtitle, panel note нь өөр өөр текст. Хоёуланг нь рендэрлээд
`@media`-аар нэгийг нь `display: none` болгоно.

## Inputs

`<input type="number">` ашиглахгүй — дизайн `10,000,000` гэж мянгатын тасалттай харуулж байна.
Оронд нь `inputmode` бүхий текст input:

| Талбар | inputmode | Хүлээж авах | Unit |
|---|---|---|---|
| Зээлийн хэмжээ | `numeric` | зөвхөн цифр, бичих үед таслалаар бүлэглэнэ | `₮` |
| Сарын хүү | `decimal` | цифр + нэг цэг | `%` |
| Хугацаа | `numeric` | зөвхөн цифр | `сар` |

Анхны утга: `10,000,000` / `2` / `12` — хуудас нээгдмэгц үр дүн харагдана.
Бүх `<input>`-д `id` + `<label for>`, алдаатай үед `aria-invalid` + `aria-describedby`.
Үр дүнгийн блок `aria-live="polite"`.

## Data change

Backend, storage, migration байхгүй. Бүх төлөв компонентын дотор, refresh хийхэд анхны утга руу буцна.

## Verification

- `npm run typecheck`, `npm test`, `npm run build` — гурвуулаа алдаагүй (AC #9).
- `loan.test.ts`: 10,000,000 / 2 / 12 → `monthlyPayment` ≈ 945,595.97 (±2), `totalInterest` ≈
  1,347,151.59 (±2) (AC #5); `r = 0` → `P = L/n`, `totalInterest === 0` (AC #6); `n = 1`;
  их `n`; `amount` маш бага.
- `format.test.ts`: `formatTugrik(1250000) === '1,250,000₮'`, `formatTugrik(945595.97) === '945,596₮'` (AC #4).

## Risks

1. **Дугуйлалтын 1₮ зөрүү.** Бодит `totalInterest` = 1,347,151.59 → `Math.round` = **1,347,152₮**,
   `totalPayment` = **11,347,152₮**. Дизайн болон spec-ийн текст 1,347,151₮ гэж бичсэн нь mock-ийн
   зөрүү. AC #5-ийн ±2₮ хүлцэлд багтана. Тестийг ±2₮-оор бич, дизайны тоог хатуу битгий шаард.
   Сарын төлбөр 945,596₮ таарч байгаа бөгөөд 945,596 × 12 = 11,347,152 тул дэлгэц дээрх гурван тоо
   өөр хоорондоо зөрөхгүй.
2. **`ui.txt`-ийн Field instance-ууд бүгд `10,000,000` / `₮` / улаан hint-тэй харагдана** — энэ нь
   зурагт компонентын override бичигдээгүйн үр дүн. **PNG нь зөв**: хүү → `%`, хугацаа → `сар`,
   hint зөвхөн алдаатай үед. `ui.txt`-ийг битгий шууд хуул.
3. **`adapter-auto` build дээр унана.** Эхнээс нь `adapter-static` + `prerender` тавь (дээрх хүснэгт).
4. **Caret үсрэх.** Мянгатын таслалыг бичих үед нэмэхэд caret эцэст нь үсэрдэг. Засвар: input-ын
   өмнөх цифрийн тоог тоолж, дахин форматлсны дараа `setSelectionRange`-ээр тэр цифрийн индекс дээр
   буцааж тавь. Хэрэв энэ 15 минутаас удвал fallback: зөвхөн `blur` дээр форматлах.
5. **Сүлжээ.** `npm install` сүлжээ шаардана. Хэрэв татагдахгүй бол цааш явах боломжгүй — дахин
   дахин бүү оролд, шууд мэдэгд.
6. **Inter + кирилл.** `@fontsource-variable/inter` кирилл subset-ийг тусад нь ачаалдаг
   (`inter/cyrillic.css`). Латин subset-ийг ганцаараа импортлоод орхивол монгол текст fallback
   фонтоор гарна — `cyrillic` subset-ийг заавал импортол.
7. **Overflow 320px дээр.** Hero 36px + `945,596₮` нь 248px дотор багтана, гэхдээ илүү урт дүн
   (ж: 999,999,999₮) хальж болзошгүй. Result value-д `overflow-wrap: anywhere`, hero-д
   `font-variant-numeric: tabular-nums` тавь.
