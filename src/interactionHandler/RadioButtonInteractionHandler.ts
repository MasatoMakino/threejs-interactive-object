/**
 * @fileoverview Radio button interaction handler extending CheckBoxInteractionHandler with exclusive selection behavior.
 *
 * Provides radio button-specific functionality including frozen state management for exclusive
 * selection control. Radio buttons work in groups where only one can be selected at a time,
 * managed by RadioButtonManager which controls the frozen state to prevent re-selection.
 *
 * Key differences from CheckBoxInteractionHandler:
 * - Frozen state prevents pointer interactions when selected
 * - External control via RadioButtonManager (does not self-manage frozen state)
 * - Exclusive group selection behavior
 *
 * @see {@link CheckBoxInteractionHandler} - Base class providing selection state management
 * @see {@link RadioButtonManager} - Required external manager for exclusive group control
 * @see {@link ButtonInteractionHandler} - Root base class for interaction handling
 */

import type { RadioButtonMesh, RadioButtonSprite } from "../index.js";
import {
  type ButtonInteractionHandlerParameters,
  CheckBoxInteractionHandler,
} from "./index.js";

/**
 * Radio button interaction handler with exclusive group selection behavior.
 *
 * @description
 * Extends CheckBoxInteractionHandler with radio button-specific exclusive selection behavior.
 * Radio buttons work in groups where only one can be selected at a time, managed externally
 * by RadioButtonManager. The frozen state prevents re-selection of already selected buttons.
 *
 * Unlike checkboxes, radio buttons require external group management and do not operate
 * independently. The RadioButtonManager controls both selection and frozen states across
 * the entire button group to maintain exclusive selection behavior.
 *
 * Typically instantiated internally by RadioButtonMesh/RadioButtonSprite constructors or
 * convertToRadioButton* utility functions, then managed by RadioButtonManager.
 *
 * @template Value - Type of arbitrary data associated with this radio button.
 *                   Used for identifying specific options in radio button groups.
 *
 * @example
 * ```typescript
 * // Creating radio buttons from geometry and materials
 * import { RadioButtonMesh, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { BoxGeometry, MeshBasicMaterial } from 'three';
 *
 * const materials = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x888888 }),
 *   over: new MeshBasicMaterial({ color: 0xaaaaaa }),
 *   selected: new MeshBasicMaterial({ color: 0xff0000 }),
 *   selectedOver: new MeshBasicMaterial({ color: 0xaa0000 })
 * });
 *
 * const radio1 = new RadioButtonMesh({
 *   geo: new BoxGeometry(1, 1, 1),
 *   material: materials
 * });
 * const radio2 = new RadioButtonMesh({
 *   geo: new BoxGeometry(1, 1, 1),
 *   material: materials
 * });
 *
 * radio1.interactionHandler.value = { id: 'option1', label: 'Choice A' };
 * radio2.interactionHandler.value = { id: 'option2', label: 'Choice B' };
 * ```
 *
 * @example
 * ```typescript
 * // Converting existing Mesh to radio button
 * import { convertToRadioButtonMesh, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
 *
 * const existingMesh1 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
 * const existingMesh2 = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
 * const convertedRadio1 = convertToRadioButtonMesh<string>(existingMesh1);
 * const convertedRadio2 = convertToRadioButtonMesh<string>(existingMesh2);
 *
 * // Set up materials for radio button states
 * const radioMaterials = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x888888 }),
 *   over: new MeshBasicMaterial({ color: 0xaaaaaa }),
 *   selected: new MeshBasicMaterial({ color: 0xff0000 }),
 *   selectedOver: new MeshBasicMaterial({ color: 0xaa0000 })
 * });
 * convertedRadio1.interactionHandler.materialSet = radioMaterials;
 * convertedRadio2.interactionHandler.materialSet = radioMaterials;
 *
 * convertedRadio1.interactionHandler.value = 'option1';
 * convertedRadio2.interactionHandler.value = 'option2';
 * ```
 *
 * @example
 * ```typescript
 * // RadioButtonManager setup (required for both approaches above)
 * import { RadioButtonManager } from '@masatomakino/threejs-interactive-object';
 *
 * // Create manager and add radio buttons to group
 * const radioManager = new RadioButtonManager<string>();
 * radioManager.addButton(radio1, radio2);
 *
 * // Listen for exclusive selection events from manager
 * radioManager.on('select', (event) => {
 *   console.log('Selected radio button:', event.interactionHandler?.value);
 *   // Only one radio button can be selected at a time
 * });
 * ```
 *
 * @see {@link CheckBoxInteractionHandler} - Base class providing selection state management
 * @see {@link RadioButtonManager} - Required external manager for exclusive group control
 * @see {@link RadioButtonMesh} - Radio button mesh implementation
 * @see {@link RadioButtonSprite} - Radio button sprite implementation
 * @see {@link convertToRadioButtonMesh} - Utility for converting existing Mesh objects
 *
 * @public
 */
export class RadioButtonInteractionHandler<
  Value,
> extends CheckBoxInteractionHandler<Value> {
  declare readonly view: RadioButtonMesh<Value> | RadioButtonSprite<Value>;
  protected _isExclusivelySelected: boolean = false;

  /**
   * Checks if the radio button can respond to pointer interactions.
   *
   * @returns True if the radio button is enabled and not exclusively selected, false otherwise
   *
   * @description
   * Overrides the base checkActivity to include exclusive selection state consideration.
   * Radio buttons become exclusively selected when chosen to prevent re-selection, implementing
   * the exclusive selection behavior required for radio button groups.
   *
   * Activity status depends on both:
   * - `_enable` state (inherited from ButtonInteractionHandler)
   * - `_isExclusivelySelected` state (RadioButton-specific, controlled by RadioButtonManager)
   *
   * @override
   * @protected
   *
   * @remarks
   * The exclusive selection state is managed externally by RadioButtonManager, not by the
   * radio button itself. When a radio button is selected, RadioButtonManager
   * sets isExclusivelySelected=true to prevent further interactions.
   *
   * @see {@link RadioButtonManager.select} - External method that controls exclusive selection state
   */
  protected override checkActivity(): boolean {
    return this._enable && !this._isExclusivelySelected;
  }

  /**
   * Gets the current exclusive selection state of the radio button.
   *
   * @returns True if the radio button is exclusively selected (non-interactive), false otherwise
   *
   * @description
   * Returns the exclusive selection state that prevents re-selection of already selected radio buttons.
   * This state is controlled externally by RadioButtonManager to maintain exclusive
   * selection behavior in radio button groups. When a radio button is exclusively selected,
   * it becomes non-interactive to prevent re-selection of the same option.
   *
   * @readonly
   *
   * @see {@link RadioButtonManager.select} - External method that manages this state
   * @see {@link checkActivity} - Method that considers this state for interactivity
   */
  get isExclusivelySelected(): boolean {
    return this._isExclusivelySelected;
  }

  /**
   * Sets the exclusive selection state of the radio button.
   *
   * @param bool - True to mark as exclusively selected (make non-interactive), false to unmark
   *
   * @description
   * Controls the exclusive selection state for RadioButtonManager's exclusive selection behavior.
   * This setter is intended for external control by RadioButtonManager, not for self-management.
   *
   * When exclusively selected (true):
   * - Radio button becomes non-interactive (checkActivity returns false)
   * - Indicates the button is currently selected in the group
   * - Prevents re-selection of the same option
   *
   * When not exclusively selected (false):
   * - Radio button becomes interactive again
   * - Indicates the button is not selected and can be clicked
   *
   * @remarks
   * RadioButtonManager automatically manages this state during selection:
   * - Selected button: exclusively selected = true
   * - Unselected buttons: exclusively selected = false
   *
   * @see {@link RadioButtonManager.select} - External method that manages this state
   * @see {@link checkActivity} - Method that considers this state for interactivity
   */
  set isExclusivelySelected(bool: boolean) {
    this._isExclusivelySelected = bool;
  }

  /**
   * Gets the current frozen state of the radio button.
   *
   * @deprecated Use `isExclusivelySelected` instead. This property will be removed in the next minor version.
   *
   * @returns True if the radio button is frozen (selected and non-interactive), false otherwise
   *
   * @description
   * Legacy property for backward compatibility. Use `isExclusivelySelected` for better clarity
   * about the RadioButtonManager's exclusive selection behavior.
   *
   * @readonly
   *
   * @see {@link isExclusivelySelected} - Recommended replacement property
   */
  get isFrozen(): boolean {
    return this._isExclusivelySelected;
  }

  /**
   * Sets the frozen state of the radio button.
   *
   * @deprecated Use `isExclusivelySelected` instead. This property will be removed in the next minor version.
   *
   * @param bool - True to freeze (make non-interactive), false to unfreeze
   *
   * @description
   * Legacy setter for backward compatibility. Use `isExclusivelySelected` for better clarity
   * about the RadioButtonManager's exclusive selection behavior.
   *
   * @see {@link isExclusivelySelected} - Recommended replacement property
   */
  set isFrozen(bool: boolean) {
    this._isExclusivelySelected = bool;
  }

  /**
   * Forces selection state change for exclusive radio button group management.
   *
   * @param bool - True to select the radio button, false to deselect
   *
   * @description
   * Internal method specifically designed for RadioButtonManager to force selection
   * state changes during exclusive group management. This method ensures predictable
   * visual behavior in radio button groups:
   * - Selection (true): Forces normal state for consistent normalSelect material
   * - Deselection (false): Restores appropriate interaction state from internal flags
   *
   * @internal
   * @remarks
   * - This method is intended only for RadioButtonManager internal use
   * - Bypasses all activity checks (disabled/frozen states)
   * - Ensures exclusive selection groups have predictable visual appearance
   * - Selection: Forces normal state to guarantee normalSelect material display
   * - Deselection: Reconstructs state from flags (_enable) and aggregated getters (isPress, isOver)
   */
  public _setSelectionOverride(bool: boolean): void {
    this._isSelect = bool;
    if (bool) {
      // When selecting: Force normal state to ensure predictable normalSelect material
      this.updateState("normal");
    } else {
      // When deselecting: Restore proper state from internal flags
      const currentState = this.calculateCurrentState();
      this.updateState(currentState);
    }
  }
}

/**
 * Legacy alias for RadioButtonInteractionHandler.
 *
 * @deprecated Use RadioButtonInteractionHandler instead. This class will be removed in next minor version.
 *
 * @description
 * This class exists solely for backward compatibility. All functionality is identical to
 * RadioButtonInteractionHandler. See {@link ClickableObject} for details on the renaming rationale.
 *
 * @template Value - Type of value associated with the radio button
 *
 * @example
 * ```typescript
 * // ❌ Deprecated usage (still works but shows warning)
 * const radio = new RadioButtonObject({ view: mesh });
 *
 * // ✅ Recommended usage
 * const radio = new RadioButtonInteractionHandler({ view: mesh });
 * ```
 *
 * @see {@link RadioButtonInteractionHandler} - The recommended replacement class
 */
export class RadioButtonObject<
  Value,
> extends RadioButtonInteractionHandler<Value> {
  /**
   * Creates a RadioButtonObject instance (deprecated).
   *
   * @param parameters - Configuration parameters for the radio button handler
   *
   * @deprecated Use RadioButtonInteractionHandler constructor instead
   */
  constructor(parameters: ButtonInteractionHandlerParameters<Value>) {
    console.warn(
      "This class is deprecated. Use RadioButtonInteractionHandler instead.",
    );
    super(parameters);
  }
}
