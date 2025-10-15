import {
	LoadingManager,
	PMREMGenerator,
	type Texture,
	TextureLoader,
	type WebGLRenderer,
} from "three";

function cache<T>(
	loaders: WeakMap<() => Promise<unknown>, unknown>,
	cb: () => Promise<T>,
) {
	return async () => {
		if (!loaders.has(cb)) {
			loaders.set(cb, cb());
		}
		return loaders.get(cb) as T;
	};
}

export default class Loader {
	baseURL = "/";
	manager = new LoadingManager();

	#renderer: WebGLRenderer;
	#cache = new WeakMap<() => Promise<unknown>, unknown>();
	#loaders = {
		texture: cache(this.#cache, async () => {
			return new TextureLoader();
		}),

		gltf: cache(this.#cache, async () => {
			const { GLTFLoader } = await import("three/addons/loaders/GLTFLoader.js");
			const { MeshoptDecoder } = await import(
				"three/examples/jsm/libs/meshopt_decoder.module.js"
			);
			const loader = new GLTFLoader();
			loader.setMeshoptDecoder(MeshoptDecoder);
			loader.setDRACOLoader(await this.#loaders.draco());
			loader.setKTX2Loader(await this.#loaders.ktx2());
			return loader;
		}),

		fbx: cache(this.#cache, async () => {
			const { FBXLoader } = await import("three/addons/loaders/FBXLoader.js");
			return new FBXLoader();
		}),

		obj: cache(this.#cache, async () => {
			const { OBJLoader } = await import("three/addons/loaders/OBJLoader.js");
			return new OBJLoader();
		}),

		draco: cache(this.#cache, async () => {
			const { DRACOLoader } = await import(
				"three/addons/loaders/DRACOLoader.js"
			);
			return new DRACOLoader().setDecoderPath(`${this.baseURL}three/draco/`);
		}),

		ktx2: cache(this.#cache, async () => {
			const { KTX2Loader } = await import("three/addons/loaders/KTX2Loader.js");
			return new KTX2Loader()
				.setTranscoderPath(`${this.baseURL}three/basis/`)
				.detectSupport(this.#renderer);
		}),

		hdrjpg: cache(this.#cache, async () => {
			const i = await import("@monogrid/gainmap-js");
			return new i.HDRJPGLoader(this.#renderer);
		}),

		exr: cache(this.#cache, async () => {
			const { EXRLoader } = await import("three/addons/loaders/EXRLoader.js");
			return new EXRLoader();
		}),

		pmrem: cache(this.#cache, async () => {
			return new PMREMGenerator(this.#renderer);
		}),
	};

	constructor(renderer: WebGLRenderer) {
		this.#renderer = renderer;
	}

	async json<T = unknown>(url: string): Promise<T> {
		const response = await fetch(url);
		return response.json();
	}

	async texture(url: string) {
		const loader = await this.#loaders.texture();
		loader.manager = this.manager;
		return loader.loadAsync(url);
	}

	async gltf(url: string) {
		const loader = await this.#loaders.gltf();
		loader.manager = this.manager;
		return loader.loadAsync(url);
	}

	async fbx(url: string) {
		const loader = await this.#loaders.fbx();
		loader.manager = this.manager;
		return loader.loadAsync(url);
	}

	async obj(url: string) {
		const loader = await this.#loaders.obj();
		loader.manager = this.manager;
		return loader.loadAsync(url);
	}

	async ktx2(url: string) {
		const loader = await this.#loaders.ktx2();
		loader.manager = this.manager;
		return loader.loadAsync(url);
	}

	async hdrjpg(url: string, usePMREM = true) {
		const loader = await this.#loaders.hdrjpg();
		loader.manager = this.manager;
		const res = await loader.loadAsync(url);

		let texture = res.renderTarget.texture;

		if (usePMREM) {
			const tex = await this.pmrem(texture);
			texture.dispose();
			texture = tex;
		}

		return texture;
	}

	async exr(url: string, usePMREM = true) {
		const loader = await this.#loaders.exr();
		loader.manager = this.manager;
		const res = await loader.loadAsync(url);

		let texture: Texture = res;

		if (usePMREM) {
			const tex = await this.pmrem(texture);
			texture.dispose();
			texture = tex;
		}

		return texture;
	}

	async htmlImage(url: string) {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();

			let done = false;
			const onComplete = () => {
				if (done) return;
				done = true;
				img.onload = null;
				img.onerror = null;
			};

			img.onload = () => {
				onComplete();
				resolve(img);
			};

			img.onerror = (e) => {
				onComplete();
				if (e instanceof ErrorEvent) {
					reject(e.error);
				} else {
					reject(e);
				}
			};

			img.src = url;
		});
	}

	async pmrem(texture: Texture) {
		const pmrem = await this.#loaders.pmrem();
		pmrem.compileEquirectangularShader();
		const target = pmrem.fromEquirectangular(texture);
		// target.dispose();
		return target.texture;
	}

	async dispose() {
		await this.#loaders.ktx2().then((l) => l.dispose());
	}
}
