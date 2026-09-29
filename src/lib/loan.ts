/**
 * Зээлийн тэнцүү төлбөрт (аннуитет) тооцоолол.
 *
 * Энэ файл UI-аас бүрэн хамааралгүй: Svelte, DOM, форматлалт, монгол хэлний
 * текст энд байхгүй. Зөвхөн дугуйлаагүй тоо буцаана — дугуйлалт харуулах үед
 * (`format.ts`) хийгдэнэ.
 */

export type LoanResult = {
	/** Сар бүр төлөх тэнцүү төлбөр. */
	monthlyPayment: number;
	/** Хугацааны туршид төлөх нийт хүү. */
	totalInterest: number;
	/** Үндсэн зээл + нийт хүү. */
	totalPayment: number;
};

/**
 * Аннуитетийн томьёо: `P = L·r / (1 − (1+r)^−n)`, `r = сарын хүү / 100`.
 * `r = 0` үед `P = L / n`.
 *
 * @param amount Зээлийн хэмжээ (₮)
 * @param monthlyRatePercent Сарын хүү (%)
 * @param termMonths Хугацаа (сар)
 */
export function calculateLoan(
	amount: number,
	monthlyRatePercent: number,
	termMonths: number
): LoanResult {
	const r = monthlyRatePercent / 100;
	const monthlyPayment =
		r === 0 ? amount / termMonths : (amount * r) / (1 - Math.pow(1 + r, -termMonths));
	const totalPayment = monthlyPayment * termMonths;
	const totalInterest = totalPayment - amount;

	return { monthlyPayment, totalInterest, totalPayment };
}

/** Зээлийн хэмжээ 0-оос их бодит тоо байх ёстой. */
export function isValidAmount(value: number | null): value is number {
	return value !== null && Number.isFinite(value) && value > 0;
}

/** Сарын хүү 0 буюу түүнээс их бодит тоо байх ёстой. */
export function isValidRate(value: number | null): value is number {
	return value !== null && Number.isFinite(value) && value >= 0;
}

/** Хугацаа 1-ээс багагүй бүхэл тоо байх ёстой. */
export function isValidTerm(value: number | null): value is number {
	return value !== null && Number.isInteger(value) && value >= 1;
}
