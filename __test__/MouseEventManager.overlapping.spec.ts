import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

describe("MouseEventManager : Ensure front-facing general Mesh does not obstruct events of InteractiveMesh at the back", () => {
  const halfW = MouseEventManagerScene.W / 2;
  const halfH = MouseEventManagerScene.H / 2;

  const managerScene = new MouseEventManagerScene();
  const btn = new MouseEventManagerButton();
  managerScene.scene.add(btn.button);
  btn.button.name = "overlappedButton";
  btn.button.position.setZ(-10);

  const frontMesh = new Mesh(
    new BoxGeometry(3, 3, 3),
    new MeshBasicMaterial({ color: 0xff0000 }),
  );
  frontMesh.name = "frontMesh";
  managerScene.scene.add(frontMesh);

  beforeEach(() => {
    managerScene.reset();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("mouse move", () => {
    btn.checkMaterial(
      "normal",
      "マテリアルの初期状態はnormal。それ以外なら初期化かリセットに失敗している。",
    );

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
    btn.checkMaterial("over");

    managerScene.interval();
    managerScene.dispatchMouseEvent("pointermove", 0, 0);
    btn.checkMaterial("normal");
  });

  test("mouse down / mouse up", () => {
    btn.checkMaterial(
      "normal",
      "マテリアルの初期状態はnormal。それ以外なら初期化かリセットに失敗している。",
    );

    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    btn.checkMaterial("down");

    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);
    btn.checkMaterial("normal");
  });

  test("click", () => {
    const spyClickButton = vi.fn((e) => true);

    btn.button.interactionHandler.on("click", spyClickButton);

    managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
    managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

    expect(spyClickButton).toHaveBeenCalledTimes(1);

    btn.button.interactionHandler.off("click", spyClickButton);
  });
});
