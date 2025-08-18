/**
 * @packageDocumentation
 * @fileoverview RadioButton exclusive selection management system.
 *
 * This module provides the RadioButtonManager class for managing exclusive
 * selection behavior among radio button interactive objects. It ensures only
 * one radio button can be selected at a time within a managed group.
 */

import EventEmitter from "eventemitter3";
import {
  type IClickableObject3D,
  type RadioButtonInteractionHandler,
  type ThreeMouseEvent,
  type ThreeMouseEventMap,
  ThreeMouseEventUtil,
} from "./index.js";

/**
 * Manages exclusive selection behavior for radio button interactive objects.
 *
 * @description
 * RadioButtonManager coordinates multiple RadioButtonInteractionHandler instances
 * to ensure exclusive selection (only one selected at a time). It extends EventEmitter
 * to broadcast selection changes and provides convenient methods for adding/removing
 * radio buttons from the managed group.
 *
 * @template Value - Type of arbitrary data associated with the radio button objects
 *
 * @example
 * ```typescript
 * // Create radio button meshes
 * const option1 = new RadioButtonMesh(geometry, materials, { value: "option1" });
 * const option2 = new RadioButtonMesh(geometry, materials, { value: "option2" });
 * const option3 = new RadioButtonMesh(geometry, materials, { value: "option3" });
 *
 * // Create manager for exclusive selection
 * const radioManager = new RadioButtonManager<string>();
 * radioManager.addButton(option1, option2, option3);
 *
 * // Listen for selection changes
 * radioManager.on("select", (event) => {
 *   console.log("Selected:", event.interactionHandler.value);
 * });
 *
 * // Programmatically select an option
 * radioManager.select(option2.interactionHandler);
 * console.log(radioManager.selected.value); // "option2"
 * ```
 *
 * @fires select - Emitted when selection changes to a different radio button
 *
 * @see {@link RadioButtonInteractionHandler} - Individual radio button logic
 * @see {@link RadioButtonMesh} - 3D mesh radio button implementation
 * @see {@link ThreeMouseEvent} - Event objects emitted by the manager
 */
export class RadioButtonManager<Value = unknown> extends EventEmitter<
  ThreeMouseEventMap<Value>
> {
  /**
   * Array of radio button interaction handlers under management.
   * @internal
   */
  protected _interactionHandlers: RadioButtonInteractionHandler<Value>[] = [];

  /**
   * Currently selected radio button interaction handler.
   * @internal
   */
  protected _selected: RadioButtonInteractionHandler<Value> | undefined;

  /**
   * Adds radio button interactive objects to the managed group.
   *
   * @description
   * Registers multiple radio button objects for exclusive selection management.
   * Each button's interaction handler will be added to the managed group and
   * configured to participate in the exclusive selection behavior.
   *
   * @param buttons - Variable number of radio button interactive objects to add
   *
   * @example
   * ```typescript
   * const radioManager = new RadioButtonManager();
   * const option1 = new RadioButtonMesh(geometry, materials);
   * const option2 = new RadioButtonMesh(geometry, materials);
   *
   * // Add multiple buttons at once
   * radioManager.addButton(option1, option2);
   * ```
   */
  public addButton(...buttons: IClickableObject3D<Value>[]): void {
    buttons.forEach((btn) => {
      this.addInteractionHandler(
        btn.interactionHandler as RadioButtonInteractionHandler<Value>,
      );
    });
  }

  /**
   * Adds a radio button interaction handler to the managed group.
   *
   * @description
   * Registers a RadioButtonInteractionHandler for exclusive selection management
   * and sets up event listeners to respond to selection changes.
   *
   * @param interactionHandler - RadioButtonInteractionHandler to add to the group
   */
  public addInteractionHandler(
    interactionHandler: RadioButtonInteractionHandler<Value>,
  ): void {
    this._interactionHandlers.push(interactionHandler);
    interactionHandler.on("select", this.onSelectedButton);
  }

  /**
   * Handles selection events from managed radio button handlers.
   *
   * @description
   * Internal event handler that responds to "select" events from managed
   * RadioButtonInteractionHandlers. When a button becomes selected, it
   * triggers the exclusive selection logic.
   *
   * @param e - ThreeMouseEvent containing selection information
   * @internal
   */
  private onSelectedButton = (e: ThreeMouseEvent<Value>) => {
    if (e.isSelected) {
      this.select(e.interactionHandler as RadioButtonInteractionHandler<Value>);
    }
  };

  /**
   * Removes a radio button interactive object from the managed group.
   *
   * @description
   * Unregisters the radio button from exclusive selection management and
   * removes event listeners. The button object itself is not destroyed.
   *
   * @param button - Radio button interactive object to remove from the group
   */
  public removeButton(button: IClickableObject3D<Value>): void {
    this.removeInteractionHandler(
      button.interactionHandler as RadioButtonInteractionHandler<Value>,
    );
  }

  /**
   * Removes a radio button interaction handler from the managed group.
   *
   * @description
   * Unregisters the RadioButtonInteractionHandler from exclusive selection
   * management, removes event listeners, and removes it from the internal array.
   *
   * @param interactionHandler - RadioButtonInteractionHandler to remove
   * @returns The removed RadioButtonInteractionHandler instance
   */
  public removeInteractionHandler(
    interactionHandler: RadioButtonInteractionHandler<Value>,
  ): RadioButtonInteractionHandler<Value> {
    const index = this._interactionHandlers.indexOf(interactionHandler);
    if (index > -1) {
      this._interactionHandlers.splice(index, 1);
      interactionHandler.off("select", this.onSelectedButton);
    }
    return interactionHandler;
  }

  /**
   * Programmatically selects a specific radio button in the managed group.
   *
   * @description
   * Sets the specified RadioButtonInteractionHandler as selected and deselects
   * all others in the group, implementing exclusive selection behavior. Emits
   * a "select" event to notify listeners of the selection change.
   *
   * @param interactionHandler - RadioButtonInteractionHandler to select
   *
   * @example
   * ```typescript
   * const radioManager = new RadioButtonManager();
   * const option1 = new RadioButtonMesh(geometry, materials);
   * const option2 = new RadioButtonMesh(geometry, materials);
   *
   * radioManager.addButton(option1, option2);
   *
   * // Programmatically select option2
   * radioManager.select(option2.interactionHandler);
   * ```
   *
   * @fires select - Emitted when selection changes to the specified handler
   */
  public select(
    interactionHandler: RadioButtonInteractionHandler<Value>,
  ): void {
    const index = this._interactionHandlers.indexOf(interactionHandler);
    if (index === -1) {
      console.warn("管理下でないボタンが選択処理されました。");
      return;
    }

    // Ignore if the same button is already selected and exclusively selected
    if (
      interactionHandler === this._selected &&
      interactionHandler.isExclusivelySelected
    ) {
      return;
    }

    this._selected = interactionHandler;
    for (const mdl of this._interactionHandlers) {
      mdl.isExclusivelySelected = mdl === interactionHandler;
      mdl._setSelectionOverride(mdl === interactionHandler);
    }

    const evt = ThreeMouseEventUtil.generate("select", interactionHandler);
    this.emit(evt.type, evt);
  }

  /**
   * Gets the currently selected radio button interaction handler.
   *
   * @description
   * Returns the RadioButtonInteractionHandler instance that is currently
   * selected in the managed group. Will be undefined if no selection has
   * been made yet.
   *
   * @returns Currently selected RadioButtonInteractionHandler or undefined
   *
   * @example
   * ```typescript
   * const radioManager = new RadioButtonManager<string>();
   * const option = new RadioButtonMesh(geometry, materials, { value: "test" });
   *
   * radioManager.addButton(option);
   * radioManager.select(option.interactionHandler);
   *
   * console.log(radioManager.selected.value); // "test"
   * ```
   */
  get selected(): RadioButtonInteractionHandler<Value> | undefined {
    return this._selected;
  }

  /**
   * Gets all radio button interaction handlers under management.
   *
   * @description
   * Returns a reference to the internal array containing all
   * RadioButtonInteractionHandler instances managed by this instance.
   *
   * @returns Array of managed RadioButtonInteractionHandler instances
   */
  get interactionHandlers(): RadioButtonInteractionHandler<Value>[] {
    return [...this._interactionHandlers];
  }
}
