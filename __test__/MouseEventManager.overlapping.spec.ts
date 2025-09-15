/**
 * @fileoverview MouseEventManager overlapping object behavior tests
 *
 * @description
 * Tests specific behavior of MouseEventManager when interactive objects are
 * positioned behind non-interactive Three.js meshes. Verifies that regular
 * meshes do not interfere with raycasting to interactive objects.
 *
 * **Historical Context**: The "mouse" terminology refers to the original
 * naming convention, but these tests use Pointer Events (pointermove, pointerdown,
 * pointerup) for broad device compatibility including touch and stylus inputs.
 *
 * **Test Scenario**:
 * - Interactive ClickableMesh positioned at Z=-10 (background)
 * - Regular non-interactive Mesh positioned at Z=0 (foreground)
 * - Pointer events should reach the interactive object despite geometric occlusion
 *
 * **Key Principle**: MouseEventManager's raycasting specifically targets objects
 * implementing IClickableObject3D, ignoring regular Three.js meshes in the hit test.
 */

import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

/**
 * Tests that non-interactive meshes don't obstruct interactive object events
 *
 * @description
 * Verifies the core principle that MouseEventManager's raycasting system
 * specifically targets interactive objects (implementing IClickableObject3D)
 * and ignores regular Three.js geometry, even when regular meshes are
 * geometrically positioned in front of interactive objects.
 *
 * **Test Architecture**:
 * - `overlappedButton`: Interactive ClickableMesh at Z=-10 (behind)
 * - `frontMesh`: Regular non-interactive Mesh at Z=0 (in front)
 * - Both objects occupy the same screen space (halfW, halfH)
 *
 * **Raycasting Behavior**:
 * MouseEventManager uses selective raycasting that only considers objects
 * in its internal interactive object registry, allowing pointer events to
 * "pass through" regular geometry to reach interactive targets behind them.
 *
 * **Practical Use Case**: UI overlays, HUD elements, or decorative geometry
 * that shouldn't interfere with interactive game objects or interface elements.
 */
describe("MouseEventManager : Ensure front-facing general Mesh does not obstruct events of InteractiveMesh at the back", () => {
  const halfW = MouseEventManagerScene.W / 2;
  const halfH = MouseEventManagerScene.H / 2;

  const managerScene = new MouseEventManagerScene();
  const btn = new MouseEventManagerButton();
  managerScene.scene.add(btn.button);
  btn.button.name = "overlappedButton";
  btn.button.position.setZ(-10);

  // Non-interactive mesh positioned in front of interactive button
  const frontMesh = new Mesh(
    new BoxGeometry(3, 3, 3),
    new MeshBasicMaterial({ color: 0xff0000 }),
  );
  frontMesh.name = "frontMesh";
  managerScene.scene.add(frontMesh);

  /**
   * Reset test environment to ensure consistent initial conditions
   *
   * @description
   * Clears any residual interaction state and ensures both interactive
   * and non-interactive objects start from a known baseline state.
   */
  beforeEach(() => {
    managerScene.reset();
  });

  /**
   * Clean up any test artifacts to prevent interference between tests
   */
  afterEach(() => {
    vi.resetAllMocks();
  });

  /**
   * Tests pointer move events pass through non-interactive geometry
   *
   * @description
   * Verifies that pointer move events (pointermove) successfully reach
   * the interactive button despite the non-interactive mesh being
   * geometrically positioned in front of it.
   *
   * **Expected Behavior**:
   * 1. Pointer at (halfW, halfH) hits both frontMesh and overlappedButton
   * 2. MouseEventManager ignores frontMesh (non-interactive)
   * 3. overlappedButton receives the pointer event and transitions to 'over' state
   * 4. Moving pointer away returns button to 'normal' state
   *
   * **Demonstrates**: Selective raycasting that prioritizes interactive objects
   * over geometric z-ordering.
   */
  test("should allow pointer events to reach interactive objects behind non-interactive meshes", () => {
    // Verify clean initial state
    btn.checkMaterial(
      "normal",
      "Initial material should be normal - indicates proper initialization/reset",
    );

    // Pointer move to center: should pass through frontMesh to reach interactive button
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    btn.checkMaterial("over"); // Interactive button responds despite being behind frontMesh

    // Move pointer away: button returns to normal state
    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    btn.checkMaterial("normal");
  });

  /**
   * Tests pointer press events pass through non-interactive geometry
   *
   * @description
   * Verifies that pointer press interactions (pointerdown/pointerup) successfully
   * reach the interactive button despite geometric occlusion by non-interactive mesh.
   * Press events bypass throttling and should respond immediately.
   *
   * **Press Event Flow**:
   * 1. pointerdown at (halfW, halfH) → hits both objects
   * 2. MouseEventManager ignores frontMesh, routes to overlappedButton
   * 3. overlappedButton immediately transitions to 'down' state
   * 4. pointerup → overlappedButton returns to 'normal' state
   *
   * **Demonstrates**: Complete interaction sequences work correctly regardless
   * of non-interactive geometry positioning.
   */
  test("should process pointer press interactions through non-interactive geometry occlusion", () => {
    // Verify clean initial state
    btn.checkMaterial(
      "normal",
      "Initial material should be normal - indicates proper initialization/reset",
    );

    // Pointer down: should pass through frontMesh to interactive button
    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    btn.checkMaterial("down"); // Button responds to press despite being behind frontMesh

    // Pointer up: completes interaction sequence
    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);
    btn.checkMaterial("normal"); // Returns to normal state
  });

  /**
   * Tests complete click interaction through non-interactive geometry
   *
   * @description
   * Verifies that a complete click interaction (pointerdown followed by pointerup)
   * successfully generates click events for interactive objects positioned behind
   * non-interactive geometry.
   *
   * **Click Event Requirements**:
   * - Both pointerdown and pointerup must target the same interactive object
   * - Non-interactive geometry must not interfere with event routing
   * - Click event should fire exactly once for complete interaction sequence
   *
   * **Test Validation**: Uses event spy to confirm click event emission,
   * proving that the entire interaction chain works through geometric occlusion.
   */
  test("should generate click events for interactive objects despite geometric occlusion by regular meshes", () => {
    const spyClickButton = vi.fn(() => true);

    // Set up click event listener
    btn.button.interactionHandler.on("click", spyClickButton);

    // Perform complete click sequence through non-interactive frontMesh
    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

    // Click event should fire despite geometric occlusion
    expect(spyClickButton).toHaveBeenCalledTimes(1);

    // Clean up event listener
    btn.button.interactionHandler.off("click", spyClickButton);
  });
});
