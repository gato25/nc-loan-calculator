# Ticket #3 — Input validation with Mongolian error messages

## Goal

Stop the calculator from showing numbers computed from nonsense. When a value in
Зээлийн хэмжээ, Сарын хүү or Хугацаа falls outside its allowed range or is not a
number, the customer sees a short Mongolian message under that field and the
results area holds back instead of displaying a payment.

## In scope

- A validation function per input, living next to the calculation logic in
  `src/lib/loan.ts` (or a sibling `src/lib/validation.ts`), pure and unit-tested.
- Ranges enforced: amount 100,000 – 500,000,000 ₮; monthly rate 0.1 – 10.0 %;
  term 1 – 120 months, integer.
- Non-numeric, empty and out-of-range values all treated as invalid, each with
  its own Mongolian message string.
- Error text rendered under the offending field; the field is marked invalid for
  assistive technology.
- Results (Сарын төлбөр, Нийт хүү, Нийт төлөх дүн, and the schedule if present)
  are suppressed while any field is invalid, and return as soon as every field is
  valid again — still with no calculate button.
- Vitest coverage of each boundary: just below min, at min, at max, just above
  max, non-numeric, empty.

## Out of scope

- Any change to the annuity or equal-principal maths, rounding, or the schedule
  table itself.
- The equal-principal toggle (ticket #4) and final-balance rounding (ticket #5).
- Backend validation, form submission, applying for a loan, fees, insurance.
- Redesigning the form layout; only the error slot under each field is added.

## Acceptance criteria (restated)

1. Entering an amount below 100,000 or above 500,000,000 shows a Mongolian error
   under Зээлийн хэмжээ and no results are displayed.
2. Entering a monthly rate below 0.1 or above 10.0 shows a Mongolian error under
   Сарын хүү and no results are displayed.
3. Entering a term below 1, above 120, or non-integer shows a Mongolian error
   under Хугацаа and no results are displayed.
4. A blank or non-numeric field behaves as invalid, not as zero.
5. With every field inside its range, no errors are shown and results appear
   immediately as the user types.
6. Two invalid fields show two errors at once — validation is per field, not
   first-error-only.
7. `npm test` passes, including boundary tests for each rule; `npm run typecheck`
   passes.

## Assumptions (decided, not open)

- **Repository state.** The tree currently holds only a README; tickets #1 and #2
  are not merged here. This spec is written for the form fields as the brief
  defines them. If the form and `src/lib/loan.ts` are still absent when the work
  runs, the implementer adds the minimum Vite + React + TypeScript scaffold and
  the three inputs needed for validation to be observable — not the amortization
  table and not the repayment-type toggle.
- **Rate 0 %.** The brief's `P = L / n` rate-zero branch stays in the maths, but
  0 % is outside the input range 0.1 – 10.0, so the UI rejects it.
- **Boundaries are inclusive.** 100,000 and 500,000,000 are valid; 0.1 and 10.0
  are valid; 1 and 120 are valid.
- **Message wording.** Short Mongolian sentences naming the range, e.g.
  "Зээлийн хэмжээ 100,000 – 500,000,000₮ хооронд байх ёстой." The implementer may
  refine the phrasing; the range must appear in the text so the customer knows
  what to type instead.
- **When errors appear.** On every keystroke, matching the live-recalculation
  behaviour, rather than on blur.
- **Thousands separators typed by the user** (`10,000,000`) are accepted and
  stripped before parsing; other non-digit characters are invalid.

```factory
has_ui: true
rationale: The customer sees new Mongolian error text under the fields and watches the results disappear while an input is out of range, so the error and invalid-field states need a design pass.
```
