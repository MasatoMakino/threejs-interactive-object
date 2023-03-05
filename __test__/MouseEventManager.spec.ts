import { Group } from "three";
import { ClickableGroup, ClickableState, MouseEventManager } from "../src";
import { MouseEventManagerButton } from "./MouseEventManagerButton";
import { MouseEventManagerScene } from "./MouseEventManagerScene";

describe("MouseEventManager", () => {
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

  test("mouse move", () => {
    btn.checkMaterial(ClickableState.NORMAL);
    managerScene.render();

    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    managerScene.render();
    //スロットリングされるのでnormalのまま
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isOver).toBe(false);

    //スロットリングされるのでnormalのまま
    managerScene.interval(0.1);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.OVER);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isOver).toBe(true);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.reset();
  });

  test("mouse down / mouse up", () => {
    btn.checkMaterial(ClickableState.NORMAL);
    managerScene.render();

    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial(ClickableState.DOWN);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(true);

    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(false);

    managerScene.reset();
  });

  /**
   * disableボタンの背面のオブジェクトは、すべて操作が遮られる
   */
  test("disable and overlap", () => {
    btn.button.model.disable();
    btn.button.model.mouseEnabled = true;

    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(true);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(true);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial(ClickableState.DISABLE);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.reset();
  });

  /**
   * mouseEnabled : falseのボタンはマウス操作の対象外。
   * 操作は背面に透過する。
   */
  test("mouseEnabled : false and overlap", () => {
    btn.button.model.enable();
    btn.button.model.mouseEnabled = false;
    wrapper.model.mouseEnabled = false;
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.OVER);
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.DOWN);
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial(ClickableState.NORMAL);
    btnBackground.checkMaterial(ClickableState.NORMAL);
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    btn.button.model.mouseEnabled = true;
    wrapper.model.mouseEnabled = true;
    managerScene.reset();
  });

  test("click", () => {
    const spyClickButton = jest.fn((e) => e);
    const spyClickGroup = jest.fn((e) => e);
    btn.button.addEventListener("click", spyClickButton);
    wrapper.addEventListener("click", spyClickGroup);

    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);

    expect(spyClickButton).toHaveBeenCalledTimes(1);
    expect(spyClickGroup).toHaveBeenCalledTimes(1);

    btn.button.removeEventListener("click", spyClickButton);
    wrapper.removeEventListener("click", spyClickGroup);
    managerScene.reset();
  });

  test("multiple over", () => {
    const spyOver = jest.fn((e) => e);
    btn.button.addEventListener("over", spyOver);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    expect(spyOver).toBeCalled();
    spyOver.mockClear();

    //2度目はoverが呼び出されない
    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW + 1, halfH + 1);
    expect(spyOver).not.toBeCalled();
    spyOver.mockClear();

    //一度outする
    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    expect(spyOver).not.toBeCalled();
    spyOver.mockClear();

    //再度overすると呼び出される
    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    expect(spyOver).toBeCalled();
    spyOver.mockClear();

    btn.button.removeEventListener("over", spyOver);
    managerScene.reset();
  });
});
