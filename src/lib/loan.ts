/**
 * Зээлийн эргэн төлөлтийн тооцоолол — тэнцүү төлбөрт (аннуитет) ба үндсэн
 * төлбөр тэнцүү хоёр арга.
 *
 * Энэ файл UI-аас бүрэн хамааралгүй: Svelte, DOM, форматлалт, монгол хэлний
 * текст энд байхгүй. Зөвхөн дугуйлаагүй тоо буцаана — дугуйлалт харуулах үед
 * (`format.ts`) хийгдэнэ.
 */

/**
 * Эргэн төлөлтийн арга.
 * - `annuity` — сар бүр ижил дүн төлнө.
 * - `equalPrincipal` — үндсэн төлбөр сар бүр ижил, хүү үлдэгдлээс бодогдоно.
 */
export type RepaymentType = 'annuity' | 'equalPrincipal';

export type LoanResult = {
	/**
	 * Сар бүр төлөх тэнцүү төлбөр. `equalPrincipal` үед ганц "сарын төлбөр"
	 * гэж байхгүй тул `firstPayment`-тэй тэнцүү утга буцаана.
	 */
	monthlyPayment: number;
	/** Хугацааны туршид төлөх нийт хүү. */
	totalInterest: number;
	/** Үндсэн зээл + нийт хүү. */
	totalPayment: number;
	/** Эхний сарын төлбөр. Аннуитет үед `monthlyPayment`-тэй тэнцүү. */
	firstPayment: number;
	/** Сүүлийн сарын төлбөр. Аннуитет үед `monthlyPayment`-тэй тэнцүү. */
	lastPayment: number;
};

/**
 * Аннуитет: `P = L·r / (1 − (1+r)^−n)`, `r = сарын хүү / 100`. `r = 0` үед `P = L / n`.
 *
 * Үндсэн төлбөр тэнцүү: үндсэн зээл сар бүр `L/n`, хүү нь буурч буй үлдэгдлээс
 * бодогдоно. Тиймээс `эхний төлбөр = L/n + L·r`, `сүүлийн төлбөр = L/n · (1+r)`,
 * нийт хүү нь `r·L·(n+1)/2`.
 *
 * @param amount Зээлийн хэмжээ (₮)
 * @param monthlyRatePercent Сарын хүү (%)
 * @param termMonths Хугацаа (сар)
 * @param type Эргэн төлөлтийн арга — өгөгдмөл нь аннуитет
 */
export function calculateLoan(
	amount: number,
	monthlyRatePercent: number,
	termMonths: number,
	type: RepaymentType = 'annuity'
): LoanResult {
	const r = monthlyRatePercent / 100;

	if (type === 'equalPrincipal') {
		const basePrincipal = amount / termMonths;
		const firstPayment = basePrincipal + amount * r;
		const lastPayment = basePrincipal * (1 + r);
		const totalInterest = (r * amount * (termMonths + 1)) / 2;
		const totalPayment = amount + totalInterest;

		return {
			monthlyPayment: firstPayment,
			totalInterest,
			totalPayment,
			firstPayment,
			lastPayment
		};
	}

	const monthlyPayment =
		r === 0 ? amount / termMonths : (amount * r) / (1 - Math.pow(1 + r, -termMonths));
	const totalPayment = monthlyPayment * termMonths;
	const totalInterest = totalPayment - amount;

	return {
		monthlyPayment,
		totalInterest,
		totalPayment,
		firstPayment: monthlyPayment,
		lastPayment: monthlyPayment
	};
}

/** Эргэн төлөлтийн хуваарийн нэг мөр — бүх дүн бүхэл төгрөгөөр дугуйлагдсан. */
export type ScheduleRow = {
	/** Сарын дугаар, 1-ээс `termMonths` хүртэл. */
	month: number;
	/** Тухайн сард төлөх нийт дүн. */
	payment: number;
	/** Төлбөрөөс үндсэн зээлийг бууруулах хэсэг. */
	principal: number;
	/** Төлбөрөөс хүүнд ногдох хэсэг. */
	interest: number;
	/** Төлбөрийн дараах үлдэгдэл зээл. */
	balance: number;
};

/**
 * Сар бүрийн задаргааг байгуулна. `calculateLoan`-оос ялгаатай нь дугуйлалт энд
 * хийгдэнэ — харагдаж буй тоонууд дээр үлдэгдэл яг тэглэж, үндсэн төлбөрийн
 * нийлбэр зээлийн хэмжээтэй яг тэнцэх ёстой.
 *
 * Сүүлийн мөр үлдсэн үндсэн зээлийг бүрэн хааж, түүнд тохируулан төлбөрөө засна.
 * Тиймээс сүүлийн төлбөр бусад мөрөөс хэдэн төгрөгөөр зөрж болно.
 *
 * @param amount Зээлийн хэмжээ (₮)
 * @param monthlyRatePercent Сарын хүү (%)
 * @param termMonths Хугацаа (сар)
 */
export function buildSchedule(
	amount: number,
	monthlyRatePercent: number,
	termMonths: number
): ScheduleRow[] {
	const r = monthlyRatePercent / 100;
	const payment = Math.round(calculateLoan(amount, monthlyRatePercent, termMonths).monthlyPayment);

	const rows: ScheduleRow[] = [];
	let balance = amount;

	for (let month = 1; month <= termMonths; month++) {
		const interest = Math.round(balance * r);

		if (month === termMonths) {
			// Сүүлийн мөр: үлдсэн үндсэн зээлийг бүрэн хааж, үлдэгдлийг тэглэнэ.
			const principal = balance;
			rows.push({ month, payment: principal + interest, principal, interest, balance: 0 });
			break;
		}

		const principal = payment - interest;
		balance -= principal;
		rows.push({ month, payment, principal, interest, balance });
	}

	return rows;
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
