import { describe, expect, it } from 'vitest';
import { buildSchedule, calculateLoan, isValidAmount, isValidRate, isValidTerm } from './loan';

describe('calculateLoan', () => {
	it('AC #5 — 10,000,000₮ / 2% / 12 сар', () => {
		const { monthlyPayment, totalInterest, totalPayment } = calculateLoan(10_000_000, 2, 12);

		expect(monthlyPayment).toBeCloseTo(945_595.97, 0);
		expect(Math.abs(monthlyPayment - 945_596)).toBeLessThanOrEqual(2);
		expect(Math.abs(totalInterest - 1_347_151)).toBeLessThanOrEqual(2);
		expect(totalPayment).toBeCloseTo(monthlyPayment * 12, 6);
		expect(totalPayment - 10_000_000).toBeCloseTo(totalInterest, 6);
	});

	it('AC #6 — хүү 0 үед төлбөр нь зээл ÷ хугацаа, нийт хүү 0', () => {
		const { monthlyPayment, totalInterest, totalPayment } = calculateLoan(12_000_000, 0, 24);

		expect(monthlyPayment).toBe(12_000_000 / 24);
		expect(totalInterest).toBe(0);
		expect(totalPayment).toBe(12_000_000);
	});

	it('нэг сарын хугацаанд төлбөр нь зээл + нэг сарын хүү', () => {
		const { monthlyPayment, totalInterest } = calculateLoan(1_000_000, 2, 1);

		expect(monthlyPayment).toBeCloseTo(1_020_000, 6);
		expect(totalInterest).toBeCloseTo(20_000, 6);
	});

	it('урт хугацаанд төлбөр буурч, нийт хүү өснө', () => {
		const short = calculateLoan(50_000_000, 1.5, 12);
		const long = calculateLoan(50_000_000, 1.5, 360);

		expect(long.monthlyPayment).toBeLessThan(short.monthlyPayment);
		expect(long.totalInterest).toBeGreaterThan(short.totalInterest);
		expect(Number.isFinite(long.monthlyPayment)).toBe(true);
		// Хугацаа хязгааргүй тэмүүлэхэд төлбөр нь зөвхөн хүүнд ойртоно.
		expect(long.monthlyPayment).toBeGreaterThan(50_000_000 * 0.015);
	});

	it('маш бага дүнд ч тооцоолол тогтвортой', () => {
		const { monthlyPayment, totalPayment, totalInterest } = calculateLoan(1, 2, 12);

		expect(monthlyPayment).toBeGreaterThan(0);
		expect(totalInterest).toBeGreaterThan(0);
		expect(totalPayment).toBeCloseTo(1 + totalInterest, 10);
	});

	it('нийт төлбөр нь хугацаа × сарын төлбөртэй үргэлж тэнцүү', () => {
		for (const term of [1, 6, 12, 60, 120]) {
			const { monthlyPayment, totalPayment } = calculateLoan(7_500_000, 1.8, term);
			expect(totalPayment).toBeCloseTo(monthlyPayment * term, 6);
		}
	});
});

describe('buildSchedule', () => {
	const sum = (rows: { principal: number }[]) => rows.reduce((acc, row) => acc + row.principal, 0);

	it('ХАШ 1 — мөрийн тоо хугацаатай тэнцүү, сар нь 1-ээс n хүртэл', () => {
		const rows = buildSchedule(10_000_000, 2, 12);

		expect(rows).toHaveLength(12);
		expect(rows.map((row) => row.month)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
	});

	it('ХАШ 3 — сүүлийн мөрийн үлдэгдэл яг 0', () => {
		for (const term of [1, 6, 12, 60, 360]) {
			const rows = buildSchedule(10_000_000, 2, term);
			expect(rows[rows.length - 1].balance).toBe(0);
		}
	});

	it('ХАШ 4 — үндсэн төлбөрийн нийлбэр зээлийн хэмжээтэй яг тэнцүү', () => {
		for (const term of [1, 6, 12, 60, 360]) {
			expect(sum(buildSchedule(10_000_000, 2, term))).toBe(10_000_000);
		}
	});

	it('ХАШ 6 — хүү 0 үед бүх мөрийн хүү 0, үндсэн төлбөр нь төлбөртэй тэнцүү', () => {
		const rows = buildSchedule(12_000_000, 0, 24);

		for (const row of rows) {
			expect(row.interest).toBe(0);
			expect(row.principal).toBe(row.payment);
		}
		expect(sum(rows)).toBe(12_000_000);
		expect(rows[rows.length - 1].balance).toBe(0);
	});

	it('n = 1 үед ганц мөр бүх зээлийг хаана', () => {
		const rows = buildSchedule(1_000_000, 2, 1);

		expect(rows).toHaveLength(1);
		expect(rows[0]).toEqual({
			month: 1,
			payment: 1_020_000,
			principal: 1_000_000,
			interest: 20_000,
			balance: 0
		});
	});

	it('дугуйлалтын ирмэг кэйс (1,000₮ / 30% / 36 сар) дээр ч тэглэлт биелнэ', () => {
		const rows = buildSchedule(1000, 30, 36);

		expect(rows).toHaveLength(36);
		expect(rows[rows.length - 1].balance).toBe(0);
		expect(sum(rows)).toBe(1000);
	});

	it('үлдэгдэл мөр бүрт үндсэн төлбөрийн хэмжээгээр буурна', () => {
		const rows = buildSchedule(10_000_000, 2, 12);

		let balance = 10_000_000;
		for (const row of rows) {
			balance -= row.principal;
			expect(row.balance).toBe(balance);
			expect(row.payment).toBe(row.principal + row.interest);
		}
	});

	it('эхний мөрийн хүү нь зээлийн хэмжээ × сарын хүүтэй тэнцүү', () => {
		const rows = buildSchedule(10_000_000, 2, 12);

		expect(rows[0].interest).toBe(200_000);
		expect(rows[0].payment).toBe(945_596);
		expect(rows[0].principal).toBe(745_596);
		expect(rows[0].balance).toBe(9_254_404);
	});
});

describe('оролтын шалгалт', () => {
	it('isValidAmount — зөвхөн 0-оос их бодит тоо', () => {
		expect(isValidAmount(10_000_000)).toBe(true);
		expect(isValidAmount(0.5)).toBe(true);
		expect(isValidAmount(0)).toBe(false);
		expect(isValidAmount(-1)).toBe(false);
		expect(isValidAmount(null)).toBe(false);
		expect(isValidAmount(Number.NaN)).toBe(false);
		expect(isValidAmount(Number.POSITIVE_INFINITY)).toBe(false);
	});

	it('isValidRate — 0 зөвшөөрөгдөнө, сөрөг үгүй', () => {
		expect(isValidRate(0)).toBe(true);
		expect(isValidRate(2.5)).toBe(true);
		expect(isValidRate(-0.1)).toBe(false);
		expect(isValidRate(null)).toBe(false);
		expect(isValidRate(Number.NaN)).toBe(false);
	});

	it('isValidTerm — зөвхөн 1-ээс багагүй бүхэл тоо', () => {
		expect(isValidTerm(1)).toBe(true);
		expect(isValidTerm(360)).toBe(true);
		expect(isValidTerm(0)).toBe(false);
		expect(isValidTerm(12.5)).toBe(false);
		expect(isValidTerm(null)).toBe(false);
		expect(isValidTerm(Number.NaN)).toBe(false);
	});
});
