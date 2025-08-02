/**
 * @fileoverview Interactive mesh view classes for Three.js pointer-interactive objects.
 *
 * This module provides the core view layer for creating interactive 3D mesh objects
 * in Three.js applications. It follows a compositional architecture where view objects
 * delegate interaction logic to specialized handler classes while extending Three.js Mesh.
 *
 * The module includes:
 * - InteractiveMesh: Generic base class for all interactive mesh types
 * - ClickableMesh: Basic clickable mesh with button-like behavior
 * - CheckBoxMesh: Checkbox mesh with toggle selection behavior
 * - RadioButtonMesh: Radio button mesh with exclusive selection behavior
 *
 * All interactive meshes require StateMaterialSet for visual state management and
 * MouseEventManager integration for pointer event processing.
 *
 * @see {@link StateMaterialSet} - Material state management system
 * @see {@link MouseEventManager} - Event processing and raycasting system
 * @see {@link ButtonInteractionHandler} - Base interaction logic
 */

import { type BufferGeometry, Mesh } from "three";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  type IClickableObject3D,
  type InteractionHandlerConstructor,
  RadioButtonInteractionHandler,
  type StateMaterialSet,
} from "../index.js";

/**
 * Configuration parameters for creating interactive mesh objects.
 *
 * @description
 * Defines the required and optional parameters for constructing any interactive mesh.
 * The geometry parameter is currently optional but should typically be provided.
 * The material parameter is required for proper visual state management.
 *
 * @public
 */
export interface InteractiveMeshParameters {
  /** Three.js BufferGeometry. Currently optional but typically required for proper rendering. */
  geo?: BufferGeometry;
  /** Required StateMaterialSet for managing visual states (normal, over, down, selected, etc.) */
  material: StateMaterialSet;
}

/**
 * Generic base class for all interactive mesh objects in the library.
 *
 * @description
 * InteractiveMesh serves as the foundation for all interactive 3D mesh objects,
 * extending Three.js Mesh with pointer interaction capabilities. It uses a compositional
 * pattern where interaction logic is delegated to specialized handler classes rather
 * than implementing interaction behavior directly.
 *
 * This design allows:
 * - Shared interaction logic across different object types (Mesh, Sprite, Group)
 * - Type-safe event emission through handler delegation
 * - Flexible handler substitution for different interaction behaviors
 * - Clean separation between rendering (Three.js) and interaction concerns
 *
 * @template Value - Type of arbitrary data associated with this interactive object.
 *                   Used for identifying specific objects in multi-object scenarios.
 * @template InteractionHandler - The specific interaction handler type that manages
 *                                 this mesh's pointer interaction behavior.
 *
 * @internal
 */
class InteractiveMesh<
    Value,
    InteractionHandler extends ButtonInteractionHandler<Value>,
  >
  extends Mesh
  implements IClickableObject3D<Value>
{
  /** The interaction handler that manages pointer events and state for this mesh. */
  readonly interactionHandler: InteractionHandler;

  /**
   * Creates a new interactive mesh with the specified parameters and interaction handler.
   *
   * @param parameters - Configuration object containing geometry and material settings
   * @param ctor - Constructor function for the interaction handler class
   */
  constructor(
    parameters: InteractiveMeshParameters,
    ctor: InteractionHandlerConstructor<InteractionHandler, Value>,
  ) {
    super(parameters.geo);
    this.interactionHandler = new ctor({
      view: this,
      material: parameters.material,
    });
  }
}

/**
 * Basic clickable mesh with button-like interaction behavior.
 *
 * @description
 * ClickableMesh provides the simplest form of interactive mesh with standard button-like
 * behavior. It responds to pointer events (click, mousedown, mouseup, mouseover, mouseout)
 * and manages visual states through StateMaterialSet integration.
 *
 * The mesh emits interaction events that can be handled to trigger application logic,
 * making it suitable for buttons, interactive objects, and UI elements in 3D scenes.
 *
 * @template Value - Type of arbitrary data associated with this clickable mesh.
 *                   Defaults to unknown if not specified.
 *
 * @example
 * ```typescript
 * import { ClickableMesh, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { BoxGeometry, MeshBasicMaterial } from 'three';
 *
 * // Create materials for different states
 * const materials = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x0000ff, transparent: true }),
 *   over: new MeshBasicMaterial({ color: 0x00ff00, transparent: true }),
 *   down: new MeshBasicMaterial({ color: 0xff0000, transparent: true })
 * });
 *
 * // Create clickable mesh
 * const button = new ClickableMesh<string>({
 *   geo: new BoxGeometry(2, 1, 0.5),
 *   material: materials
 * });
 *
 * // Associate custom data
 * button.interactionHandler.value = "menu-button";
 *
 * // Handle click events
 * button.interactionHandler.on('click', (e) => {
 *   console.log(`Clicked: ${e.target.interactionHandler.value}`);
 * });
 * ```
 *
 * @see {@link ButtonInteractionHandler} - The interaction handler that manages events
 * @see {@link StateMaterialSet} - Required for material state management
 * @see {@link MouseEventManager} - Required for processing pointer events
 *
 * @public
 */
export class ClickableMesh<Value = unknown>
  extends InteractiveMesh<Value, ButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  /**
   * Creates a new clickable mesh with button-like interaction behavior.
   *
   * @param parameters - Configuration object with geometry and StateMaterialSet
   */
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, ButtonInteractionHandler<Value>);
  }
}

/**
 * Checkbox mesh with toggle selection behavior.
 *
 * @description
 * CheckBoxMesh extends InteractiveMesh with checkbox-specific toggle selection behavior.
 * It maintains an internal selected state that toggles on each click interaction,
 * and integrates with StateMaterialSet to display selection-aware visual states
 * (normal, over, down, normalSelect, overSelect, downSelect).
 *
 * The mesh emits a 'select' event when the selection state changes, in addition
 * to standard pointer interaction events.
 *
 * @template Value - Type of arbitrary data associated with this checkbox mesh.
 *                   Defaults to unknown if not specified.
 *
 * @example
 * ```typescript
 * import { CheckBoxMesh, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { BoxGeometry, MeshBasicMaterial } from 'three';
 *
 * // Create materials including selection states
 * const materials = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x0000ff, transparent: true }),
 *   over: new MeshBasicMaterial({ color: 0x00ff00, transparent: true }),
 *   down: new MeshBasicMaterial({ color: 0xff0000, transparent: true }),
 *   normalSelect: new MeshBasicMaterial({ color: 0x0000aa, transparent: true }),
 *   overSelect: new MeshBasicMaterial({ color: 0x00aa00, transparent: true })
 * });
 *
 * // Create checkbox mesh
 * const checkbox = new CheckBoxMesh<string>({
 *   geo: new BoxGeometry(1, 1, 1),
 *   material: materials
 * });
 *
 * // Handle selection changes
 * checkbox.interactionHandler.on('select', (e) => {
 *   console.log(`Checkbox ${e.target.interactionHandler.value} selected: ${e.target.interactionHandler.selection}`);
 * });
 * ```
 *
 * @see {@link CheckBoxInteractionHandler} - The interaction handler that manages selection
 * @see {@link StateMaterialSet} - Required for selection-aware material states
 * @see {@link convertToCheckboxMesh} - Alternative creation method for existing meshes
 *
 * @public
 */
export class CheckBoxMesh<Value = unknown>
  extends InteractiveMesh<Value, CheckBoxInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  /**
   * Creates a new checkbox mesh with toggle selection behavior.
   *
   * @param parameters - Configuration object with geometry and StateMaterialSet
   */
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, CheckBoxInteractionHandler<Value>);
  }
}

/**
 * Radio button mesh with exclusive selection behavior.
 *
 * @description
 * RadioButtonMesh extends InteractiveMesh with radio button-specific exclusive selection
 * behavior. When used with RadioButtonManager, only one radio button in a group can
 * be selected at a time. Clicking a radio button selects it and automatically
 * deselects other radio buttons in the same group.
 *
 * Individual radio buttons can be frozen to prevent deselection, ensuring at least
 * one option remains selected in the group.
 *
 * @template Value - Type of arbitrary data associated with this radio button mesh.
 *                   Defaults to unknown if not specified.
 *
 * @example
 * ```typescript
 * import { RadioButtonMesh, RadioButtonManager, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { BoxGeometry, MeshBasicMaterial } from 'three';
 *
 * // Create materials for radio button states
 * const materials = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x0000ff, transparent: true }),
 *   over: new MeshBasicMaterial({ color: 0x00ff00, transparent: true }),
 *   normalSelect: new MeshBasicMaterial({ color: 0x0000aa, transparent: true }),
 *   overSelect: new MeshBasicMaterial({ color: 0x00aa00, transparent: true })
 * });
 *
 * // Create radio button group
 * const option1 = new RadioButtonMesh<string>({
 *   geo: new BoxGeometry(1, 1, 1),
 *   material: materials
 * });
 * option1.interactionHandler.value = "option-1";
 *
 * const option2 = new RadioButtonMesh<string>({
 *   geo: new BoxGeometry(1, 1, 1),
 *   material: materials
 * });
 * option2.interactionHandler.value = "option-2";
 *
 * // Manage exclusive selection
 * const manager = new RadioButtonManager([option1, option2]);
 * ```
 *
 * @see {@link RadioButtonInteractionHandler} - The interaction handler that manages exclusive selection
 * @see {@link RadioButtonManager} - Manages groups of radio buttons for exclusive selection
 * @see {@link convertToRadioButtonMesh} - Alternative creation method for existing meshes
 *
 * @public
 */
export class RadioButtonMesh<Value = unknown>
  extends InteractiveMesh<Value, RadioButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  /**
   * Creates a new radio button mesh with exclusive selection behavior.
   *
   * @param parameters - Configuration object with geometry and StateMaterialSet
   */
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, RadioButtonInteractionHandler<Value>);
  }
}
