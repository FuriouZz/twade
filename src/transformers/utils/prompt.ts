export interface PromptOptions {
	empty?: boolean;
	defaultAnswer?: string;
}

export function prompt(
	message: string,
	userOptions?: PromptOptions,
): Promise<string> {
	const options: PromptOptions = {
		empty: false,
		...userOptions,
	};

	if ("defaultAnswer" in options) {
		message = `${message} (default: ${options.defaultAnswer})`;
		options.empty = true;
	}

	message += " ";

	return new Promise<string>((resolve) => {
		process.stdin.resume();
		process.stdin.setEncoding("utf-8");

		process.stdout.write(message);

		function onData(data: Buffer) {
			let str = data.toString().trim();

			if (str.length === 0) {
				if (options.empty) {
					str = options.defaultAnswer ?? "";
				} else {
					process.stdout.write(`Cannot be empty\n`);
					process.stdout.write(message);
					return;
				}
			}

			process.stdin.removeListener("data", onData);
			resolve(str);
			process.stdin.pause();
		}

		process.stdin.on("data", onData);
	});
}

export async function ask(
	message: string,
	userOptions?: PromptOptions,
): Promise<boolean> {
	const options: PromptOptions = {
		defaultAnswer: "y",
		empty: false,
		...userOptions,
	};

	const answer = (
		await singleChoice(message, ["y", "n"], options)
	).toLowerCase();
	return answer === "y";
}

export async function singleChoice(
	message: string,
	answers: string[],
	options?: PromptOptions,
): Promise<string> {
	const msg = `${message} [${answers.join("/")}]`;

	let answer = "";
	do {
		answer = await prompt(msg, options);
	} while (answers.indexOf(answer) === -1);
	return answer;
}

export async function choices(
	message: string,
	answers: string[],
	options?: PromptOptions,
): Promise<string[]> {
	const choices = answers
		.map((value, index) => `${index + 1}) ${value}`)
		.join("\n");

	const msg = `${message}\n${choices}`;

	const answer = await prompt(msg, options);
	return answer.split(" ").map((number) => {
		const index = Number(number.trim()) - 1;
		return answers[index];
	});
}
