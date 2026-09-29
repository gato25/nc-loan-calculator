import { describe, expect, it } from 'vitest';
import {
	countSignificantChars,
	formatGrouped,
	formatGroupedInput,
	formatTugrik,
	parseNumberInput
} from './format';

describe('formatTugrik', () => {
	it('AC #4 — бүхэл төгрөг, мянгатын таслал, ₮ дагавар', () => {
		expect(formatTugrik(1_250_000)).toBe('1,250,000₮');
		expect(formatTugrik(11_347_151.59)).toBe('11,347,152₮');
		expect(formatTugrik(0)).toBe('0₮');
		expect(formatTugrik(999)).toBe('999₮');
	});

	it('таслалаас хойших оронг дугуйлна', () => {
		expect(formatTugrik(945_595.97)).toBe('945,596₮');
		expect(formatTugrik(945_595.4)).toBe('945,595₮');
	});

	it('тоо биш утганд зураас буцаана', () => {
		expect(formatTugrik(Number.NaN)).toBe('—');
		expect(formatTugrik(Number.POSITIVE_INFINITY)).toBe('—');
	});
});

describe('formatGrouped', () => {
	it('бүхэл тоог бүлэглэнэ', () => {
		expect(formatGrouped(10_000_000)).toBe('10,000,000');
		expect(formatGrouped(12)).toBe('12');
	});
});

describe('parseNumberInput', () => {
	it('таслал, зайг үл тоон тоо болгоно', () => {
		expect(parseNumberInput('10,000,000')).toBe(10_000_000);
		expect(parseNumberInput('2.5')).toBe(2.5);
		expect(parseNumberInput(' 12 ')).toBe(12);
		expect(parseNumberInput('0')).toBe(0);
	});

	it('хоосон болон буруу мөрд null', () => {
		expect(parseNumberInput('')).toBeNull();
		expect(parseNumberInput('.')).toBeNull();
		expect(parseNumberInput('abc')).toBeNull();
		expect(parseNumberInput('1.2.3')).toBeNull();
	});
});

describe('formatGroupedInput', () => {
	it('бичих явцад бүхэл хэсгийг бүлэглэнэ', () => {
		expect(formatGroupedInput('10000000')).toBe('10,000,000');
		expect(formatGroupedInput('10,000,000')).toBe('10,000,000');
		expect(formatGroupedInput('1234.5')).toBe('1,234.5');
		expect(formatGroupedInput('')).toBe('');
		expect(formatGroupedInput('2.')).toBe('2.');
	});
});

describe('countSignificantChars', () => {
	it('зөвхөн цифр болон цэгийг тоолно', () => {
		expect(countSignificantChars('10,000,000')).toBe(8);
		expect(countSignificantChars('1,2')).toBe(2);
		expect(countSignificantChars('2.5')).toBe(3);
	});
});
