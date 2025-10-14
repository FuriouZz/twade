# trois-d-tools

A bunch of tools for working in 3D on the web.

You will find:
- `packages/transformer` which optimize glb files and convert .exr, .hdr files into gainmap.
- `packages/viewer` to display glb files and environment map

These packages depends on:
  - [three.js](https://threejs.org/) (viewer)
  - [@monogrid/gainmap-js](https://gainmap-creator.monogrid.com/) (viewer)
  - [gltf-transform](https://gltf-transform.dev/) (transformer)
  - [toktx](https://github.khronos.org/KTX-Software/ktxtools/toktx.html) (transformer)

To use this project, you need `pnpm`, `node` and `biome` (please refers to `mise.toml`)

## How to transform your assets

You need to create `assets.config.ts` or edit one provided in this repository, then run:

```sh
pnpm run transform
```

## How to launch the viewer

```sh
pnpm run viewer
```
