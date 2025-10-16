import { createEffect } from "@furiouzz/reactive";
import { createAtom } from "@furiouzz/reactive/atom";
import {
	AgXToneMapping,
	type Camera,
	Mesh,
	MeshStandardMaterial,
	PerspectiveCamera,
	PointLight,
	Scene,
	SRGBColorSpace,
	type Texture,
	WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";

import { usePixelRatio } from "@/composables/usePixelRatio";
import { useResize } from "@/composables/useWindowResize";
import Loader from "@/lib/gl/Loader";
import DefaultEnv from "../assets/env.exr?url";
import { DropZoneComponent } from "./DropZoneComponent";
import css from "./WebGLComponent.module.css";

export async function WebGLComponent() {
	const root = createAtom<Element | null>(null);
	const camera = createAtom<Camera | null>(null);
	const scene = createAtom<Scene | null>(null);
	const orbit = createAtom<OrbitControls | null>(null);
	const envMap = createAtom<Texture | null>(null);

	const metrics = useResize();
	const pixelRatio = usePixelRatio();

	const renderer = new WebGLRenderer({
		antialias: true,
	});
	renderer.outputColorSpace = SRGBColorSpace;
	renderer.toneMapping = AgXToneMapping;

	const loader = new Loader(renderer);

	renderer.setAnimationLoop(() => {
		const _orbit = orbit();
		_orbit?.update();

		const _camera = camera();
		const _scene = scene();
		if (_scene && _camera) {
			renderer.render(_scene, _camera);
		}
	});

	function onMounted() {
		const element = root();
		if (element) element.appendChild(renderer.domElement);
		root()?.classList.add(css.DragOver);
	}

	const GLB_EXT = /\.gl(b|tf)$/;
	const ENV_EXT = /\.(jpeg|jpg|exr|hdr)/;
	const TEXTURES = /^albedo|occlusion|roughness|metalness|normal/i;
	async function loadFile(file: File, url: string) {
		if (GLB_EXT.test(file.name)) {
			const glb = await loader.gltf(url);
			scene(null);
			camera(null);

			const _scene = new Scene();
			_scene.add(glb.scene);

			glb.scene.traverse((object) => {
				if (object instanceof Mesh) {
				} else if (object instanceof PointLight) {
					object.intensity /= 1000;
				}
			});

			const _camera = glb.cameras[0];
			let _orbit = orbit();
			_orbit?.dispose();
			_orbit = new OrbitControls(_camera, root() as HTMLElement);

			orbit(_orbit);
			scene(_scene);
			camera(_camera);
		} else if (TEXTURES.test(file.name)) {
			const match = file.name.match(TEXTURES);
			if (!match) return;
			const type = match[0].toLowerCase();
			const texture = await loader.texture(url);
			scene()?.traverse((object) => {
				if (
					object instanceof Mesh &&
					object.material instanceof MeshStandardMaterial
				) {
					if (type === "albedo") {
						object.material.map = texture;
					} else if (type === "normal") {
						object.material.normalMap = texture;
					} else if (type === "roughness") {
						object.material.roughnessMap = texture;
					} else if (type === "metalness") {
						object.material.metalnessMap = texture;
					}
				}
			});
		} else if (ENV_EXT.test(file.name)) {
			if (file.name.endsWith(".exr")) {
				envMap(await loader.exr(url));
			} else {
				envMap(await loader.hdrjpg(url));
			}
		}
	}

	async function onFileDropped(e: CustomEvent<File[]>) {
		root()?.classList.remove(css.DragOver);
		for (const file of e.detail.sort((a, b) => {
			const aa = ENV_EXT.test(a.name) ? 1 : 0;
			const bb = ENV_EXT.test(b.name) ? 1 : 0;
			return aa - bb;
		})) {
			const url = URL.createObjectURL(file);
			await loadFile(file, url).finally(() => {
				URL.revokeObjectURL(url);
			});
		}

		if (!envMap()) {
			const DefaultMap = await loader.exr(DefaultEnv);
			envMap(DefaultMap);
		}
	}

	function onDragOver() {
		root()?.classList.add(css.DragOver);
	}

	createEffect(() => {
		const _camera = camera();
		renderer.setSize(metrics.width, metrics.height);
		renderer.setPixelRatio(pixelRatio());
		if (_camera instanceof PerspectiveCamera) {
			_camera.aspect = metrics.width / metrics.height;
			_camera.updateProjectionMatrix();
		}
	});

	createEffect(() => {
		const _scene = scene();
		const _envMap = envMap();
		if (!_scene) return;
		_scene.environment = _envMap;
		_scene.background = _envMap;
	});

	return (
		<div
			ref={root}
			class={css.Root}
			onmounted={onMounted}
			ondragover={onDragOver}
		>
			<div class={css.DropZone}>
				<DropZoneComponent
					extensions={["glb", "gltf", "hdr", "exr", "jpg"]}
					onfiledropped={onFileDropped}
				/>
			</div>
		</div>
	);
}
