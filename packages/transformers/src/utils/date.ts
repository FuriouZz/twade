export function parseDate(d: Date) {
	const year = d.getFullYear();
	const month = d.getMonth() + 1;
	const day = d.getDate();
	const date = d.getDay();
	const hours = d.getHours();
	const minutes = d.getMinutes();
	const seconds = d.getSeconds();
	const milliseconds = d.getMilliseconds();
	return { year, month, day, date, hours, minutes, seconds, milliseconds };
}

export function dateFormat(date: Date, format: string) {
	const p = parseDate(date);

	const PATTERN = {
		fullyear: "YYYY",
		fullmonth: "MM",
		fullday: "DD",
		fullhours: "hh",
		fullminutes: "mm",
		fullseconds: "ss",
	};

	const regex = new RegExp(
		`(${Object.entries(PATTERN)
			.map(([, value]) => value)
			.join("|")})`,
		"g",
	);

	let result = format;

	const matches = format.matchAll(regex);
	for (const match of matches) {
		const start = result.slice(0, match.index);
		const end = result.slice(match.index + match[0].length);
		let content = "";
		switch (match[0]) {
			case "YYYY": {
				content = String(p.year);
				break;
			}
			case "MM": {
				content = String(p.month).padStart(2, "0");
				break;
			}
			case "DD": {
				content = String(p.day).padStart(2, "0");
				break;
			}
			case "hh": {
				content = String(p.hours).padStart(2, "0");
				break;
			}
			case "mm": {
				content = String(p.minutes).padStart(2, "0");
				break;
			}
			case "ss": {
				content = String(p.seconds).padStart(2, "0");
				break;
			}
		}

		result = start + content + end;
	}

	console.log(result);
	return result;
}
