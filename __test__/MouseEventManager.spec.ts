/**
 * @fileoverview MouseEventManager comprehensive integration tests
 *
 * @description
 * Tests comprehensive mouse/pointer event handling including throttling,
 * interaction state management, and overlapping object behavior.
 *
 * **Historical Note**: Despite the class name "MouseEventManager", this module
 * processes Pointer Events (pointermove, pointerdown, pointerup) rather than
 * traditional Mouse Events. The naming reflects the module's historical
 * development, but the actual implementation handles modern pointer interactions
 * including mouse, touch, and stylus inputs uniformly through the Pointer Events API.
 *
 * **Test Environment**: Uses MouseEventManagerScene and MouseEventManagerButton
 * helper classes to create a controlled Three.js environment with raycasting-based
 * interaction detection.
 */

import { Group } from "three";
import { describe, expect, test, vi } from "vitest";
import { ClickableGroup } from "../src/index.js";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

/**
 * Test environment interface for type safety and clarity
 *
 * @description
 * Defines the complete test environment structure returned by
 * createTestEnvironment helper function for MouseEventManager tests.
 */
interface TestEnvironment {
  managerScene: MouseEventManagerScene;
  wrapper: ClickableGroup;
  btn: MouseEventManagerButton;
  wrapperBackground: Group;
  btnBackground: MouseEventManagerButton;
  halfW: number;
  halfH: number;
}

/**
 * Creates a completely isolated test environment for MouseEventManager tests
 *
 * @returns Complete test environment with all necessary components
 *
 * @description
 * Generates a fresh, isolated test environment containing:
 * - MouseEventManagerScene with Three.js scene, camera, canvas, and MouseEventManager
 * - Primary ClickableGroup with button at Z=0
 * - Background Group with button at Z=-10 for overlap testing
 * - Canvas center coordinates for consistent pointer positioning
 *
 * Each call creates completely new instances, ensuring perfect test isolation
 * without any shared state between test executions.
 */
const createTestEnvironment = (): TestEnvironment => {
  const managerScene = new MouseEventManagerScene();

  const wrapper = new ClickableGroup();
  const btn = new MouseEventManagerButton();
  wrapper.add(btn.button);
  managerScene.scene.add(wrapper);

  const wrapperBackground = new Group();
  const btnBackground = new MouseEventManagerButton();
  wrapperBackground.position.setZ(-10);
  wrapperBackground.add(btnBackground.button);
  managerScene.scene.add(wrapperBackground);

  const halfW = MouseEventManagerScene.W / 2;
  const halfH = MouseEventManagerScene.H / 2;

  return {
    managerScene,
    wrapper,
    btn,
    wrapperBackground,
    btnBackground,
    halfW,
    halfH,
  };
};

/**
 * MouseEventManager core functionality tests with complete isolation
 *
 * @description
 * Comprehensive test suite for MouseEventManager's pointer event handling,
 * including throttling, state management, and interaction behavior with
 * overlapping objects.
 *
 * **Isolation Strategy**:
 * Each test creates its own completely isolated environment using the
 * createTestEnvironment() helper function. This ensures perfect test
 * isolation without shared state between test executions.
 *
 * **Test Environment Components**:
 * - Primary button in ClickableGroup at Z=0
 * - Background button at Z=-10 for overlap testing
 * - Canvas center coordinates for consistent pointer positioning
 * - Event throttling with 33ms default interval
 * - Fresh Three.js scene, camera, canvas, and MouseEventManager instances
 */
describe("MouseEventManager", () => {
  /**
   * Tests pointer move event handling with throttling behavior
   *
   * @description
   * Verifies that MouseEventManager properly processes pointer events (pointermove)
   * with throttling to prevent performance issues during rapid cursor movements.
   * Despite the test name "mouse move", this uses modern Pointer Events API.
   *
   * **Throttling Mechanism**:
   * - Default throttling interval: 33ms
   * - Events dispatched faster than 33ms are queued
   * - `interval(0.1)` advances time by 3.3ms (insufficient for processing)
   * - `interval()` advances time by 66ms (sufficient for processing)
   *
   * **Behavior Tested**:
   * - Rapid pointermove events are throttled and don't immediately trigger state changes
   * - Sufficient time progression allows event processing
   * - Hover state correctly transitions between normal and over
   * - Z-depth ordering affects which objects receive events
   */
  test("should throttle pointer move events and transition material states correctly", () => {
    const { managerScene, wrapper, btn, btnBackground, halfW, halfH } =
      createTestEnvironment();

    // Verify clean initial state
    btn.checkMaterial(
      "normal",
      "Initial material state should be normal - indicates proper initialization/reset",
    );

    // Dispatch rapid pointer movements
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

    // Events should be throttled - materials remain normal
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isOver).toBe(false);

    // Insufficient time advancement - still throttled
    managerScene.interval(0.1);
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    btn.checkMaterial("normal", "Should remain normal due to throttling");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isOver).toBe(false);

    // Sufficient time advancement - processing occurs
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    btn.checkMaterial("over");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isOver).toBe(true);

    // Move away - should return to normal state
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isOver).toBe(false);
  });

  /**
   * Tests pointer down/up event sequence and press state management
   *
   * @description
   * Validates MouseEventManager's handling of pointer press interactions
   * using pointerdown and pointerup events. Tests immediate state changes
   * without throttling delays (press events bypass throttling).
   *
   * **Press Interaction Flow**:
   * 1. pointerdown immediately triggers 'down' material state
   * 2. Press state (isPress) becomes true
   * 3. pointerup resets to normal material and clears press state
   * 4. Background objects remain unaffected due to Z-depth priority
   */
  test("should handle pointer down/up sequence with immediate state changes bypassing throttling", () => {
    const { managerScene, wrapper, btn, btnBackground, halfW, halfH } =
      createTestEnvironment();

    // Verify clean initial state
    btn.checkMaterial(
      "normal",
      "Initial material state should be normal - indicates proper initialization/reset",
    );

    // Pointer down should immediately trigger down state (no throttling)
    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    btn.checkMaterial("down");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(true);

    // Pointer up should immediately reset to normal state
    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(false);
  });

  /**
   * Tests interaction blocking behavior of disabled objects in overlapping scenarios
   *
   * @description
   * Verifies that disabled interactive objects block pointer events to objects
   * behind them, even though they don't respond to the events themselves.
   * This is important for UI layering where disabled buttons should prevent
   * accidental interactions with elements beneath.
   *
   * **Key Behavior**:
   * - Disabled objects maintain their position in the raycasting hierarchy
   * - Events are "consumed" by disabled objects but don't trigger visual changes
   * - Background objects remain non-interactive when blocked by disabled foreground objects
   * - Wrapper (parent) objects can still receive hover/press state updates
   *
   * **Z-depth Setup**:
   * - btn.button at Z=0 (foreground, disabled)
   * - btnBackground.button at Z=-10 (background, enabled but blocked)
   */
  test("should block background object interactions when foreground object is disabled", () => {
    const { managerScene, wrapper, btn, btnBackground, halfW, halfH } =
      createTestEnvironment();

    btn.button.interactionHandler.disable();
    btn.button.interactionHandler.mouseEnabled = true;

    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(false);
    expect(wrapper.interactionHandler.isOver).toBe(true);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(false);
    expect(wrapper.interactionHandler.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(true);
    expect(wrapper.interactionHandler.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(false);
    expect(wrapper.interactionHandler.isOver).toBe(false);
  });

  /**
   * Tests event pass-through behavior when mouseEnabled is false
   *
   * @description
   * Verifies that objects with mouseEnabled=false become transparent to pointer events,
   * allowing events to pass through to objects behind them. This is different from
   * disabled objects which block events but don't respond.
   *
   * **mouseEnabled vs disabled**:
   * - `disabled`: Objects block events but don't respond (events consumed)
   * - `mouseEnabled=false`: Objects don't participate in raycasting (events pass through)
   *
   * **Test Setup**:
   * - Both btn.button and wrapper have mouseEnabled=false
   * - btnBackground.button at Z=-10 becomes the primary interactive target
   * - Events pass through foreground objects to reach background
   *
   * **Expected Behavior**:
   * - Foreground objects remain visually unchanged
   * - Background objects receive and respond to all pointer events
   * - Wrapper objects don't register hover/press when mouseEnabled=false
   */
  test("should pass through pointer events to background when mouseEnabled is false", () => {
    const { managerScene, wrapper, btn, btnBackground, halfW, halfH } =
      createTestEnvironment();

    btn.button.interactionHandler.enable();
    btn.button.interactionHandler.mouseEnabled = false;
    wrapper.interactionHandler.mouseEnabled = false;
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("over");
    expect(wrapper.interactionHandler.isPress).toBe(false);
    expect(wrapper.interactionHandler.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(false);
    expect(wrapper.interactionHandler.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("down");
    expect(wrapper.interactionHandler.isPress).toBe(false);
    expect(wrapper.interactionHandler.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.interactionHandler.isPress).toBe(false);
    expect(wrapper.interactionHandler.isOver).toBe(false);
  });

  /**
   * Tests hover state tracking behavior when objects are disabled during interaction
   *
   * @description
   * Verifies the complex behavior when an interactive object is disabled while
   * the pointer is hovering over it. The object stops emitting events but continues
   * to track internal hover state for proper state management.
   *
   * **Critical Behavior**:
   * - Hover state tracking continues even when disabled
   * - Event emission stops when disabled (no over/out events fired)
   * - State transitions work correctly when re-enabled
   * - This prevents state inconsistencies during enable/disable cycles
   *
   * **State vs Events**:
   * - `isOver` property: Internal state tracking (continues when disabled)
   * - `over`/`out` events: Public notifications (stopped when disabled)
   *
   * **Use Case**: UI elements that may be disabled during hover (e.g., loading states)
   */
  test("should continue hover state tracking when disabled during pointer interaction", () => {
    const { managerScene, btn, halfW, halfH } = createTestEnvironment();

    const spyOverButton = vi.fn(() => true);
    const spyOutButton = vi.fn(() => true);

    btn.button.interactionHandler.enable();
    btn.button.interactionHandler.on("over", spyOverButton);
    btn.button.interactionHandler.on("out", spyOutButton);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    expect(spyOverButton).toBeCalledTimes(1);
    expect(btn.button.interactionHandler.isOver).toBe(true);
    spyOverButton.mockClear();

    // Disable while hovering: state changes but no events emitted
    btn.button.interactionHandler.disable();
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    expect(spyOutButton).not.toBeCalled(); // No out event when disabled
    expect(btn.button.interactionHandler.isOver).toBe(false); // But state updates
    spyOutButton.mockClear();

    // Move back over while disabled: state tracks but no events
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    expect(spyOverButton).not.toBeCalled(); // No over event when disabled
    expect(btn.button.interactionHandler.isOver).toBe(true); // But state updates
    spyOverButton.mockClear();

    // Move away while disabled: state updates, no events
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    expect(btn.button.interactionHandler.isOver).toBe(false);
    spyOutButton.mockClear();
    spyOverButton.mockClear();

    // Re-enable and hover: events resume normally
    btn.button.interactionHandler.enable();
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    expect(spyOverButton).toBeCalledTimes(1); // Events work again

    // Clean up event listeners
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    btn.button.interactionHandler.off("over", spyOverButton);
    btn.button.interactionHandler.off("out", spyOutButton);
  });

  /**
   * Tests click event propagation through object hierarchy
   *
   * @description
   * Verifies that click events are properly generated and propagated when
   * a complete pointer down/up sequence occurs. Tests both individual object
   * and parent container event handling.
   *
   * **Click Event Requirements**:
   * - Must have pointerdown followed by pointerup on same target
   * - Events propagate to parent objects in the hierarchy
   * - Both child and parent receive click notifications
   *
   * **Event Flow**:
   * 1. pointerdown on btn.button (at halfW, halfH)
   * 2. pointerup on same location
   * 3. Click events fire for both btn.button and wrapper (parent)
   */
  test("should propagate click events to both target object and parent container", () => {
    const { managerScene, wrapper, btn, halfW, halfH } =
      createTestEnvironment();

    const spyClickButton = vi.fn(() => true);
    const spyClickGroup = vi.fn(() => true);

    // Set up click event listeners for both child and parent
    btn.button.interactionHandler.on("click", spyClickButton);
    wrapper.interactionHandler.on("click", spyClickGroup);

    // Perform complete click sequence: down → up
    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

    // Both button and parent group should receive click events
    expect(spyClickButton).toHaveBeenCalledTimes(1);
    expect(spyClickGroup).toHaveBeenCalledTimes(1);

    // Clean up event listeners
    btn.button.interactionHandler.off("click", spyClickButton);
    wrapper.interactionHandler.off("click", spyClickGroup);
  });

  /**
   * Tests hover event deduplication to prevent excessive event firing
   *
   * @description
   * Verifies that MouseEventManager correctly deduplicates hover events
   * to prevent multiple 'over' events from firing when the pointer remains
   * within the same interactive object's bounds.
   *
   * **Event Deduplication Logic**:
   * - First pointer move into object bounds → fires 'over' event
   * - Subsequent moves within same bounds → no additional 'over' events
   * - Move outside bounds → may fire 'out' event
   * - Re-enter bounds → fires new 'over' event
   *
   * **Performance Benefit**:
   * Prevents unnecessary event processing and UI updates during
   * continuous pointer movement within the same interactive area.
   *
   * **Test Sequence**:
   * 1. Enter object bounds → over event fires
   * 2. Move within bounds → no additional over events
   * 3. Exit bounds → preparation for re-entry
   * 4. Re-enter bounds → over event fires again
   */
  test("should deduplicate hover events within same object bounds to prevent excessive firing", () => {
    const { managerScene, btn, halfW, halfH } = createTestEnvironment();

    const spyOver = vi.fn(() => true);
    btn.button.interactionHandler.on("over", spyOver);

    // Initial setup: move away then move to center
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    expect(spyOver).toBeCalledTimes(1); // First entry fires over event
    spyOver.mockClear();

    // Move slightly within same object bounds - should not fire over event
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW + 1, halfH + 1);
    expect(spyOver).not.toBeCalled(); // No additional over event
    spyOver.mockClear();

    // Move outside object bounds - prepares for potential re-entry
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    expect(spyOver).not.toBeCalled(); // Moving out doesn't trigger over
    spyOver.mockClear();

    // Re-enter object bounds - should fire over event again
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    expect(spyOver).toBeCalledTimes(1); // Re-entry fires new over event
    spyOver.mockClear();

    // Clean up event listener
    btn.button.interactionHandler.off("over", spyOver);
  });
});
