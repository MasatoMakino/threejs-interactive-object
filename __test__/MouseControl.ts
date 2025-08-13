import { expect, vi } from "vitest";
import {
  type ClickableMesh,
  type ClickableSprite,
  type IClickableObject3D,
  MouseEventManager,
  type StateMaterial,
  type StateMaterialSet,
  type ThreeMouseEventMap,
  ThreeMouseEventUtil,
} from "../src/index.js";

/**
 * Simulates a complete mouse click interaction on a button
 *
 * @param button - Target interactive object implementing IClickableObject3D
 *
 * @description
 * Performs a full click sequence by calling interaction handlers in order:
 * 1. Mouse over (onMouseOverHandler)
 * 2. Mouse down (onMouseDownHandler)
 * 3. Mouse up (onMouseUpHandler)
 *
 * This simulates realistic user interaction and triggers all associated
 * events and material state changes.
 */
export function clickButton(button: IClickableObject3D<unknown>) {
  button.interactionHandler.onMouseOverHandler(
    ThreeMouseEventUtil.generate("over", button),
  );
  button.interactionHandler.onMouseDownHandler(
    ThreeMouseEventUtil.generate("down", button),
  );
  button.interactionHandler.onMouseUpHandler(
    ThreeMouseEventUtil.generate("up", button),
  );
}

/**
 * Triggers specific mouse event and validates resulting material state
 *
 * @param target - ClickableMesh or ClickableSprite to test
 * @param type - Mouse event type from ThreeMouseEventMap
 * @param mat - Expected StateMaterial after the event
 *
 * @description
 * Calls the appropriate mouse event handler via MouseEventManager.onButtonHandler
 * and immediately validates that the target's material matches the expected
 * StateMaterial. Uses vitest expect assertion for validation.
 */
export function changeMaterialState(
  target: ClickableMesh | ClickableSprite,
  type: keyof ThreeMouseEventMap,
  mat: StateMaterial,
): void {
  MouseEventManager.onButtonHandler(target, type);
  expect(target.material).toBe(mat.material);
}

/**
 * Tests mouse over/out interaction behavior
 *
 * @param target - ClickableMesh or ClickableSprite to test
 * @param matSet - StateMaterialSet containing expected materials
 *
 * @description
 * Validates hover behavior by testing the complete over/out cycle twice:
 * 1. over -> out -> over -> out
 * Ensures materials change correctly between normal and over states
 * and that the interaction is repeatable.
 */
export function testMouseOver(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
): void {
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
}

/**
 * Tests disabled state behavior and re-enabling functionality
 *
 * @param target - ClickableMesh or ClickableSprite to test
 * @param matSet - StateMaterialSet containing expected materials
 *
 * @description
 * Validates disabled state behavior by:
 * 1. Disabling the target and testing that all mouse interactions
 *    (over, down, up, out) maintain the disable material
 * 2. Re-enabling the target and verifying normal interaction resumes
 *
 * This ensures disabled objects are completely unresponsive to mouse events.
 */
export function testDisable(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
) {
  target.interactionHandler.disable();
  changeMaterialState(target, "over", matSet.disable);
  changeMaterialState(target, "down", matSet.disable);
  changeMaterialState(target, "up", matSet.disable);
  changeMaterialState(target, "out", matSet.disable);

  target.interactionHandler.enable();
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
}

/**
 * Tests frozen state behavior and unfreezing functionality
 *
 * @param target - ClickableMesh or ClickableSprite to test
 * @param matSet - StateMaterialSet containing expected materials
 *
 * @description
 * Validates frozen state behavior by:
 * 1. Setting the target to normal state (out event)
 * 2. Freezing the target and testing that all mouse interactions
 *    (over, down, up, out) maintain the normal material
 * 3. Unfreezing the target and verifying normal interaction resumes
 *
 * Frozen objects maintain their current visual state regardless of mouse events.
 */
export function testFrozen(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
) {
  changeMaterialState(target, "out", matSet.normal);
  target.interactionHandler.frozen = true;
  changeMaterialState(target, "over", matSet.normal);
  changeMaterialState(target, "down", matSet.normal);
  changeMaterialState(target, "up", matSet.normal);
  changeMaterialState(target, "out", matSet.normal);

  target.interactionHandler.frozen = false;
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
}

/**
 * Tests enable/disable state switching functionality
 *
 * @param target - ClickableMesh or ClickableSprite to test
 * @param matSet - StateMaterialSet containing expected materials
 *
 * @description
 * Validates the switchEnable method by:
 * 1. Disabling the target (switchEnable(false)) and verifying disable material
 * 2. Enabling the target (switchEnable(true)) and verifying normal material
 *
 * This tests the convenience method for toggling enabled state and
 * ensuring immediate material updates.
 */
export function testSwitch(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
) {
  target.interactionHandler.switchEnable(false);
  expect(target.material).toBe(matSet.disable.material);

  target.interactionHandler.switchEnable(true);
  expect(target.material).toBe(matSet.normal.material);
}

/**
 * Tests that mouse up alone does not trigger click events
 *
 * @param target - ClickableMesh or ClickableSprite to test
 *
 * @description
 * Validates that performing only a mouse up action:
 * 1. Triggers the 'up' event (expected behavior)
 * 2. Does NOT trigger the 'click' event (must have down+up sequence)
 *
 * This ensures click events require the complete interaction sequence.
 */
export function testMouseUP(target: ClickableMesh | ClickableSprite) {
  const spyUp = vi.fn(() => {});
  const spyClick = vi.fn(() => {});
  target.interactionHandler.on("click", spyClick);
  target.interactionHandler.on("up", spyUp);

  target.interactionHandler.onMouseUpHandler(
    ThreeMouseEventUtil.generate("up", target),
  );
  expect(spyUp).toBeCalled();
  expect(spyClick).not.toBeCalled();
}

/**
 * Tests complete click interaction and event emission
 *
 * @param target - ClickableMesh or ClickableSprite to test
 *
 * @description
 * Validates that performing a complete click sequence (via clickButton helper):
 * 1. Calls mouse event handlers in correct order (over -> down -> up)
 * 2. Successfully dispatches the 'click' event
 *
 * This ensures the full click interaction chain works correctly and
 * click events are properly emitted.
 */
export function testClick(target: ClickableMesh | ClickableSprite) {
  const spyClick = vi.fn(() => {});
  target.interactionHandler.on("click", spyClick);
  clickButton(target);
  expect(spyClick).toBeCalled();
}
