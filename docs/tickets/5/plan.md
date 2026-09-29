# Тикет #5 — Хэрэгжүүлэх төлөвлөгөө

## Approach

Одоо байгаа гурван давхаргыг хэвээр нь үргэлжлүүлнэ: цэвэр тооцоолол (`loan.ts`),
форматлалт (`format.ts`), дизайны дагуух Svelte компонент. `calculateLoan`,
`ResultPanel` хөндөгдөхгүй.

1. `buildSchedule` нь `loan.ts`-д нэмэгдэнэ. `calculateLoan`-оос ялгаатай нь **дугуйлсан
   бүхэл тоо** буцаана (ХАШ 3, 4 нь харагдах тоон дээр биелэх ёстой тул дугуйлалт
   тооцооллын дотор хийгдэнэ). `format.ts` нь зөвхөн бүлэглэлт + `₮` нэмнэ.
2. `ScheduleTable.svelte` нь гүйлгэх бүрхүүл + `<table>` + гүйлгэлтийн сануулга.
   `LoanCalculator` нь карт (гарчиг, тайлбар) болон `$derived`-ээр мөрүүдийг байгуулна.

Дизайн (`docs/design/ui.txt`, commit b7799d8) нь spec бичигдсэний дараа шинэчлэгдсэн
бөгөөд хуваарийн дэлгэц, түүнд зориулсан 5 шинэ токен агуулж байна. **Шийдвэр:** spec-ийн
"шинэ токен зохиохгүй" гэсэн таамаглалыг дизайн дарна — токенууд зохиогдсон бус,
батлагдсан дизайнд аль хэдийн байгаа. Мөн spec-ийн `min-width ≈560px`-ийн оронд дизайны
`--table-min-width: 610px` мөрдөгдөнө.

## Алгоритм — `buildSchedule(amount, monthlyRatePercent, termMonths): ScheduleRow[]`

```
r = monthlyRatePercent / 100
payment = Math.round(calculateLoan(...).monthlyPayment)   // calculateLoan-ыг дахин ашиглана
balance = amount
сар 1..n-1:  interest = Math.round(balance * r)
             principal = payment - interest
             balance -= principal
сүүлийн мөр: interest = Math.round(balance * r)
             principal = balance         // үлдсэнийг бүрэн хаана
             payment  = principal + interest
             balance  = 0
```

`ScheduleRow = { month, payment, principal, interest, balance }` — бүгд бүхэл тоо, `loan.ts`-аас
`export type`. Энэ нь ХАШ 3 (сүүлийн `balance === 0`) ба ХАШ 4 (`principal`-ийн нийлбэр ===
`amount`) хоёрыг тодорхойлолтоор нь баталгаажуулна. `r = 0` үед бүх `interest = 0`,
`principal = payment` (ХАШ 6).

## Файлууд

| Файл | Юу хийх |
|---|---|
| `src/lib/loan.ts` | `ScheduleRow` төрөл + `buildSchedule` нэмнэ. `calculateLoan`, валидаторууд хөндөгдөхгүй. UI импорт оруулахгүй. |
| `src/lib/loan.test.ts` | `describe('buildSchedule')` нэмнэ: мөрийн тоо === `n`; сүүлийн `balance === 0`; `principal`-ийн нийлбэр === `amount`; `r = 0` үед бүх `interest === 0` ба `principal === payment`; `n = 1` үед ганц мөр `principal === amount`. Одоогийн тестүүд хэвээр. |
| `src/app.css` | Дизайны 5 шинэ токен: `--text-table: 14px`, `--text-table-head: 12px`, `--table-row-y: 11px`, `--table-min-width: 610px`, `--surface-stripe: #faf9f6`. Одоогийн токенуудын доор, `ui.txt`-ийн утгаар. |
| `src/lib/components/ScheduleTable.svelte` | **Шинэ.** `let { rows }: { rows: ScheduleRow[] } = $props()`. Бүтэц: `div.scroll` (`overflow-x: auto`) → `<table>` → `<thead>`/`<tbody>` → доор нь `p.hint` (зөвхөн mobile). Дүнг `formatTugrik`-аар харуулна. |
| `src/lib/components/MoveHorizontalIcon.svelte` | **Шинэ.** Гүйлгэлтийн сануулгын `move-horizontal` дүрс. `InfoIcon.svelte`-ийн бүтцийг хуулна (`size` проп, `stroke="currentColor"`, `aria-hidden`). Замууд: `m18 8 4 4-4 4`, `M2 12h20`, `m6 8-4 4 4 4`. |
| `src/lib/components/LoanCalculator.svelte` | `buildSchedule`, `ScheduleTable` импорт; `let schedule = $derived(result && isValidAmount(amount) && isValidRate(rate) && isValidTerm(term) ? buildSchedule(amount, rate, term) : null)`; `</main>`-ий **дараа**, `.page` дотор `{#if schedule}` карт. Карт дотор: `h2` гарчиг, `p` тайлбар, `<ScheduleTable rows={schedule} />`. `.main`-ий grid хөндөгдөхгүй. |

Өөр файл өөрчлөгдөхгүй. `+page.svelte`, `+layout.svelte`, `ResultPanel`, `Field`, `format.ts` хэвээр.

## Дизайны утгууд (`ui.txt`-ээс)

**Карт** — `--surface` дэвсгэр, 1px `--border`, `--radius-lg`. Mobile: `padding: var(--space-5) 0`,
`gap: var(--space-4)`; гарчиг/тайлбар/сануулга нь `padding: 0 var(--space-4)` (хүснэгт нь картын
ирмэг хүртэл дүүрч гүйлгэгдэнэ). Desktop (`@media (min-width: 900px)`): `padding: var(--space-6)`,
`gap: var(--space-5)`, дотоод хэвтээ padding-ууд 0 болно.

**Гарчиг** — mobile 17px/600 `--ink`, desktop `--text-result` (20px)/600.
**Тайлбар** — mobile 12px `Сар бүрийн төлбөрийн задаргаа, үлдэгдэл.`; desktop `--text-hint` (13px)
`Сар бүрийн төлбөр үндсэн зээл болон хүү хэрхэн хуваагдаж, үлдэгдэл хэрхэн буурахыг харуулна.`,
`--ink-muted`, `line-height: 1.45`. Одоогийн `.desktop-only`/`.mobile-only` загварыг дагана.

**Хүснэгт** — `width: 100%`, `min-width: var(--table-min-width)`, `border-collapse: collapse`,
`table-layout: fixed`, `<colgroup>` 9% / 22% / 24% / 20% / 25% (дизайны баганын өргөний харьцаа —
desktop 90/230/250/200/246, mobile 44/120/128/110/128 хоёулаа энэ харьцаанд таарна).

| Хэсэг | Хэв маяг |
|---|---|
| `th` | `--text-table-head`, 600, `--ink-muted`, доор нь 1px `--border` |
| `td` | `--text-table`, `--ink`, `font-variant-numeric: tabular-nums`, `white-space: nowrap` |
| Нүдний padding | `var(--table-row-y) var(--space-3)`; эхний/сүүлийн нүдний гадна тал `var(--space-4)` (mobile), desktop-д `var(--space-3)` |
| Сар багана | зүүн тийш, 600, `--ink-muted` |
| Бусад багана | `text-align: right`, жин normal |
| Тэгш мөр | `tbody tr:nth-child(even)` → `background: var(--surface-stripe)` |
| Сүүлийн мөр | Сар нүд `--ink`; Үлдэгдэл нүд `--accent`, 600 (дизайны `0₮`) |

**Толгой мөрийн шошго** — `САР`, `ТӨЛБӨР`, `ҮНДСЭН ТӨЛБӨР`, `ХҮҮ`, `ҮЛДЭГДЭЛ` (яг ингэж
том үсгээр бичнэ; `text-transform` ашиглахгүй — эх текст нь ингэж бичигдсэн).

**Гүйлгэлтийн сануралга** — `↔` дүрс 14px + `Хүснэгтийг хэвтээ чиглэлд гүйлгэнэ`, 12px
`--ink-muted`, `gap: 6px`. `@media (min-width: 900px)` дээр `display: none`.

## Гүйлгэлт (ХАШ 5)

`div.scroll` дээр `overflow-x: auto; min-width: 0`. Карт, `.page`, `.main` бүгдэд `min-width: 0`
байгаа эсэхийг нягтална (одоо байгаа — шинэ картад нэмнэ). `<table>`-ийн `min-width` нь зөвхөн
бүрхүүлийн дотор үйлчилнэ; `html, body { overflow-x: hidden }` аль хэдийн `app.css`-д бий, гэхдээ
шалгуур нь хуудас өөрөө гүйлгэлт үүсгэхгүй байхыг шаарддаг тул `min-width: 0` гинжийг эх кодоос
нүдээр нягтлах нь баталгаа.

## Дата өөрчлөлт

Байхгүй. Хадгалалт, API, схем байхгүй — `buildSchedule` нь оролтоос цэвэр функцээр гарах
санах ойн массив. Шинэ dependency нэмэхгүй.

## Эрсдэл

| # | Эрсдэл | Хариу арга |
|---|---|---|
| 1 | Их хугацаа (жишээ нь `9999` сар) бичихэд мянга мянган мөр DOM-д зурагдаж хөтөч удаашрана. | Spec нь хуудаслалт, эвхэлтийг хориглосон тул хязгаар тавихгүй. `{#each rows as row (row.month)}` түлхүүртэй ашиглаж дахин зурах зардлыг багасгана. Хэрэглэгчийн бодит хэрэглээнд (1–360 сар) асуудалгүй. |
| 2 | Маш өндөр хүүд `payment ≤ interest` болж `principal` сөрөг гарч үлдэгдэл өсөх. | Аннуитетийн томьёогоор `payment > balance·r` үргэлж биелнэ; зөвхөн дугуйлалтын ирмэг дээр эрсдэлтэй. Сүүлийн мөрийн засвар үлдэгдлийг ямар ч тохиолдолд тэглэдэг тул ХАШ 3, 4 хэвээр биелнэ. Тестэд `amount=1000, rate=30, n=36` мэтийн ирмэг кэйс нэмж баталгаажуулна. |
| 3 | Хуваарийн Хүүгийн нийлбэр `ResultPanel`-ийн "Нийт хүү"-гээс хэдэн ₮ зөрнө. | Spec-ээр хүлээн зөвшөөрөгдсөн. Тестэд тэнцүү байхыг **шаардахгүй**; `ResultPanel` хөндөхгүй. |
| 4 | `table-layout: fixed` + `nowrap` үед урт дүн (жишээ нь 12 оронтой) нүднээс халина. | `min-width: 610px` нь бүрхүүлийн доод хязгаар — багана өргөсөхийг хориглодоггүй. Шаардлагатай бол `colgroup`-ийн оронд `table-layout: auto` руу шилжинэ (харагдац бараг ижил). |
| 5 | Шинэ токен нэмэх нь spec-ийн таамаглалтай зөрчилдөнө. | Дээр тайлбарласнаар дизайн давамгайлна. Токенууд `ui.txt`-ийн Tokens блокоос яг тэр утгаараа `app.css`-д орно — компонентод hex бичихгүй. |

## Verify

`npm run typecheck && npm test && npm run build` гурвуулаа алдаагүй (ХАШ 9).
Харагдацыг `docs/design/screens/ui.png`-ийн Desktop 1280 ба Mobile 320 фрэймтэй тулгана.
