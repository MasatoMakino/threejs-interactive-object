import { ClickableState, MouseEventManager } from "../src";
import { MouseEventManagerButton } from "./MouseEventManagerButton";
import { MouseEventManagerScene } from "./MouseEventManagerScene";

describe("MouseEventManager", () => {
  const managerScene = new MouseEventManagerScene();
  const btn = new MouseEventManagerButton();
  managerScene.scene.add(btn.button);
  const halfW = managerScene.canvas.width / 2;
  const halfH = managerScene.canvas.height / 2;

  test("Init", () => {
    expect(MouseEventManager.isInit).toBe(true);
    managerScene.reset();
  });

  test("mouse move", () => {
    btn.checkMaterial(ClickableState.NORMAL);
    managerScene.render();

    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    managerScene.render();
    //スロットリングされるのでnormalのまま
    btn.checkMaterial(ClickableState.NORMAL);

    //スロットリングされるのでnormalのまま
    managerScene.interval(0.1);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.OVER);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial(ClickableState.NORMAL);

    managerScene.reset();
  });

  test("mouse down", () => {
    btn.checkMaterial(ClickableState.NORMAL);
    managerScene.render();

    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial(ClickableState.DOWN);

    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
  });
});
