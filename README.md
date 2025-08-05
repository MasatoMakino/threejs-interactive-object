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

### Installation

```bash
npm install @masatomakino/threejs-interactive-object --save-dev
```

This library is bundled into your application at build time through module bundlers like webpack, Rollup, or Vite. Use `--save-dev` since it's processed during development, not loaded at runtime.

### Basic Usage

This library provides interactive objects for Three.js applications without requiring manual Raycaster implementation. Here's how to create your first interactive button:

#### 1. Import Required Classes

```typescript
import {
  MouseEventManager,
  ClickableMesh,
  StateMaterialSet,
  ThreeMouseEvent
} from "@masatomakino/threejs-interactive-object";
import { Scene, PerspectiveCamera, WebGLRenderer, BoxGeometry, MeshBasicMaterial } from "three";
```

#### 2. Initialize MouseEventManager

The `MouseEventManager` serves as the central event dispatcher that handles pointer interactions through raycasting. Initialize it before creating any interactive objects:

```typescript
// Set up your Three.js scene
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
const canvas = renderer.domElement;

// Create the interaction manager
const mouseManager = new MouseEventManager(scene, camera, canvas);
```

#### 3. Create Interactive Materials

Use `StateMaterialSet` to define visual states for different interaction phases:

```typescript
const materials = new StateMaterialSet({
  normal: new MeshBasicMaterial({ color: 0x0000ff, transparent: true }),      // Default state
  over: new MeshBasicMaterial({ color: 0x00ff00, transparent: true }),        // Hover state
  down: new MeshBasicMaterial({ color: 0xff0000, transparent: true }),        // Pressed state
  disable: new MeshBasicMaterial({ color: 0x666666, transparent: true })      // Disabled state
});
```

#### 4. Create Interactive Objects

```typescript
// Create a basic clickable button
const button = new ClickableMesh({
  geo: new BoxGeometry(2, 1, 0.5),
  material: materials
});

// Add to scene
scene.add(button);

// Handle click events
button.interactionHandler.on('click', (event: ThreeMouseEvent) => {
  console.log('Button clicked!', event);
});
```

### Interactive Object Types

#### ClickableMesh - Basic Button

For simple button functionality with click, hover, and press states:

```typescript
const clickButton = new ClickableMesh({
  geo: new BoxGeometry(2, 1, 0.5),
  material: materials
});

clickButton.interactionHandler.value = "save-button";
clickButton.interactionHandler.on('click', (e) => {
  console.log(`Clicked: ${e.target.interactionHandler.value}`);
});
```

#### CheckBoxMesh - Toggle Selection

For checkbox-like behavior with selection states:

```typescript
const checkboxMaterials = new StateMaterialSet({
  normal: new MeshBasicMaterial({ color: 0x888888 }),
  over: new MeshBasicMaterial({ color: 0xaaaaaa }),
  normalSelect: new MeshBasicMaterial({ color: 0x0088ff }),   // Selected normal state
  overSelect: new MeshBasicMaterial({ color: 0x00aaff })      // Selected hover state
});

const checkbox = new CheckBoxMesh({
  geo: new BoxGeometry(1, 1, 1),
  material: checkboxMaterials
});

checkbox.interactionHandler.on('select', (e) => {
  console.log(`Checkbox selected: ${e.target.interactionHandler.selection}`);
});
```

#### RadioButtonMesh - Exclusive Selection

For radio button groups with mutual exclusion:

```typescript
import { RadioButtonManager } from "@masatomakino/threejs-interactive-object";

// Create multiple radio buttons
const option1 = new RadioButtonMesh({
  geo: new BoxGeometry(1, 1, 1),
  material: checkboxMaterials  // Same materials as checkbox
});
option1.interactionHandler.value = "option-1";

const option2 = new RadioButtonMesh({
  geo: new BoxGeometry(1, 1, 1),
  material: checkboxMaterials
});
option2.interactionHandler.value = "option-2";

// Manage exclusive selection
const radioGroup = new RadioButtonManager([option1, option2]);
```

### Converting Existing Objects

Transform existing Three.js meshes into interactive objects without reconstruction:

```typescript
import { convertToClickableMesh } from "@masatomakino/threejs-interactive-object";
import { Mesh } from "three";

// Convert existing mesh to clickable
const existingMesh = new Mesh(geometry, material);
const interactiveMesh = convertToClickableMesh<string>(existingMesh);

// Add interaction behavior
interactiveMesh.interactionHandler.value = "converted-button";
interactiveMesh.interactionHandler.on('click', (e) => {
  console.log('Converted mesh clicked!');
});

// Useful for 3D model files
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
loader.load('model.gltf', (gltf) => {
  const mesh = gltf.scene.children[0] as Mesh;
  const clickableMesh = convertToClickableMesh(mesh);
  
  clickableMesh.interactionHandler.on('click', (e) => {
    console.log('Loaded model clicked!');
  });
});
```

### Performance Optimization

For applications with many interactive objects, optimize performance using target filtering:

```typescript
// Register specific objects for interaction testing
const optimizedManager = new MouseEventManager(scene, camera, canvas, {
  throttlingTime_ms: 16,        // Higher frequency for responsive interactions
  recursive: false,             // Disable hierarchy search
  targets: [button1, button2],  // Limit to specific objects
});
```

### Complete Example

```typescript
import { 
  MouseEventManager, 
  ClickableMesh, 
  StateMaterialSet 
} from "@masatomakino/threejs-interactive-object";
import { 
  Scene, 
  PerspectiveCamera, 
  WebGLRenderer, 
  BoxGeometry, 
  MeshBasicMaterial 
} from "three";

// Scene setup
const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new WebGLRenderer();
document.body.appendChild(renderer.domElement);

// Initialize interaction manager
const mouseManager = new MouseEventManager(scene, camera, renderer.domElement);

// Create interactive button
const buttonMaterials = new StateMaterialSet({
  normal: new MeshBasicMaterial({ color: 0x0000ff }),
  over: new MeshBasicMaterial({ color: 0x00ff00 }),
  down: new MeshBasicMaterial({ color: 0xff0000 })
});

const button = new ClickableMesh({
  geo: new BoxGeometry(2, 1, 0.5),
  material: buttonMaterials
});

button.position.set(0, 0, -5);
scene.add(button);

// Handle interactions
button.interactionHandler.on('click', () => {
  console.log('Button clicked!');
});

button.interactionHandler.on('over', () => {
  console.log('Mouse over button');
});

button.interactionHandler.on('out', () => {
  console.log('Mouse left button');
});

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
```

For detailed API documentation, visit: [API Documents](https://masatomakino.github.io/threejs-interactive-object/api/)

## Requirements

- Three.js (>= 0.126.0)
- WebGL-capable browser
- For TypeScript projects: ES2022 or later

## Limitations

This module is designed for Object3D-level control with material-based state management. The following features are outside the scope of this library:

- Pointing to individual parts of merged geometries
- Direct manipulation of material properties in response to pointer events - StateMaterialSet provides cross-material opacity control for UI functionality, but direct manipulation of individual material properties is not considered in the design
- Shader material state management

## Uninstall

```shell script
npm uninstall @masatomakino/threejs-interactive-object --save-dev
```

## License

threejs-interactive-object is [MIT licensed](LICENSE).
