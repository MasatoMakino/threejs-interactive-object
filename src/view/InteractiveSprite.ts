/**
 * @fileoverview Interactive sprite view classes for Three.js pointer-interactive objects.
 *
 * This module provides the core view layer for creating interactive 2D sprite objects
 * in Three.js applications. It follows a compositional architecture where view objects
 * delegate interaction logic to specialized handler classes while extending Three.js Sprite.
 *
 * The module includes:
 * - InteractiveSprite: Generic base class for all interactive sprite types
 * - ClickableSprite: Basic clickable sprite with button-like behavior
 * - CheckBoxSprite: Checkbox sprite with toggle selection behavior
 * - RadioButtonSprite: Radio button sprite with exclusive selection behavior
 *
 * All interactive sprites require StateMaterialSet for visual state management and
 * MouseEventManager integration for pointer event processing.
 *
 * @see {@link StateMaterialSet} - Material state management system
 * @see {@link MouseEventManager} - Event processing and raycasting system
 * @see {@link ButtonInteractionHandler} - Base interaction logic
 */

import { Sprite } from "three";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  type IClickableObject3D,
  RadioButtonInteractionHandler,
  type StateMaterialSet,
} from "../index.js";
import type { InteractionHandlerConstructor } from "./InteractionHandlerConstructor.js";

/**
 * Generic base class for all interactive sprite objects in the library.
 *
 * @description
 * InteractiveSprite serves as the foundation for all interactive 2D sprite objects,
 * extending Three.js Sprite with pointer interaction capabilities. It uses a compositional
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
 * @template Handler - The specific interaction handler type that manages
 *                     this sprite's pointer interaction behavior.
 *
 * @internal
 */
class InteractiveSprite<Value, Handler extends ButtonInteractionHandler<Value>>
  extends Sprite
  implements IClickableObject3D<Value>
{
  /** The interaction handler that manages pointer events and state for this sprite. */
  readonly interactionHandler: Handler;

  /**
   * Creates a new interactive sprite with the specified material and interaction handler.
   *
   * @param material - StateMaterialSet for managing visual states
   * @param ctor - Constructor function for the interaction handler class
   */
  constructor(
    material: StateMaterialSet,
    ctor: InteractionHandlerConstructor<Handler, Value>,
  ) {
    super();
    this.interactionHandler = new ctor({ view: this, material: material });
  }
}
/**
 * Basic clickable sprite with button-like interaction behavior.
 *
 * @description
 * ClickableSprite provides the simplest form of interactive sprite with standard button-like
 * behavior. It responds to pointer events (click, mousedown, mouseup, mouseover, mouseout)
 * and manages visual states through StateMaterialSet integration.
 *
 * The sprite emits interaction events that can be handled to trigger application logic,
 * making it suitable for buttons, interactive objects, and UI elements in 2D overlay scenes.
 *
 * @template Value - Type of arbitrary data associated with this clickable sprite.
 *                   Defaults to unknown if not specified.
 *
 * @example
 * ```typescript
 * import { ClickableSprite, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { SpriteMaterial, TextureLoader } from 'three';
 *
 * // Create texture loader
 * const textureLoader = new TextureLoader();
 *
 * // Create materials for different states
 * // Note: Replace image paths with your actual asset URLs
 * const materials = new StateMaterialSet({
 *   normal: new SpriteMaterial({ map: textureLoader.load('./button_normal.png'), transparent: true }),
 *   over: new SpriteMaterial({ map: textureLoader.load('./button_over.png'), transparent: true }),
 *   down: new SpriteMaterial({ map: textureLoader.load('./button_down.png'), transparent: true })
 * });
 *
 * // Create clickable sprite
 * const button = new ClickableSprite<string>(materials);
 * button.scale.set(2, 1, 1);
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
 * @see {@link https://threejs.org/docs/#api/en/loaders/TextureLoader.load} - TextureLoader.load documentation
 *
 * @public
 */
export class ClickableSprite<Value = unknown>
  extends InteractiveSprite<Value, ButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  /**
   * Creates a new clickable sprite with button-like interaction behavior.
   *
   * @param material - StateMaterialSet with sprite materials for different interaction states
   */
  constructor(material: StateMaterialSet) {
    super(material, ButtonInteractionHandler<Value>);
  }
}

/**
 * Checkbox sprite with toggle selection behavior.
 *
 * @description
 * CheckBoxSprite extends InteractiveSprite with checkbox-specific toggle selection behavior.
 * It maintains an internal selected state that toggles on each click interaction,
 * and integrates with StateMaterialSet to display selection-aware visual states
 * (normal, over, down, normalSelect, overSelect, downSelect).
 *
 * The sprite emits a 'select' event when the selection state changes, in addition
 * to standard pointer interaction events.
 *
 * @template Value - Type of arbitrary data associated with this checkbox sprite.
 *                   Defaults to unknown if not specified.
 *
 * @example
 * ```typescript
 * import { CheckBoxSprite, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { SpriteMaterial, TextureLoader } from 'three';
 *
 * // Create texture loader
 * const textureLoader = new TextureLoader();
 *
 * // Create materials including selection states
 * // Note: Replace image paths with your actual asset URLs
 * const materials = new StateMaterialSet({
 *   normal: new SpriteMaterial({ map: textureLoader.load('./checkbox_normal.png'), transparent: true }),
 *   over: new SpriteMaterial({ map: textureLoader.load('./checkbox_over.png'), transparent: true }),
 *   down: new SpriteMaterial({ map: textureLoader.load('./checkbox_down.png'), transparent: true }),
 *   normalSelect: new SpriteMaterial({ map: textureLoader.load('./checkbox_selected.png'), transparent: true }),
 *   overSelect: new SpriteMaterial({ map: textureLoader.load('./checkbox_selected_over.png'), transparent: true })
 * });
 *
 * // Create checkbox sprite
 * const checkbox = new CheckBoxSprite<string>(materials);
 * checkbox.scale.set(1, 1, 1);
 *
 * // Associate custom data
 * checkbox.interactionHandler.value = "option1";
 *
 * // Handle selection changes
 * checkbox.interactionHandler.on('select', (e) => {
 *   console.log(`Checkbox ${e.target.interactionHandler.value} selected: ${e.target.interactionHandler.selection}`);
 * });
 * ```
 *
 * @see {@link CheckBoxInteractionHandler} - The interaction handler that manages selection
 * @see {@link StateMaterialSet} - Required for selection-aware material states
 * @see {@link https://threejs.org/docs/#api/en/loaders/TextureLoader.load} - TextureLoader.load documentation
 *
 * @public
 */
export class CheckBoxSprite<Value = unknown>
  extends InteractiveSprite<Value, CheckBoxInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  /**
   * Creates a new checkbox sprite with toggle selection behavior.
   *
   * @param material - StateMaterialSet with sprite materials for different states including selection states
   */
  constructor(material: StateMaterialSet) {
    super(material, CheckBoxInteractionHandler<Value>);
  }
}

/**
 * Radio button sprite with exclusive selection behavior.
 *
 * @description
 * RadioButtonSprite extends InteractiveSprite with radio button-specific exclusive selection
 * behavior. When used with RadioButtonManager, only one radio button in a group can
 * be selected at a time. Clicking a radio button selects it and automatically
 * deselects other radio buttons in the same group.
 *
 * Individual radio buttons can be frozen to prevent deselection, ensuring at least
 * one option remains selected in the group.
 *
 * @template Value - Type of arbitrary data associated with this radio button sprite.
 *                   Defaults to unknown if not specified.
 *
 * @example
 * ```typescript
 * import { RadioButtonSprite, RadioButtonManager, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { SpriteMaterial, TextureLoader } from 'three';
 *
 * // Create texture loader
 * const textureLoader = new TextureLoader();
 *
 * // Create materials for radio button states
 * // Note: Replace image paths with your actual asset URLs
 * const materials = new StateMaterialSet({
 *   normal: new SpriteMaterial({ map: textureLoader.load('./radio_normal.png'), transparent: true }),
 *   over: new SpriteMaterial({ map: textureLoader.load('./radio_over.png'), transparent: true }),
 *   normalSelect: new SpriteMaterial({ map: textureLoader.load('./radio_selected.png'), transparent: true }),
 *   overSelect: new SpriteMaterial({ map: textureLoader.load('./radio_selected_over.png'), transparent: true })
 * });
 *
 * // Create radio button group
 * const option1 = new RadioButtonSprite<string>(materials);
 * option1.scale.set(1, 1, 1);
 * option1.position.set(-2, 0, 0);
 * option1.interactionHandler.value = "option-1";
 *
 * const option2 = new RadioButtonSprite<string>(materials);
 * option2.scale.set(1, 1, 1);
 * option2.position.set(2, 0, 0);
 * option2.interactionHandler.value = "option-2";
 *
 * // Manage exclusive selection
 * const manager = new RadioButtonManager([option1, option2]);
 *
 * // Handle selection events from manager
 * manager.on('select', (e) => {
 *   console.log(`Selected: ${e.target.interactionHandler.value}`);
 * });
 * ```
 *
 * @see {@link RadioButtonInteractionHandler} - The interaction handler that manages exclusive selection
 * @see {@link RadioButtonManager} - Manages groups of radio buttons for exclusive selection
 * @see {@link StateMaterialSet} - Required for selection-aware material states
 * @see {@link https://threejs.org/docs/#api/en/loaders/TextureLoader.load} - TextureLoader.load documentation
 *
 * @public
 */
export class RadioButtonSprite<Value = unknown>
  extends InteractiveSprite<Value, RadioButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  /**
   * Creates a new radio button sprite with exclusive selection behavior.
   *
   * @param material - StateMaterialSet with sprite materials for different states including selection states
   */
  constructor(material: StateMaterialSet) {
    super(material, RadioButtonInteractionHandler<Value>);
  }
}
