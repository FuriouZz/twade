export class Component {
	element: Element | DocumentFragment;
	events: ((enabled: boolean) => void)[] = [];
	children: Component[] = [];

	constructor(element: Element | DocumentFragment) {
		this.element = element;
	}

	mount(parent: Component | Node) {
		if (parent instanceof Component) {
			parent.element.appendChild(this.element);
			parent.children.push(this);
		} else {
			parent.appendChild(this.element);
		}

		for (const event of this.events) event(true);

		if (this.element instanceof Element) {
			this.element.dispatchEvent(new CustomEvent("mounted"));
		}
	}

	unmount() {
		const parent = this.element.parentElement;

		if (this.children.length > 0) {
			console.warn("TODO: Unmount children");
		}

		for (const event of this.events) event(false);

		if (this.element instanceof DocumentFragment) {
			console.warn("TODO: Remove elements from document fragment");
		} else {
			parent?.removeChild(this.element);
			this.element.dispatchEvent(new CustomEvent("unmounted"));
		}
	}
}
