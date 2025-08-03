/**
 * @fileoverview Interactive group view classes for Three.js pointer-interactive objects.
 *
 * This module provides the Group-based view layer for creating interactive container objects
 * that detect pointer interactions on their child Object3D elements. It follows a compositional
 * architecture where interaction logic is delegated to specialized handler classes while
 * extending Three.js Group.
 *
 * The module includes:
 * - ClickableGroup: Basic clickable group with button-like behavior for child objects
 *
 * ClickableGroup requires no StateMaterialSet since Three.js Groups have no material property
 * and requires MouseEventManager integration for pointer event processing.
 *
 * @see {@link MouseEventManager} - Event processing and raycasting system
 * @see {@link ButtonInteractionHandler} - Base interaction logic
 * @see {@link ThreeMouseEvent} - Event objects emitted by interaction handlers
 * @see {@link ClickableMesh} - Equivalent mesh-based interactive object
 * @see {@link ClickableSprite} - Equivalent sprite-based interactive object
 */

import { Group } from "three";
import { ButtonInteractionHandler, type IClickableObject3D } from "../index.js";

/**
 * Basic clickable group with button-like interaction behavior for child objects.
 *
 * @description
 * ClickableGroup extends Three.js Group to provide pointer interaction capabilities
 * for container objects. Unlike mesh and sprite variants, it detects interactions
 * on any child Object3D elements within the group rather than having its own
 * visual representation or material states.
 *
 * **Event Handling**: Events are emitted via the `interactionHandler` property, not directly
 * from the group. Use `group.interactionHandler.on('click', callback)` to listen for
 * ThreeMouseEvent objects. This delegation pattern separates rendering from event logic.
 *
 * The MouseEventManager will raycast against all child objects in this group and
 * report interactions as events from this group's handler. Unlike ClickableMesh and
 * ClickableSprite, ClickableGroup does not use StateMaterialSet since Three.js Group
 * objects have no material property and no visual representation.
 *
 * @template Value - Type of arbitrary data associated with this clickable group.
 *                   Defaults to unknown if not specified.
 *
 * @example
 * ```typescript
 * import { ClickableGroup } from '@masatomakino/threejs-interactive-object';
 * import { BoxGeometry, MeshBasicMaterial, Mesh, Group } from 'three';
 *
 * // Create a clickable group containing multiple visual elements
 * const buttonGroup = new ClickableGroup<string>();
 * buttonGroup.position.set(0, 5, 0);
 *
 * // Add visual elements as children
 * const background = new Mesh(
 *   new BoxGeometry(4, 2, 0.1),
 *   new MeshBasicMaterial({ color: 0x333333 })
 * );
 * buttonGroup.add(background);
 *
 * const label = new Mesh(
 *   new BoxGeometry(3, 1, 0.2),
 *   new MeshBasicMaterial({ color: 0xffffff })
 * );
 * label.position.z = 0.1;
 * buttonGroup.add(label);
 *
 * // Associate custom data with the group
 * buttonGroup.interactionHandler.value = "compound-button";
 *
 * // Handle click events on any child object
 * buttonGroup.interactionHandler.on('click', (e) => {
 *   console.log(`Clicked group: ${e.target.interactionHandler.value}`);
 *   // e.target is the ClickableGroup, not the individual child object
 * });
 *
 * // Add to scene for MouseEventManager to detect
 * scene.add(buttonGroup);
 * ```
 *
 * @see {@link ButtonInteractionHandler} - The interaction handler that manages events
 * @see {@link MouseEventManager} - Required for processing pointer events on child objects
 * @see {@link ThreeMouseEvent} - Event objects emitted by the interaction handler
 * @see {@link ClickableMesh} - Equivalent mesh-based interactive object with material states
 * @see {@link ClickableSprite} - Equivalent sprite-based interactive object with material states
 * @see {@link https://threejs.org/docs/#api/en/objects/Group} - Three.js Group documentation
 *
 * @public
 */
export class ClickableGroup<Value = unknown>
  extends Group
  implements IClickableObject3D<Value>
{
  /** The interaction handler that manages pointer events and state for this group. */
  readonly interactionHandler: ButtonInteractionHandler<Value>;

  /**
   * Creates a new clickable group with button-like interaction behavior for child objects.
   */
  constructor() {
    super();
    this.interactionHandler = new ButtonInteractionHandler<Value>({
      view: this,
    });
  }
}
