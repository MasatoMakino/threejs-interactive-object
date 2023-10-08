import { Group } from "three";
import { ClickableGroup, MouseEventManager } from "../src/index.js";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

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
    btn.checkMaterial("normal");
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);

    //スロットリングされるのでnormalのまま
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isOver).toBe(false);

    //スロットリングされるのでnormalのまま
    managerScene.interval(0.1);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial("over");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isOver).toBe(true);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isOver).toBe(false);

    managerScene.reset();
  });

  test("mouse down / mouse up", () => {
    btn.checkMaterial("normal");

    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial("down");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isPress).toBe(true);

    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isPress).toBe(false);

    managerScene.reset();
  });

  /**
   * disableボタンの背面のオブジェクトは、すべて操作が遮られる
   */
  test("disable and overlap", () => {
    btn.button.model.disable();
    btn.button.model.mouseEnabled = true;

    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(true);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isPress).toBe(true);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial("disable");
    btnBackground.checkMaterial("normal");
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
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("over");
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("down");
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    btn.checkMaterial("normal");
    btnBackground.checkMaterial("normal");
    expect(wrapper.model.isPress).toBe(false);
    expect(wrapper.model.isOver).toBe(false);

    btn.button.model.mouseEnabled = true;
    wrapper.model.mouseEnabled = true;
    managerScene.reset();
  });

  /**
   * マウスオーバー中にdisableに変更された場合、マウスアウト / マウスオーバー判定だけは続行される
   */
  test("disable in over", () => {
    const spyOverButton = jest.fn((e) => true);
    const spyOutButton = jest.fn((e) => true);

    btn.button.model.enable();
    btn.button.model.on("over", spyOverButton);
    btn.button.model.on("out", spyOutButton);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    expect(spyOverButton).toBeCalled();
    expect(btn.button.model.isOver).toBe(true);
    spyOverButton.mockClear();

    //マウスオーバーのままdisableに変更すると、イベントは発行されないがポインターオーバー状態は変化する。
    btn.button.model.disable();
    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    expect(spyOutButton).not.toBeCalled();
    expect(btn.button.model.isOver).toBe(false);
    spyOutButton.mockClear();

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    expect(spyOverButton).not.toBeCalled();
    expect(btn.button.model.isOver).toBe(true);
    spyOverButton.mockClear();

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    expect(btn.button.model.isOver).toBe(false);
    spyOutButton.mockClear();
    spyOverButton.mockClear();

    //ボタンの再活性化直後にoverしても反応する。
    btn.button.model.enable();
    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    expect(spyOverButton).toBeCalled();

    managerScene.reset();
  });

  test("click", () => {
    const spyClickButton = jest.fn((e) => true);
    const spyClickGroup = jest.fn((e) => true);

    btn.button.model.on("click", spyClickButton);
    wrapper.model.on("click", spyClickGroup);

    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);

    expect(spyClickButton).toHaveBeenCalledTimes(1);
    expect(spyClickGroup).toHaveBeenCalledTimes(1);

    btn.button.model.off("click", spyClickButton);
    wrapper.model.off("click", spyClickGroup);

    managerScene.reset();
  });

  test("multiple over", () => {
    const spyOver = jest.fn((e) => true);

    btn.button.model.on("over", spyOver);

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

    btn.button.model.off("over", spyOver);
    managerScene.reset();
  });
});
