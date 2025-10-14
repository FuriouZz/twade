import "./style.css";
import { WebGLComponent } from "./components/WebGLComponent.tsx";

const app = document.querySelector("#app");

if (app) {
	WebGLComponent().then((c) => c.mount(app));
}
