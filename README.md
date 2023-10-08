# threejs-interactive-object

> Mouse interactive objects for three.js

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![CI](https://github.com/MasatoMakino/threejs-interactive-object/actions/workflows/ci.yml/badge.svg)](https://github.com/MasatoMakino/threejs-interactive-object/actions/workflows/ci.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/2c756ac812782947b080/maintainability)](https://codeclimate.com/github/MasatoMakino/threejs-interactive-object/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/2c756ac812782947b080/test_coverage)](https://codeclimate.com/github/MasatoMakino/threejs-interactive-object/test_coverage)

[![ReadMe Card](https://github-readme-stats.vercel.app/api/pin/?username=MasatoMakino&repo=threejs-interactive-object)](https://github.com/MasatoMakino/threejs-interactive-object)

## Demo

[Demo Page](https://masatomakino.github.io/threejs-interactive-object/demo/)

## Getting Started

### Install

```bash
npm install @masatomakino/threejs-interactive-object --save-dev
```

### Import

threejs-interactive-object is composed of ES6 modules and TypeScript d.ts files.

At first, import classes.

```js
import {
  ClickableMesh,
  StateMaterialSet,
  StateMaterial,
  MouseEventManager,
  ThreeMouseEvent,
  ThreeMouseEventType,
} from "@masatomakino/threejs-interactive-object";
```

### Create buttons

[API documents](https://masatomakino.github.io/threejs-interactive-object/api/)

#### init MouseEventManager

MouseEventManager class watch MouseEvent on canvas element.

initialize MouseEventManager before create a button.

```js
const manager = new MouseEventManager(scene, camera, renderer);
```

#### Init button

Create buttons and add to scene.

```js
const clickable = new ClickableMesh({
  geo: new BoxBufferGeometry(3, 3, 3),
  material: new StateMaterialSet({
    normal: new MeshBasicMaterial({
      color: 0xffffff,
    }),
  }),
});
scene.add(clickable);
```

Add event listener.

```js
clickable.model.on("click", (e) => {
  console.log("CLICKED!");
});
```

#### Convert Mesh to Interactive

MouseEventManager identifies an Object3D instance with a member named `model` as interactive. If you want to convert your loaded model to interactive, add a `model` member.

```js
mesh["model"] = new ClickableObject({ view: mesh });
```

## Uninstall

```shell script
npm uninstall @masatomakino/threejs-interactive-object --save-dev
```

## License

threejs-interactive-object is [MIT licensed](LICENSE).
