/**
 * @fileoverview Checkbox interaction handler extending ButtonInteractionHandler with toggle selection behavior.
 *
 * Provides checkbox-specific functionality including selection state management,
 * toggle behavior on pointer interactions, and selection-aware material updates.
 *
 * @see {@link ButtonInteractionHandler} - Base interaction handler class
 * @see {@link StateMaterialSet} - Material state management with selection variants
 */

import {
  type CheckBoxMesh,
  type CheckBoxSprite,
  ThreeMouseEventUtil,
} from "../index.js";
import {
  ButtonInteractionHandler,
  type ButtonInteractionHandlerParameters,
} from "./index.js";

/**
 * Checkbox interaction handler that extends ButtonInteractionHandler with selection state management.
 *
 * @description
 * Extends ButtonInteractionHandler with checkbox-specific toggle selection behavior.
 * Maintains internal selection state that toggles on pointer interactions and integrates
 * with StateMaterialSet for selection-aware visual feedback.
 *
 * Typically instantiated internally by CheckBoxMesh/CheckBoxSprite constructors or
 * convertToCheckbox* utility functions rather than directly by end users.
 *
 * @template Value - Type of arbitrary data associated with this checkbox.
 *                   Used for identifying specific checkboxes in multi-checkbox scenarios.
 *
 * @fires select - Emitted when selection state changes via pointer interaction
 *
 * @example
 * ```typescript
 * // Example 1: Creating checkbox from geometry and materials using CheckBoxMesh constructor
 * import { CheckBoxMesh, StateMaterialSet } from '@masatomakino/threejs-interactive-object';
 * import { BoxGeometry, MeshBasicMaterial } from 'three';
 *
 * const materials = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x0000ff }),
 *   over: new MeshBasicMaterial({ color: 0x00ff00 }),
 *   down: new MeshBasicMaterial({ color: 0xff0000 }),
 *   selected: new MeshBasicMaterial({ color: 0x0000aa }),
 *   selectedOver: new MeshBasicMaterial({ color: 0x00aa00 })
 * });
 *
 * const checkboxMesh = new CheckBoxMesh({
 *   geo: new BoxGeometry(1, 1, 1),
 *   material: materials
 * });
 *
 * checkboxMesh.interactionHandler.value = { id: 'option1', label: 'Enable feature' };
 *
 * // Example 2: Converting existing Mesh to checkbox using convertToCheckboxMesh
 * import { convertToCheckboxMesh } from '@masatomakino/threejs-interactive-object';
 * import { Mesh } from 'three';
 *
 * const existingMesh = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
 * const convertedCheckbox = convertToCheckboxMesh<string>(existingMesh);
 * convertedCheckbox.interactionHandler.value = 'converted-option';
 *
 * // Listen for selection changes
 * convertedCheckbox.interactionHandler.on('select', (event) => {
 *   console.log('Checkbox selection changed:', convertedCheckbox.interactionHandler.selection);
 *   console.log('Associated data:', convertedCheckbox.interactionHandler.value);
 * });
 * ```
 *
 * @see {@link ButtonInteractionHandler} - Base interaction handler class
 * @see {@link StateMaterialSet} - Material state management with selection support
 * @see {@link CheckBoxMesh} - Checkbox mesh implementation
 * @see {@link CheckBoxSprite} - Checkbox sprite implementation
 * @see {@link convertToCheckboxMesh} - Utility for converting existing Mesh objects
 *
 * @public
 */
export class CheckBoxInteractionHandler<
  Value,
> extends ButtonInteractionHandler<Value> {
  declare readonly view: CheckBoxMesh<Value> | CheckBoxSprite<Value>;
  protected _isSelect: boolean = false;

  /**
   * Handles pointer click interactions by toggling selection state and emitting select events.
   *
   * @description
   * Overrides base onMouseClick to implement checkbox toggle behavior. Toggles internal
   * selection state, emits select event, and updates material for visual feedback.
   *
   * @fires select - Emitted with the updated selection state after toggling
   * @override
   * @remarks Called automatically on complete pointer interactions.
   */
  public override onMouseClick(): void {
    this._isSelect = !this._isSelect;

    const e = ThreeMouseEventUtil.generate("select", this);
    this.emit(e.type, e);
    this.updateMaterial();
  }

  /**
   * Gets the current selection state of the checkbox.
   *
   * @returns True if the checkbox is currently selected, false otherwise
   *
   * @readonly
   */
  public get selection(): boolean {
    return this._isSelect;
  }

  /**
   * Sets the selection state of the checkbox programmatically.
   *
   * @param bool - True to select the checkbox, false to deselect
   *
   * @description
   * Programmatically controls selection state without triggering pointer interactions
   * or select events. Updates internal state and triggers material update while
   * preserving current interaction state (hover, disable, etc.).
   *
   * @remarks
   * - Respects disabled and frozen states via checkActivity() validation
   * - Does not emit select events, preventing recursive updates when synchronizing
   *   with external application logic
   * - Preserves current visual state (hover, press) for consistent user experience
   */
  public set selection(bool: boolean) {
    if (!this.checkActivity()) return;
    this._isSelect = bool;
    this.updateMaterial();
  }

  /**
   * Updates the display object's material based on current interaction and selection state.
   *
   * @description
   * Overrides base updateMaterial to include selection state awareness.
   * Passes selection state to StateMaterialSet.getMaterial() for selection-aware
   * material variants (e.g., normalSelect, overSelect).
   *
   * @override
   * @protected
   */
  protected override updateMaterial(): void {
    this.materialSet?.setOpacity(this._alpha);
    const stateMat = this.materialSet?.getMaterial(
      this.state,
      this._enable,
      this._isSelect,
    );
    if (stateMat?.material != null) {
      this.view.material = stateMat.material;
    }
  }
}

/**
 * Legacy alias for CheckBoxInteractionHandler.
 *
 * @deprecated Use CheckBoxInteractionHandler instead. This class will be removed in next minor version.
 *
 * @description
 * This class exists solely for backward compatibility. All functionality is identical to
 * CheckBoxInteractionHandler. See {@link ClickableObject} for details on the renaming rationale.
 *
 * @template Value - Type of value associated with the checkbox
 *
 * @example
 * ```typescript
 * // ❌ Deprecated usage (still works but shows warning)
 * const checkbox = new CheckBoxObject({ view: mesh });
 *
 * // ✅ Recommended usage
 * const checkbox = new CheckBoxInteractionHandler({ view: mesh });
 * ```
 *
 * @see {@link CheckBoxInteractionHandler} - The recommended replacement class
 */
export class CheckBoxObject<Value> extends CheckBoxInteractionHandler<Value> {
  /**
   * Creates a CheckBoxObject instance (deprecated).
   *
   * @param parameters - Configuration parameters for the checkbox handler
   *
   * @deprecated Use CheckBoxInteractionHandler constructor instead
   */
  constructor(parameters: ButtonInteractionHandlerParameters<Value>) {
    console.warn(
      "This class is deprecated. Use CheckBoxInteractionHandler instead.",
    );
    super(parameters);
  }
}
