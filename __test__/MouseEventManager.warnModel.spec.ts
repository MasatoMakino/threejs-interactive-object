/**
 * @fileoverview MouseEventManager deprecated property warning tests
 *
 * @description
 * Tests warning behavior when MouseEventManager encounters objects with
 * deprecated properties from earlier versions of the interactive object system.
 *
 * **Historical Context**: The `model` property was used in earlier versions
 * of the interactive object system but has been deprecated in favor of more
 * explicit interaction handler patterns. This test ensures proper deprecation
 * warnings are displayed when legacy code is encountered.
 *
 * **Pointer Events Note**: Despite "mouse" terminology in function names,
 * this test uses modern Pointer Events (pointermove) for broad device compatibility.
 */

import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

/**
 * Tests deprecated IClickableObject3D.model property warning system
 *
 * @description
 * Verifies that MouseEventManager properly detects and warns about usage
 * of the deprecated `model` property on objects that partially implement
 * the legacy IClickableObject3D interface.
 *
 * **Legacy Support**: The system maintains backward compatibility by detecting
 * objects with deprecated properties and issuing warnings, while still allowing
 * the application to function.
 *
 * **Test Setup**:
 * - Creates a regular Three.js Mesh (non-interactive)
 * - Artificially adds deprecated `model` property
 * - Triggers MouseEventManager processing to detect deprecated usage
 *
 * **Expected Behavior**: Warning should be issued when MouseEventManager
 * processes pointer events and encounters the deprecated property structure.
 */
describe("MouseEventManager.implementsDepartedIClickableObject3D", () => {
  const managerScene = new MouseEventManagerScene();

  // Create mesh with deprecated 'model' property to simulate legacy code
  const btn = new Mesh(new BoxGeometry(3, 3, 3), new MeshBasicMaterial());
  // biome-ignore lint/suspicious/noExplicitAny: Test for deprecated property
  (btn as any).model = {};
  managerScene.scene.add(btn);

  const halfW = MouseEventManagerScene.W / 2;
  const halfH = MouseEventManagerScene.H / 2;

  beforeEach(() => {
    managerScene.reset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test("should emit deprecation warnings when encountering objects with legacy 'model' property during pointer processing", () => {
    const spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);
    managerScene.dispatchMouseEvent("pointermove", 0, 0);

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    expect(spyWarn).toHaveBeenCalledWith(
      expect.stringContaining(
        "Deprecated: IClickableObject3D.model is deprecated.",
      ),
    );
  });
});
