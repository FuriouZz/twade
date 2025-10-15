import { Component } from "../Component";

export interface RawContentNode {
	htmlContent: string;
}

export interface JSXChildren {
	children?: JSXNode | JSXNode[] | undefined;
}

export type JSXNode =
	| Component
	| RawContentNode
	| (() => JSXNode)
	| JSXNode[]
	| boolean
	| number
	| bigint
	| string
	| null
	| undefined;

export type FunctionComponent = (props: JSXProps) => Component;

export function renderChildren(
	node: Component,
	children: JSXChildren["children"],
) {
	if (!children) return;
	const entries = Array.isArray(children) ? children : [children];
	for (const entry of entries) {
		if (typeof entry === "string") {
			node.element.appendChild(document.createTextNode(entry));
		} else if (entry instanceof Node) {
			node.element.appendChild(entry);
		} else if (entry instanceof Component) {
			entry.mount(node);
		} else if (Array.isArray(entry)) {
			renderChildren(node, entry);
		}
	}
}

export function renderAttributes(
	node: Component,
	name: string,
	value: unknown,
) {
	if (name.startsWith("on")) {
		const [, event] = name.split("on");
		const cb = value as () => unknown;
		if (node.element instanceof HTMLElement) {
			node.events.push((enabled) => {
				if (enabled) {
					node.element.addEventListener(event, cb);
				} else {
					node.element.removeEventListener(event, cb);
				}
			});
		}
	} else if (name === "ref") {
		const cb = value as (element: Element | DocumentFragment | null) => unknown;
		cb(node.element);
	} else if (name === "children") {
		renderChildren(node, value as JSXChildren["children"]);
	} else if (value === true) {
		if (node.element instanceof Element) {
			node.element.setAttribute(name, "");
		}
	} else {
		if (node.element instanceof Element && value !== undefined) {
			node.element.setAttribute(name, String(value));
		}
	}
}

export function renderFragment(props: JSX.Props, _key?: string) {
	const element = new Component(document.createDocumentFragment());
	renderChildren(element, props.children);
	return element;
}

export function renderJSX(
	tag: string | FunctionComponent | undefined,
	props: JSX.Props,
	_key?: string,
): JSX.Element {
	if (typeof tag === "string") {
		const element = new Component(document.createElement(tag));
		for (const [name, value] of Object.entries(props)) {
			renderAttributes(element, name, value);
		}
		return element;
	}

	if (typeof tag === "function") {
		return tag(props);
	}

	return renderFragment(props);
}

type JSXProps = (
	| {
			[k in string]: unknown;
	  }
	| {
			ref?: (element: Element | DocumentFragment | null) => void;
	  }
) &
	JSXChildren;

export const jsx = renderJSX;
export const jsxs = renderJSX;
export const jsxDEV = renderJSX;
export const h = renderJSX;
export const Fragment = renderFragment;

export namespace JSX {
	export type Props = JSXProps;
	export type IntrinsicElements = Record<string, JSXProps>;
	export type Element = Component;
}
