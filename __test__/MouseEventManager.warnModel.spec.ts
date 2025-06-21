import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

describe("MouseEventManager.implementsDepartedIClickableObject3D", () => {
  const managerScene = new MouseEventManagerScene();

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

  test("mouse move and warn", () => {
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
