export function className(...names: (string | boolean | undefined | null)[]) {
	const ret: string[] = [];
	for (const name of names) {
		if (typeof name === "string") {
			ret.push(name);
		}
	}
	return ret.join(" ");
}
