/**
 * Харуулах форматлалт. `loan.ts` зөвхөн тоо буцаадаг тул дугуйлалт болон
 * мянгатын тусгаарлагч энд нэмэгдэнэ.
 *
 * Node дээрх `mn-MN` локалийн зөрүүг гаргахгүйн тулд `en-US` бүлэглэлт ашиглаж,
 * `₮` тэмдэгтийг гараар залгана.
 */

const groupedInteger = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

/** Бүхэл тоог мянгатын таслалтай болгоно: `1250000` → `1,250,000`. */
export function formatGrouped(value: number): string {
	if (!Number.isFinite(value)) return '';
	return groupedInteger.format(Math.round(value));
}

/** Дүнг бүхэл төгрөгөөр дугуйлж, `₮` дагавартай болгоно: `945595.97` → `945,596₮`. */
export function formatTugrik(value: number): string {
	if (!Number.isFinite(value)) return '—';
	return `${formatGrouped(value)}₮`;
}

/**
 * Хэрэглэгчийн бичсэн мөрийг тоо болгоно. Мянгатын таслал, зай хэрэгсэхгүй.
 * Хоосон эсвэл тоо болохгүй мөрд `null` буцаана — тооцоолол хийхгүй гэсэн үг.
 */
export function parseNumberInput(raw: string): number | null {
	const cleaned = raw.replace(/[\s,]/g, '');
	if (cleaned === '' || cleaned === '.') return null;
	if (!/^\d*\.?\d*$/.test(cleaned)) return null;
	const value = Number(cleaned);
	return Number.isFinite(value) ? value : null;
}

/** Бичих явцад бүхэл хэсгийг бүлэглэнэ: `10000000` → `10,000,000`, `1234.5` → `1,234.5`. */
export function formatGroupedInput(raw: string): string {
	const digitsOnly = raw.replace(/[^\d.]/g, '');
	const [whole = '', ...rest] = digitsOnly.split('.');
	// Урт мөрөнд Number() нарийвчлалаа алддаг тул бүлэглэлтийг мөр дээр нь хийнэ.
	const groupedWhole = whole.replace(/^0+(?=\d)/, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	// Хэрэглэгч цэг бичиж эхэлсэн бол түүнийг нь хэвээр үлдээнэ.
	return rest.length > 0 ? `${groupedWhole}.${rest.join('')}` : groupedWhole;
}

/** Мөр доторх цифр/цэгийн тоо — caret-ийн байрлалыг сэргээхэд хэрэглэнэ. */
export function countSignificantChars(raw: string): number {
	return raw.replace(/[^\d.]/g, '').length;
}
