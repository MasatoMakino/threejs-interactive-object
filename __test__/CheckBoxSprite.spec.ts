import { Event, SpriteMaterial } from "three";
import {
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
  CheckBoxSprite,
  ISelectableObject3D
} from "../src/index";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

/**
 * マテリアルセットを生成する
 * @returns {StateMaterialSet}
 */
const initMaterial = () => {
  return new StateMaterialSet({
    normal: new SpriteMaterial({
      color: 0xffffff,
      opacity: 0.6,
      transparent: true
    }),
    over: new SpriteMaterial({
      color: 0xffffff,
      opacity: 0.8,
      transparent: true
    }),
    down: new SpriteMaterial({
      color: 0xffffff,
      opacity: 1.0,
      transparent: true
    }),
    normalSelect: new SpriteMaterial({
      color: 0xff00ff,
      opacity: 0.65,
      transparent: true
    }),
    overSelect: new SpriteMaterial({
      color: 0xff00ff,
      opacity: 0.85,
      transparent: true
    }),
    downSelect: new SpriteMaterial({
      color: 0xff00ff,
      opacity: 0.95,
      transparent: true
    })
  });
};

/**
 * ボタンを生成する
 * @param value
 * @returns {CheckBoxSprite}
 */
const initButton = (value: any): CheckBoxSprite => {
  const button = new CheckBoxSprite(initMaterial());
  button.value = value;
  return button;
};

/**
 * クリックして選択
 * @param {ISelectableObject3D} button
 */
const clickButton = (button: ISelectableObject3D) => {
  button.onMouseOverHandler(
    new ThreeMouseEvent(ThreeMouseEventType.OVER, button)
  );
  button.onMouseDownHandler(
    new ThreeMouseEvent(ThreeMouseEventType.DOWN, button)
  );
  button.onMouseUpHandler(new ThreeMouseEvent(ThreeMouseEventType.UP, button));
};

describe("CheckBoxSprite", () => {
  test("初期化", () => {
    const btn = initButton("button01");
    expect(btn.selection).toBe(false);
  });

  test("選択", () => {
    const btn = initButton("button01");
    btn.selection = true;
    expect(btn.selection).toBe(true);
  });

  test("マウスクリックで選択", () => {
    const btn = initButton("button01");
    const spy = jest
      .spyOn(btn, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    clickButton(btn);

    expect(spy).toHaveBeenCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.SELECT, btn)
    );
    expect(spy).toHaveBeenCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.CLICK, btn)
    );
    expect(btn.material.opacity).toBe(0.85);
  });
});
