# threejs-interactive-object

Pointer interactive objects for three.js

[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)
[![CI](https://github.com/MasatoMakino/threejs-interactive-object/actions/workflows/ci.yml/badge.svg)](https://github.com/MasatoMakino/threejs-interactive-object/actions/workflows/ci.yml)

[![ReadMe Card](https://github-readme-stats.vercel.app/api/pin/?username=MasatoMakino&repo=threejs-interactive-object)](https://github.com/MasatoMakino/threejs-interactive-object)

## Overview

This library provides interactive objects for Three.js applications, removing the need for manual Raycaster implementation. Three.js focuses on 3D rendering and leaves interactive object implementation to developers. To create interactive objects, developers typically need to control Raycaster directly to identify pointer events and match them with display objects.

This module enables the creation of interactive objects by simply specifying an Object3D and a material set that corresponds to pointer events. The library handles Raycaster control, event management, and state transitions automatically.

## Features

### Interactive Object Types
- `ClickableMesh` / `ClickableSprite` - Simple button functionality responding to taps and clicks
- `CheckBoxMesh` / `CheckBoxSprite` - Toggle objects with individual selection states
- `RadioButtonMesh` / `RadioButtonSprite` - Mutually exclusive selection within groups
- `ClickableGroup` - Container class for monitoring child object interactions

### State-based Material Management
`StateMaterialSet` provides comprehensive material management for interactive states:
- **Seven interaction states**: normal, over, down, disable, normalSelect, overSelect, downSelect
- **Automatic state switching**: Materials change automatically based on pointer interactions
- **Fallback support**: Unspecified states automatically use normal material
- **Unified opacity control**: Global opacity adjustment across all state materials
- **Multi-material support**: Handles both single materials and material arrays

### Performance Optimization
The library offers two search modes for performance optimization:
- **Auto-detection mode**: Searches all Object3D instances in the scene (easier management)
- **Registration mode**: Searches only user-registered objects (optimized performance for fixed UI elements)

### Cross-platform Support
- Works on any platform where Three.js operates
- Supports desktop browsers and mobile touch devices
- Single-touch interaction support (multi-touch and gestures are currently not supported)

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

The `MouseEventManager` identifies an Object3D instance with a member named `interactionHandler` as interactive. If you want to convert your loaded model to be interactive, you can use the `convertToClickableMesh`, `convertToCheckboxMesh`, `convertToRadioButtonMesh` function.

```js
const interactiveMesh = convertToClickableMesh(mesh);
```

## Requirements

- Three.js (>= 0.126.0)
- WebGL-capable browser
- For TypeScript projects: ES2022 or later

## Limitations

This module is designed for Object3D-level control with material-based state management. The following features are outside the scope of this library:

- Pointing to individual parts of merged geometries
- Dynamic material value control in response to pointer events
- Shader material state management

## Uninstall

```shell script
npm uninstall @masatomakino/threejs-interactive-object --save-dev
```

## License

threejs-interactive-object is [MIT licensed](LICENSE).
