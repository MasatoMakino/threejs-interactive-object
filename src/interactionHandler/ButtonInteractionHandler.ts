/**
 * @fileoverview Core interaction handler for pointer-interactive Three.js objects.
 *
 * This module provides the fundamental interaction management system for interactive
 * Three.js objects. The ButtonInteractionHandler was designed as a separate handler
 * class rather than extending Three.js display objects directly due to EventEmitter3's
 * type constraints (see: https://github.com/primus/eventemitter3/issues/243).
 *
 * The handler pattern allows:
 * - Shared interaction logic between Mesh and Sprite objects
 * - Type-safe event emission without EventEmitter3 inheritance limitations
 * - Centralized state and material management
 * - Generic value association for multi-button scenarios
 *
 * @see {@link StateMaterialSet} - Material state management
 * @see {@link IClickableObject3D} - Interface implemented by interactive objects
 */

import EventEmitter from "eventemitter3";
import type {
  ClickableGroup,
  ClickableMesh,
  ClickableSprite,
  ClickableState,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventMap,
} from "../index.js";
import { createThreeMouseEvent } from "../ThreeMouseEventUtil.js";

/**
 * Union type representing all interactive display objects that can be managed by ButtonInteractionHandler.
 *
 * @description
 * This type alias encompasses all Three.js display object types that can be made interactive
 * through the ButtonInteractionHandler system. Each type supports the same interaction events
 * and state management, providing a unified interface regardless of the underlying display object.
 *
 * @template Value - The type of value associated with the interactive object
 *
 * @public
 */
export type ClickableView<Value> =
  | ClickableMesh<Value>
  | ClickableSprite<Value>
  | ClickableGroup<Value>;

/**
 * Configuration parameters for creating a ButtonInteractionHandler instance.
 *
 * @description
 * Defines the required and optional parameters needed to initialize a ButtonInteractionHandler.
 * The view parameter establishes the connection between the handler and the display object,
 * while the material parameter provides the visual state representations.
 *
 * @template Value - The type of value associated with the interactive object
 *
 * @public
 */
export interface ButtonInteractionHandlerParameters<Value> {
  /**
   * The interactive display object to be managed by this handler.
   * Must implement the IClickableObject3D interface.
   */
  view: ClickableView<Value>;

  /**
   * Optional material set for managing visual states (normal, over, down, disable).
   * If not provided, the handler will manage interaction state without visual changes.
   */
  material?: StateMaterialSet;
}

/**
 * Core interaction handler for pointer-interactive Three.js objects with button-like behavior.
 *
 * @description
 * ButtonInteractionHandler provides comprehensive interaction management for Three.js display objects,
 * handling pointer events, state transitions, and material updates. This class was designed as a separate
 * handler rather than extending display objects directly due to EventEmitter3's type system limitations
 * that prevent proper event type extension in inheritance chains.
 *
 * The handler manages four primary interaction states (see {@link state} property for details).
 *
 * **Multi-touch Click Suppression**: When multiple pointers interact with the same object,
 * only the first pointer to complete a down-up sequence triggers a click event. Subsequent
 * pointer releases are automatically suppressed to match native browser behavior where
 * multi-touch gestures prevent synthetic click events.
 *
 * @template Value - Type of arbitrary data associated with this interactive object.
 *                   Used for identifying specific buttons in multi-button scenarios.
 *
 * @fires click - Emitted when a complete click interaction occurs (down followed by up).
 *               In multi-touch scenarios, only the first completing pointer triggers this event.
 * @fires down - Emitted when pointer is pressed down on the object
 * @fires up - Emitted when pointer is released after being pressed
 * @fires over - Emitted when pointer enters the object area
 * @fires out - Emitted when pointer leaves the object area
 *
 * @example
 * ```typescript
 * import { ButtonInteractionHandler, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { BoxGeometry, Mesh, MeshBasicMaterial } from 'three';
 *
 * // Create materials for different states
 * const materials = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x0000ff }),
 *   over: new MeshBasicMaterial({ color: 0x00ff00 }),
 *   down: new MeshBasicMaterial({ color: 0xff0000 })
 * });
 *
 * // Create interactive mesh
 * const mesh = new Mesh(new BoxGeometry(1, 1, 1));
 * const handler = new ButtonInteractionHandler({
 *   view: mesh,
 *   material: materials
 * });
 *
 * // Associate custom data
 * handler.value = { id: 'button1', action: 'save' };
 *
 * // Listen for events
 * handler.on('click', (event) => {
 *   console.log('Button clicked:', handler.value);
 * });
 * ```
 *
 * @see {@link StateMaterialSet} - Material state management system
 * @see {@link ClickableView} - Supported display object types
 * @see {@link IClickableObject3D} - Interface for interactive objects
 *
 * @public
 */
export class ButtonInteractionHandler<Value> extends EventEmitter<
  ThreeMouseEventMap<Value>
> {
  /**
   * Arbitrary data associated with this interactive object.
   *
   * @description
   * The value property allows association of custom data with the interactive object,
   * making it useful for identifying specific buttons in multi-button scenarios or
   * storing configuration data. Event listeners can use this value to determine
   * appropriate responses to interactions.
   *
   * @example
   * ```typescript
   * // String identifier
   * handler.value = 'save-button';
   *
   * // Complex object with metadata
   * handler.value = { id: 'btn1', action: 'save', data: {...} };
   * ```
   */
  public value: Value | undefined;

  /**
   * Gets the current StateMaterialSet managing visual states.
   *
   * @returns The current material set, or undefined if none is assigned
   */
  get materialSet(): StateMaterialSet | undefined {
    return this._materialSet;
  }

  /**
   * Sets the StateMaterialSet for managing visual states.
   *
   * @param value - The material set to assign, or undefined to remove
   *
   * @description
   * When a new material set is assigned, the handler automatically updates
   * the display object's material to reflect the current interaction state.
   * Setting the same material set again will not trigger an update.
   */
  set materialSet(value: StateMaterialSet | undefined) {
    const isSame = value === this._materialSet;
    this._materialSet = value;
    if (!isSame) {
      this.updateMaterial();
    }
  }

  /**
   * Indicates whether any pointer is currently hovering over the object.
   *
   * @returns True if one or more pointers are over the object, false otherwise
   *
   * @description
   * Computed from the size of the hoverPointerIds Set. Returns true when any
   * pointer is hovering over the interactive object, supporting both single
   * and multitouch scenarios while maintaining backward compatibility.
   *
   * @readonly
   */
  get isOver(): boolean {
    return this.hoverPointerIds.size > 0;
  }

  /**
   * Checks whether a specific pointer is currently hovering over the object.
   *
   * @param pointerId - The pointer ID to check
   * @returns True if the specified pointer is hovering over the object, false otherwise
   *
   * @description
   * This method enables pointer-specific hover state checking, essential for proper
   * multitouch duplicate event prevention in MouseEventManager. Unlike the general
   * isOver property which indicates if ANY pointer is hovering, this method checks
   * the hover state for a specific pointer ID.
   */
  public isPointerOver(pointerId: number): boolean {
    return this.hoverPointerIds.has(pointerId);
  }

  /**
   * Indicates whether any pointer is currently pressed down on the object.
   *
   * @returns True if one or more pointers are pressed down, false otherwise
   *
   * @description
   * Computed from the size of the pressPointerIds Set. Returns true when any
   * pointer is pressed down on the interactive object, supporting both single
   * and multitouch scenarios while maintaining backward compatibility.
   *
   * @readonly
   */
  get isPress(): boolean {
    return this.pressPointerIds.size > 0;
  }

  /**
   * Indicates whether the object is currently enabled for interactions.
   *
   * @returns True if the object is enabled, false if disabled
   *
   * @description
   * This getter provides read-only access to the internal enabled state.
   * When enabled, the object can respond to pointer interactions; when disabled,
   * the object becomes non-interactive and displays in disabled visual state.
   *
   * @readonly
   *
   * @see {@link enable} - Method to enable the object
   * @see {@link disable} - Method to disable the object
   * @see {@link switchEnable} - Method to toggle enabled state
   */
  get enabled(): boolean {
    return this._enable;
  }

  /**
   * The display object being managed by this interaction handler.
   *
   * @description
   * This readonly reference maintains the connection between the handler
   * and the Three.js display object (Mesh, Sprite, or Group).
   *
   * @readonly
   */
  readonly view: ClickableView<Value>;

  /**
   * Set of pointer IDs currently in pressed state.
   *
   * @description
   * Tracks all pointer IDs that have triggered down events but not yet
   * corresponding up events. Used for multitouch support and same-ID
   * click detection. The Set automatically prevents duplicate pointer ID
   * storage and provides O(1) add/delete/has operations.
   *
   * @internal
   */
  protected pressPointerIds: Set<number> = new Set();

  /**
   * Set of pointer IDs currently hovering over the object.
   *
   * @description
   * Tracks all pointer IDs that have entered the object area but not yet
   * left. Used for multitouch hover state management. Multiple pointers
   * can simultaneously hover over the same interactive object.
   *
   * @internal
   */
  protected hoverPointerIds: Set<number> = new Set();

  /**
   * Internal state tracking enabled/disabled status.
   * @internal
   */
  protected _enable: boolean = true;

  /**
   * Controls whether this object is scannable by MouseEventManager during interaction detection.
   *
   * @description
   * When false, MouseEventManager will skip this object during checkTarget() processing,
   * preventing it from receiving any pointer events. This is different from enable/disable
   * which only affects handler-level processing.
   *
   * @default true
   */
  public interactionScannable: boolean = true;

  /**
   * @deprecated Use interactionScannable instead. Will be removed in next major version.
   */
  public get mouseEnabled(): boolean {
    return this.interactionScannable;
  }

  /**
   * @deprecated Use interactionScannable instead. Will be removed in next major version.
   */
  public set mouseEnabled(value: boolean) {
    this.interactionScannable = value;
  }

  /**
   * Internal storage for frozen state.
   */
  private _frozen: boolean = false;

  /**
   * Temporarily prevents interaction handling while maintaining current visual state.
   *
   * @description
   * When frozen is true, the object stops responding to pointer interactions
   * but preserves its current visual state (does not switch to disable state).
   * Useful when you want to temporarily pause interactions without changing
   * the visual appearance to disabled.
   *
   * @default false
   */
  public get frozen(): boolean {
    return this._frozen;
  }

  public set frozen(value: boolean) {
    this._frozen = value;
    if (value) {
      // Clear all pointer interaction states when freezing
      this.pressPointerIds.clear();
      this.hoverPointerIds.clear();
    }
  }

  /**
   * Current visual interaction state of the object.
   *
   * @description
   * Represents the current state used for material selection:
   * - `normal`: Default resting state
   * - `over`: Pointer hovering over the object
   * - `down`: Pointer pressed down on the object
   * - `disable`: Object is disabled and non-interactive
   */
  public state: ClickableState = "normal";

  /**
   * Internal reference to the material set.
   * @internal
   */
  protected _materialSet?: StateMaterialSet;

  /**
   * Internal alpha multiplier for opacity control.
   * @internal
   */
  protected _alpha: number = 1.0;

  /**
   * Creates a new ButtonInteractionHandler instance.
   *
   * @param parameters - Configuration object containing view and optional material set
   *
   * @description
   * Initializes the interaction handler with the specified display object and optional
   * material set. The handler immediately applies the initial material state upon creation.
   *
   * This constructor is typically not called directly by end users. Instead, it is invoked
   * internally by display object constructors (ClickableMesh, ClickableSprite) or conversion
   * utility functions (convertToClickableMesh, convertToClickableSprite).
   *
   * @example
   * ```typescript
   * // Example 1: Creating clickable object from geometry and materials using ClickableMesh constructor
   * import { ClickableMesh, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
   * import { BoxGeometry, MeshBasicMaterial } from 'three';
   *
   * const materials = new StateMaterialSet({
   *   normal: new MeshBasicMaterial({ color: 0x0000ff }),
   *   over: new MeshBasicMaterial({ color: 0x00ff00 }),
   *   down: new MeshBasicMaterial({ color: 0xff0000 })
   * });
   *
   * const clickableMesh = new ClickableMesh({
   *   geo: new BoxGeometry(1, 1, 1),
   *   material: materials
   * });
   *
   * clickableMesh.interactionHandler.value = { id: 'button1', action: 'save' };
   *
   * // Example 2: Converting existing Mesh to clickable using convertToClickableMesh
   * import { convertToClickableMesh } from '@masatomakino/threejs-interactive-object';
   * import { Mesh } from 'three';
   *
   * const existingMesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
   * const convertedClickable = convertToClickableMesh<string>(existingMesh);
   * convertedClickable.interactionHandler.value = 'converted-button';
   *
   * // Listen for click events
   * convertedClickable.interactionHandler.on('click', (event) => {
   *   console.log('Button clicked:', convertedClickable.interactionHandler.value);
   * });
   * ```
   *
   * @remarks
   * For most use cases, prefer using ClickableMesh/ClickableSprite constructors for new objects
   * or convertToClickable* utility functions for existing objects, rather than instantiating
   * ButtonInteractionHandler directly.
   *
   * @see {@link ClickableMesh} - Recommended for creating new clickable mesh objects
   * @see {@link convertToClickableMesh} - Recommended for converting existing Mesh objects
   */
  constructor(parameters: ButtonInteractionHandlerParameters<Value>) {
    super();
    this.view = parameters.view;
    this._materialSet ??= parameters.material;
    this.updateMaterial();
  }

  /**
   * Handles pointer down events and transitions to pressed state.
   *
   * @param event - The pointer down event containing interaction details
   *
   * @description
   * Processes pointer down events by checking activity status, adding the pointer ID
   * to the pressed set, transitioning to "down" visual state, and emitting the down event.
   * Supports multiple simultaneous pointers. If the object is inactive (disabled or frozen),
   * the event is ignored.
   *
   * @fires down - Emitted when the pointer is successfully pressed down
   */
  public onMouseDownHandler(event: ThreeMouseEvent<Value>): void {
    if (!this.checkActivity()) return;
    this.pressPointerIds.add(event.pointerId);
    this.updateState("down");
    this.emit(event.type, event);
  }

  /**
   * Handles pointer up events and manages click detection logic with multi-touch suppression.
   *
   * @param event - The pointer up event containing interaction details
   *
   * @description
   * Processes pointer up events by checking for same-pointer-ID press state,
   * removing the pointer from the pressed set, determining the next visual state
   * based on hover status, and emitting the up event. Click events are only
   * triggered when the same pointer ID was previously pressed down (same-ID click detection).
   *
   * **Multi-touch Click Suppression**: When a click is triggered, all remaining pressed
   * pointers are cleared to prevent subsequent click events. This matches native browser
   * behavior where multi-touch gestures suppress synthetic click events.
   *
   * @motivation Browser behavior investigation on iPad revealed that multi-touch interactions
   * naturally suppress click events. This implementation replicates that behavior by clearing
   * the press map after the first successful click, preventing additional pointers from
   * triggering subsequent clicks during the same multi-touch interaction.
   *
   * @fires up - Emitted when the pointer is released
   * @fires click - Emitted when a complete same-ID click interaction is detected.
   *               Only the first completing pointer in a multi-touch scenario triggers this event.
   */
  public onMouseUpHandler(event: ThreeMouseEvent<Value>): void {
    // Check if this specific pointer was pressed before removing it
    const wasThisPointerPressed = this.pressPointerIds.has(event.pointerId);
    this.pressPointerIds.delete(event.pointerId);

    if (!this.checkActivity()) return;

    // Phase 1: Complete state updates before emitting any events
    if (wasThisPointerPressed) {
      // Multi-touch click suppression: Clear all remaining press states
      // to prevent subsequent pointers from triggering click events
      this.pressPointerIds.clear();
    }
    // Update to final state (considers all cleared press states)
    this.updateState(this.calculateCurrentState());

    // Phase 2: Emit events with complete, accurate state
    this.emit(event.type, event);

    if (wasThisPointerPressed) {
      this.onMouseClick(); // Call just before click event emission
      const clickEvent = createThreeMouseEvent("click", this, event.pointerId);
      this.emit(clickEvent.type, clickEvent);
    }
  }

  /**
   * Hook method called when a click interaction is detected.
   *
   * @description
   * This method is called when a complete click interaction occurs (pointer down
   * followed by pointer up). Subclasses can override this method to implement
   * custom click behavior. The base implementation is empty.
   *
   * @remarks
   * This method is called before the click event is emitted, allowing subclasses
   * to modify state or perform actions that should occur during the click process.
   */
  public onMouseClick(): void {}

  /**
   * Handles pointer over events.
   *
   * @param event - The pointer over event containing interaction details
   *
   * @description
   * Delegates to the common over/out handler to manage hover state transitions.
   *
   * @fires over - Emitted when the pointer enters the object area
   */
  public onMouseOverHandler(event: ThreeMouseEvent<Value>): void {
    this.onMouseOverOutHandler(event);
  }

  /**
   * Handles pointer out events.
   *
   * @param event - The pointer out event containing interaction details
   *
   * @description
   * Delegates to the common over/out handler to manage hover state transitions.
   *
   * @fires out - Emitted when the pointer leaves the object area
   */
  public onMouseOutHandler(event: ThreeMouseEvent<Value>): void {
    this.onMouseOverOutHandler(event);
  }

  /**
   * Common handler for pointer over and out events.
   *
   * @param event - The pointer over or out event
   *
   * @description
   * Manages hover state tracking and visual state transitions for both over and out events.
   * Supports multiple simultaneous pointers by managing a Set of hover pointer IDs.
   * Hover state tracking occurs unconditionally (even when disabled/frozen) to ensure
   * proper visual updates when the object transitions back to an active state while
   * pointers are still hovering over it.
   *
   * @remarks
   * The hover state must be tracked before checking activity status because:
   * - If the object becomes active while pointers are already over it,
   *   the visual state needs to immediately reflect the hover condition
   * - Without this tracking, the object would remain in "normal" state until
   *   the next pointer movement, causing visual inconsistency
   *
   * @internal
   */
  private onMouseOverOutHandler(event: ThreeMouseEvent<Value>): void {
    // Track hover state regardless of activity status to ensure proper visual updates
    // when transitioning from disabled/frozen to active state while pointer is over
    if (event.type === "over") {
      this.hoverPointerIds.add(event.pointerId);
    } else {
      this.hoverPointerIds.delete(event.pointerId);
    }

    // Reset press state when pointer leaves object to prevent click on release outside
    if (event.type === "out") {
      this.pressPointerIds.delete(event.pointerId);
    }

    if (!this.checkActivity()) return;

    this.updateState(this.calculateCurrentState());
    this.emit(event.type, event);
  }

  /**
   * Sets the opacity alpha multiplier for the material set.
   *
   * @param value - Alpha value between 0.0 (transparent) and 1.0 (opaque)
   *
   * @description
   * Controls the overall opacity of the interactive object by setting an alpha
   * multiplier that is applied to all materials in the material set. This allows
   * for fade effects while preserving the relative opacity differences between
   * different interaction states.
   */
  public set alpha(value: number) {
    this._alpha = value;
    this.updateMaterial();
  }

  /**
   * Updates the current interaction state and refreshes the visual representation.
   *
   * @param state - The new interaction state to apply
   *
   * @description
   * Changes the current interaction state and immediately updates the display
   * object's material to reflect the new state. This method coordinates state
   * management with visual feedback.
   *
   * @protected
   */
  protected updateState(state: ClickableState): void {
    this.state = state;
    this.updateMaterial();
  }

  /**
   * Checks if the object is currently active and can respond to interactions.
   *
   * @returns True if the object is enabled and not frozen, false otherwise
   *
   * @description
   * Determines whether the object should respond to pointer interactions by
   * checking both the enabled state and the frozen flag. An object must be
   * both enabled and not frozen to be considered active.
   *
   * @protected
   */
  protected checkActivity(): boolean {
    return this._enable && !this.frozen;
  }

  /**
   * Enables the interactive object, allowing it to respond to pointer interactions.
   *
   * @description
   * Sets the object to an enabled state, making it responsive to pointer interactions
   * and updating the interaction state to "normal". This is equivalent to calling
   * `switchEnable(true)`.
   */
  public enable(): void {
    this.switchEnable(true);
  }

  /**
   * Disables the interactive object, preventing response to pointer interactions.
   *
   * @description
   * Sets the object to a disabled state, making it unresponsive to pointer interactions
   * and updating the interaction state to "disable". This is equivalent to calling
   * `switchEnable(false)`.
   */
  public disable(): void {
    this.switchEnable(false);
  }

  /**
   * Updates the display object's material based on current state and settings.
   *
   * @description
   * Applies the current alpha multiplier to the material set and retrieves the
   * appropriate material for the current interaction state and enabled status.
   * The material is then applied to the display object based on its type
   * (Mesh, Sprite, or Group).
   *
   * @remarks
   * This method handles the coordination between the abstract state management
   * and the concrete Three.js material system. Groups are not currently supported
   * for material updates.
   *
   * @protected
   */
  protected updateMaterial(): void {
    this._materialSet?.setOpacity(this._alpha);
    const stateMat = this._materialSet?.getMaterial(this.state, this._enable);
    if (!stateMat) return;

    switch (this.view.type) {
      case "Mesh":
      case "Sprite":
        (this.view as ClickableMesh<Value> | ClickableSprite<Value>).material =
          stateMat.material;
        break;
      default:
        // Groups and future object types do not require material updates
        // This case provides safe handling for non-material objects
        break;
    }
  }

  /**
   * Switches the interactive object between enabled and disabled states.
   *
   * @param bool - True to enable, false to disable
   *
   * @description
   * Changes the enabled state of the interactive object and immediately updates
   * the interaction state and material. When enabled, the state becomes "normal";
   * when disabled, the state becomes "disable". All pointer states are cleared
   * when disabling to prevent stale multitouch interactions.
   *
   * @example
   * ```typescript
   * // Enable the button
   * handler.switchEnable(true);
   *
   * // Disable the button
   * handler.switchEnable(false);
   * ```
   */
  public switchEnable(bool: boolean): void {
    this._enable = bool;
    if (!bool) {
      // Clear all pointer interaction states when disabling
      this.pressPointerIds.clear();
      this.hoverPointerIds.clear();
      this.updateState("disable");
      return;
    }
    // On enabling, immediately reflect any existing pointer conditions
    this.updateState(this.calculateCurrentState());
  }

  /**
   * Calculates the appropriate interaction state based on current conditions.
   *
   * @returns The calculated interaction state
   *
   * @description
   * Determines the correct interaction state by evaluating enable status and pointer conditions
   * in priority order: disabled → pressed → hovering → normal. This method provides consistent
   * state calculation logic used by switchEnable and other state management operations.
   *
   * @remarks
   * State priority:
   * 1. If disabled, returns "disable"
   * 2. If any pointer is pressed, returns "down"
   * 3. If any pointer is hovering, returns "over"
   * 4. Otherwise returns "normal"
   *
   * @protected
   */
  protected calculateCurrentState(): ClickableState {
    if (!this._enable) return "disable";
    if (this.isPress) return "down";
    if (this.isOver) return "over";
    return "normal";
  }
}

/**
 * Legacy alias for ButtonInteractionHandler.
 *
 * @deprecated Use ButtonInteractionHandler instead. This class will be removed in next minor version.
 *
 * @description
 * This class exists solely for backward compatibility with existing codebases that may
 * be using the old ClickableObject class name. All functionality is identical to
 * ButtonInteractionHandler, but the class emits a console warning when instantiated
 * to encourage migration to the new class name.
 *
 * The class was renamed to improve clarity about its purpose. The original "Object" suffix
 * was ambiguous in the Three.js ecosystem where Object3D serves as the base class for
 * display objects. The "InteractionHandler" suffix clearly indicates that this class
 * specializes in pointer event handling and state management rather than being a display
 * object itself.
 *
 * @template Value - Type of value associated with the interactive object
 *
 * @example
 * ```typescript
 * // ❌ Deprecated usage
 * const handler = new ClickableObject({ view: mesh });
 *
 * // ✅ Recommended usage
 * const handler = new ButtonInteractionHandler({ view: mesh });
 * ```
 */
export class ClickableObject<Value> extends ButtonInteractionHandler<Value> {
  /**
   * Creates a ClickableObject instance (deprecated).
   *
   * @param parameters - Configuration parameters for the handler
   *
   * @deprecated Use ButtonInteractionHandler constructor instead
   */
  constructor(parameters: ButtonInteractionHandlerParameters<Value>) {
    console.warn(
      "This class is deprecated. Use ButtonInteractionHandler instead.",
    );
    super(parameters);
  }
}
