# threejs-interactive-object

> Mouse interactive objects for three.js

[![Build Status](https://travis-ci.org/MasatoMakino/threejs-interactive-object.svg?branch=master)](https://travis-ci.org/MasatoMakino/threejs-interactive-object)
[![Maintainability](https://api.codeclimate.com/v1/badges/2c756ac812782947b080/maintainability)](https://codeclimate.com/github/MasatoMakino/threejs-interactive-object/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/2c756ac812782947b080/test_coverage)](https://codeclimate.com/github/MasatoMakino/threejs-interactive-object/test_coverage)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

[![ReadMe Card](https://github-readme-stats.vercel.app/api/pin/?username=MasatoMakino&repo=threejs-interactive-object&show_owner=true)](https://github.com/MasatoMakino/threejs-interactive-object)

## Demo

[Demo Page](https://masatomakino.github.io/threejs-interactive-object/demo/)

## Getting Started

### Install

```bash
npm install https://github.com/MasatoMakino/threejs-interactive-object.git --save-dev
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
} from "threejs-interactive-object";
```

### Create buttons

[API documents](https://masatomakino.github.io/threejs-interactive-object/api/)

#### init MouseEventManager

MouseEventManager class watch MouseEvent on canvas element.

initialize MouseEventManager before create a button.

```js
MouseEventManager.init(scene, camera, renderer);
```

#### init button

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

and add event listener

```js
clickable.addEventListener(ThreeMouseEventType.CLICK, (e) => {
  cosole.log("CLICKED!");
});
```

## Uninstall

```bash
npm uninstall https://github.com/MasatoMakino/threejs-interactive-object.git --save-dev
```

## License

threejs-interactive-object is [MIT licensed](LICENSE).
