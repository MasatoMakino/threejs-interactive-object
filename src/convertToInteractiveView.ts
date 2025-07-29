/**
 * @fileoverview Utility functions for converting existing Three.js objects to interactive objects.
 *
 * This module provides conversion functions that transform standard Three.js Mesh objects
 * into interactive objects without requiring reconstruction. Particularly useful for
 * objects loaded from 3D model files.
 *
 * @example
 * ```typescript
 * import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
 * import { convertToClickableMesh } from '@masatomakino/threejs-interactive-object';
 *
 * const loader = new GLTFLoader();
 * loader.load('model.gltf', (gltf) => {
 *   // Convert loaded mesh to interactive
 *   const mesh = gltf.scene.children[0] as Mesh;
 *   const clickableMesh = convertToClickableMesh(mesh);
 *
 *   // Now supports interaction events
 *   clickableMesh.interactionHandler.on('click', (e) => {
 *     console.log('Mesh clicked!', e);
 *   });
 * });
 * ```
 */

import type { Mesh } from "three";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  RadioButtonInteractionHandler,
} from "./index.js";
import type {
  CheckBoxMesh,
  ClickableMesh,
  RadioButtonMesh,
} from "./view/index.js";

// 一時的にreadonly を剥がす型
type Writable<T> = { -readonly [P in keyof T]: T[P] };

/**
 * Converts an existing Three.js Mesh to a ClickableMesh with basic click interaction.
 *
 * This function adds interaction capabilities to a standard Three.js Mesh without
 * modifying its geometry, material, or visual properties. The converted mesh will
 * emit click, mousedown, mouseup, mouseover, and mouseout events.
 *
 * @template V - The type of value associated with this interactive object
 * @param view - The Three.js Mesh to convert to an interactive object
 * @returns A ClickableMesh that supports mouse interaction events
 *
 * @example
 * ```typescript
 * import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
 * import { convertToClickableMesh } from '@masatomakino/threejs-interactive-object';
 *
 * // Create a standard mesh
 * const geometry = new BoxGeometry(1, 1, 1);
 * const material = new MeshBasicMaterial({ color: 0x00ff00, transparent: true });
 * const mesh = new Mesh(geometry, material);
 *
 * // Convert to interactive
 * const clickableMesh = convertToClickableMesh<string>(mesh);
 * clickableMesh.interactionHandler.value = "button1";
 *
 * // Add click handler
 * clickableMesh.interactionHandler.on('click', (e) => {
 *   console.log(`Clicked: ${e.target.interactionHandler.value}`);
 * });
 * ```
 *
 * @remarks
 * - Modifies the original mesh in-place, preserving all properties
 * - Requires MouseEventManager to process interactions
 * - Generic value type V allows associating custom data
 *
 * @see {@link MouseEventManager} - Required for processing mouse events
 * @see {@link ClickableMesh} - The returned interface type
 * @see {@link ButtonInteractionHandler} - The interaction handler that manages events
 */
export function convertToClickableMesh<V = unknown>(
  view: Mesh,
): ClickableMesh<V> {
  const writableView = view as Writable<Mesh & ClickableMesh<V>>;
  writableView.interactionHandler = new ButtonInteractionHandler<V>({
    view: writableView,
  });
  return writableView as ClickableMesh<V>;
}

/**
 * Converts an existing Three.js Mesh to a CheckBoxMesh with toggle interaction behavior.
 *
 * This function adds checkbox-like interaction capabilities to a standard Three.js Mesh.
 * The converted mesh maintains a selected state that toggles on each click, and can
 * display different visual states through StateMaterialSet integration.
 *
 * @template V - The type of value associated with this interactive object
 * @param view - The Three.js Mesh to convert to a checkbox interactive object
 * @returns A CheckBoxMesh that supports toggle state and interaction events
 *
 * @example
 * ```typescript
 * import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
 * import { convertToCheckboxMesh, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 *
 * // Create a standard mesh
 * const geometry = new BoxGeometry(1, 1, 1);
 * const normalMaterial = new MeshBasicMaterial({ color: 0x888888, transparent: true });
 * const selectedMaterial = new MeshBasicMaterial({ color: 0x00ff00, transparent: true });
 * const mesh = new Mesh(geometry, normalMaterial);
 *
 * // Convert to checkbox
 * const checkboxMesh = convertToCheckboxMesh<string>(mesh);
 * checkboxMesh.interactionHandler.value = "option1";
 *
 * // Set up visual states
 * const stateSet = new StateMaterialSet({ normal: normalMaterial, normalSelect: selectedMaterial });
 * mesh.material = stateSet;
 *
 * // Handle select events (when state toggles)
 * checkboxMesh.interactionHandler.on('select', (e) => {
 *   console.log(`Checkbox ${e.interactionHandler?.value}: ${e.isSelected}`);
 *   // Material changes are handled automatically by CheckBoxInteractionHandler.updateMaterial()
 * });
 * ```
 *
 * @remarks
 * - Modifies the original mesh in-place, maintaining toggle state
 * - Emits 'select' events when state changes
 * - Material state changes handled automatically via updateMaterial()
 * - Requires MouseEventManager to process interactions
 *
 * @see {@link MouseEventManager} - Required for processing mouse events
 * @see {@link CheckBoxMesh} - The returned interface type
 * @see {@link CheckBoxInteractionHandler} - The interaction handler that manages toggle behavior
 * @see {@link StateMaterialSet} - Recommended for managing visual states
 */
export function convertToCheckboxMesh<V = unknown>(
  view: Mesh,
): CheckBoxMesh<V> {
  const writableView = view as Writable<Mesh & CheckBoxMesh<V>>;
  writableView.interactionHandler = new CheckBoxInteractionHandler<V>({
    view: writableView,
  });
  return writableView as CheckBoxMesh<V>;
}

/**
 * Converts an existing Three.js Mesh to a RadioButtonMesh with exclusive selection behavior.
 *
 * This function adds radio button-like interaction capabilities to a standard Three.js Mesh.
 * Radio buttons work in groups where only one can be selected at a time. Use RadioButtonManager
 * to manage groups and handle exclusive selection behavior.
 *
 * @template V - The type of value associated with this interactive object
 * @param view - The Three.js Mesh to convert to a radio button interactive object
 * @returns A RadioButtonMesh that supports exclusive group selection and interaction events
 *
 * @example
 * ```typescript
 * import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
 * import { convertToRadioButtonMesh, RadioButtonManager, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 *
 * // Create radio button meshes with state materials
 * const geometry = new BoxGeometry(1, 1, 1);
 * const normalMaterial = new MeshBasicMaterial({ color: 0x888888, transparent: true });
 * const selectedMaterial = new MeshBasicMaterial({ color: 0xff0000, transparent: true });
 *
 * // Set up visual states
 * const stateSet = new StateMaterialSet({ normal: normalMaterial, normalSelect: selectedMaterial });
 *
 * const mesh1 = new Mesh(geometry, stateSet);
 * const mesh2 = new Mesh(geometry, stateSet);
 *
 * // Convert to radio buttons
 * const radio1 = convertToRadioButtonMesh<string>(mesh1);
 * const radio2 = convertToRadioButtonMesh<string>(mesh2);
 *
 * radio1.interactionHandler.value = "option1";
 * radio2.interactionHandler.value = "option2";
 *
 * // Create manager and add to group
 * const radioManager = new RadioButtonManager<string>();
 * radioManager.addButton(radio1);
 * radioManager.addButton(radio2);
 *
 * // Handle selection events from manager
 * radioManager.on('select', (e) => {
 *   console.log(`Selected: ${e.interactionHandler?.value}`);
 *   // Material changes are handled automatically by ButtonInteractionHandler.updateMaterial()
 * });
 * ```
 *
 * @remarks
 * - Modifies the original mesh in-place for radio button behavior
 * - Requires RadioButtonManager for exclusive group selection
 * - Material state changes handled automatically via updateMaterial()
 * - Requires MouseEventManager to process interactions
 *
 * @see {@link MouseEventManager} - Required for processing mouse events
 * @see {@link RadioButtonMesh} - The returned interface type
 * @see {@link RadioButtonInteractionHandler} - The interaction handler for radio behavior
 * @see {@link RadioButtonManager} - Required for managing exclusive selection groups
 * @see {@link StateMaterialSet} - Recommended for managing visual states
 */
export function convertToRadioButtonMesh<V = unknown>(
  view: Mesh,
): RadioButtonMesh<V> {
  const writableView = view as Writable<Mesh & RadioButtonMesh<V>>;
  writableView.interactionHandler = new RadioButtonInteractionHandler<V>({
    view: writableView,
  });
  return writableView as RadioButtonMesh<V>;
}
