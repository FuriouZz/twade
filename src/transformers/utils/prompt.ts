export interface PromptOptions {
	empty?: boolean;
	defaultAnswer?: string;
}

export function prompt(
	message: string,
	userOptions?: PromptOptions,
): Promise<string> {
	const options: Required<PromptOptions> = {
		empty: false,
		defaultAnswer: "",
		...userOptions,
	};

	if ("defaultAnswer" in options) {
		message = `${message} (Default: ${options.defaultAnswer})`;
		options.empty = true;
	}

	return new Promise<string>((resolve) => {
		process.stdin.resume();
		process.stdin.setEncoding("utf-8");

		process.stdout.write(message);

		function onData(data: Buffer) {
			let str = data.toString().trim();

			if (str.length === 0) {
				if (options.empty) {
					str = options.defaultAnswer;
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
	options?: PromptOptions,
): Promise<boolean> {
	options = typeof options === "object" ? options : {};

	options.defaultAnswer = "y";
	options.empty = true;

	const answer = await choices(message, ["y", "yes", "n", "no"], options);
	return !!answer.match(/^(y|yes)$/i);
}

export async function choices(
	message: string,
	answers: string[],
	options?: PromptOptions,
): Promise<string> {
	message = `${message} [${answers.join("|")}] `;

	const answer = await prompt(message, options);
	if (answers.indexOf(answer) === -1) {
		process.stdout.write(`"${answer}" is an invalid answer\n`);
		return prompt(message, options);
	}
	return answer;
}
