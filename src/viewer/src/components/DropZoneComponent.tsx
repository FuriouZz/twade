import { createAtom } from "@furiouzz/reactive/atom";
import type { JSX } from "@/lib/jsx/jsx-runtime";
import css from "./DropZoneComponent.module.css";

export interface DropZoneComponentProps {
	extensions: string[];
	onfiledropped?: (e: CustomEvent<File[]>) => void;
}

export function DropZoneComponent({
	extensions,
	onfiledropped,
}: DropZoneComponentProps & JSX.Props) {
	const root = createAtom<Element | null>(null);

	const onDragOver = () => {
		root()?.classList.add(css.DragOver);
	};

	const onDrop = (event: Event) => {
		root()?.classList.remove(css.DragOver);

		const e = event as DragEvent;
		if (!e.dataTransfer?.files) return;

		const files: File[] = [];
		for (const file of e.dataTransfer.files) {
			const extension = extensions.find((ext) => file.name.endsWith(ext));
			if (!extension) {
				alert(`Invalid file. Accepted files: ${extensions.join(", ")}`);
				return;
			}
			files.push(file);
		}

		onfiledropped?.(new CustomEvent("filedropped", { detail: files }));
	};

	const onPrevent = (e: Event) => e.preventDefault();

	const onMounted = () => {
		globalThis.addEventListener("dragover", onPrevent);
		globalThis.addEventListener("drop", onPrevent);
	};

	const onUnmounted = () => {
		globalThis.removeEventListener("dragover", onPrevent);
		globalThis.removeEventListener("drop", onPrevent);
	};

	return (
		<div
			ref={(el) => root(el as Element)}
			onmounted={onMounted}
			onunmounted={onUnmounted}
			ondragover={onDragOver}
			ondrop={onDrop}
			class={css.Root}
		>
			<div class={css.Content}>
				<span>
					Place{" "}
					{extensions.map((ext, i) => {
						if (i === 0) {
							return <strong key={String(i)}>.{ext}</strong>;
						}

						if (i === extensions.length - 1) {
							return (
								<>
									{" "}
									and <strong key={String(i)}> .{ext}</strong>
								</>
							);
						}
						return <strong key={String(i)}>, .{ext}</strong>;
					})}{" "}
					file
				</span>
			</div>
		</div>
	);
}
