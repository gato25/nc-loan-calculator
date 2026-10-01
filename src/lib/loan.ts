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
 * @param type Эргэн төлөлтийн арга — өгөгдмөл нь аннуитет
 */
export function buildSchedule(
	amount: number,
	monthlyRatePercent: number,
	termMonths: number,
	type: RepaymentType = 'annuity'
): ScheduleRow[] {
	const r = monthlyRatePercent / 100;
	// Аннуитетэд төлбөр тогтмол, үндсэн төлбөр тэнцүү аргад үндсэн хэсэг нь тогтмол.
	const fixed =
		type === 'equalPrincipal'
			? Math.round(amount / termMonths)
			: Math.round(calculateLoan(amount, monthlyRatePercent, termMonths).monthlyPayment);

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

		// `Math.min` нь жижиг дүн + урт хугацаанд үлдэгдлийг сөрөг болгохоос сэргийлнэ.
		const principal = type === 'equalPrincipal' ? Math.min(fixed, balance) : fixed - interest;
		balance -= principal;
		rows.push({ month, payment: principal + interest, principal, interest, balance });
	}

	return rows;
}

/** Төлбөрийн бүтцийн нэг сар — графикийн нэг багана. */
export type BreakdownMonth = {
	/** Сарын дугаар, 1-ээс `termMonths` хүртэл. */
	month: number;
	/** Тухайн сарын төлбөрийн үндсэн зээлд ногдох хэсэг. */
	principal: number;
	/** Тухайн сарын төлбөрийн хүүд ногдох хэсэг. */
	interest: number;
};

/** Нийт төлбөр үндсэн зээл ба хүүд хэрхэн хуваагдах бүтэц. */
export type PaymentBreakdown = {
	/** Сар бүрийн задаргаа, `termMonths` мөр. */
	months: BreakdownMonth[];
	/** Үндсэн зээлийн нийлбэр. */
	totalPrincipal: number;
	/** Хүүгийн нийлбэр. */
	totalInterest: number;
	/** Үндсэн зээл + хүү. */
	totalPayment: number;
	/** Үндсэн зээлийн нийт төлбөрт эзлэх хувь (0..100), дугуйлаагүй. */
	principalShare: number;
	/** Хүүгийн нийт төлбөрт эзлэх хувь (0..100), дугуйлаагүй. */
	interestShare: number;
};

/**
 * Графикт зориулсан төлбөрийн бүтэц. `buildSchedule`-ийн дугуйлсан мөрүүдээс
 * байгуулагддаг тул графикийн тоо доорх хуваарийн хүснэгттэй үргэлж таарна
 * (`calculateLoan`-ы дугуйлаагүй дүнгээс хэдэн төгрөгөөр зөрж болно).
 *
 * `totalPayment = 0` үед хоёр хувь хоёулаа `0`.
 *
 * @param amount Зээлийн хэмжээ (₮)
 * @param monthlyRatePercent Сарын хүү (%)
 * @param termMonths Хугацаа (сар)
 * @param type Эргэн төлөлтийн арга — өгөгдмөл нь аннуитет
 */
export function paymentBreakdown(
	amount: number,
	monthlyRatePercent: number,
	termMonths: number,
	type: RepaymentType = 'annuity'
): PaymentBreakdown {
	const rows = buildSchedule(amount, monthlyRatePercent, termMonths, type);

	const months = rows.map(({ month, principal, interest }) => ({ month, principal, interest }));
	const totalPrincipal = months.reduce((sum, row) => sum + row.principal, 0);
	const totalInterest = months.reduce((sum, row) => sum + row.interest, 0);
	const totalPayment = totalPrincipal + totalInterest;

	// Хуваагч 0 үед хувь утгагүй — хоёуланг нь 0 гэж үзнэ.
	const principalShare = totalPayment === 0 ? 0 : (totalPrincipal / totalPayment) * 100;
	const interestShare = totalPayment === 0 ? 0 : (totalInterest / totalPayment) * 100;

	return {
		months,
		totalPrincipal,
		totalInterest,
		totalPayment,
		principalShare,
		interestShare
	};
}

/**
 * Үндсэн төлбөр тэнцүү аргаар тооцвол аннуитеттэй харьцуулахад нийт хүү хэдэн
 * төгрөгөөр бага гарахыг буцаана. Үндсэн төлбөр тэнцүү арга нийт хүү нь
 * аннуитетээс хэзээ ч их байдаггүй тул үр дүн үргэлж сөрөг биш.
 *
 * @param amount Зээлийн хэмжээ (₮)
 * @param monthlyRatePercent Сарын хүү (%)
 * @param termMonths Хугацаа (сар)
 */
export function interestSavings(
	amount: number,
	monthlyRatePercent: number,
	termMonths: number
): number {
	const annuity = calculateLoan(amount, monthlyRatePercent, termMonths, 'annuity');
	const equal = calculateLoan(amount, monthlyRatePercent, termMonths, 'equalPrincipal');

	return Math.max(0, annuity.totalInterest - equal.totalInterest);
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
