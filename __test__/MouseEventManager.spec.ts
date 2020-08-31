import { Group } from "three";
import { ClickableState, MouseEventManager } from "../src";
import { MouseEventManagerButton } from "./MouseEventManagerButton";
import { MouseEventManagerScene } from "./MouseEventManagerScene";

describe("MouseEventManager", () => {
  const managerScene = new MouseEventManagerScene();

  const wrapper = new Group();
  const btn = new MouseEventManagerButton();
  wrapper.add(btn.button);
  managerScene.scene.add(wrapper);

  const wrapperBackground = new Group();
  const btnBackground = new MouseEventManagerButton();
  wrapperBackground.position.setZ(-10);
  wrapperBackground.add(btnBackground.button);
  managerScene.scene.add(wrapperBackground);

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
    btnBackground.checkMaterial(ClickableState.NORMAL);

    //スロットリングされるのでnormalのまま
    managerScene.interval(0.1);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.OVER);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.reset();
  });

  test("mouse down", () => {
    btn.checkMaterial(ClickableState.NORMAL);
    managerScene.render();

    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial(ClickableState.DOWN);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    managerScene.reset();
  });

  test("disable and overlap", () => {
    btn.button.model.disable();

    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    //disableボタンの背面のオブジェクトは、すべて操作が遮られる
  });
});
