import { Event } from "three";
import {
  ThreeMouseEvent,
  ThreeMouseEventType,
  CheckBoxSprite
} from "../src/index";
import { getSpriteMaterialSet } from "../__test__/Materials";
import { clickButton } from "../__test__/MouseControl";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

/**
 * ボタンを生成する
 * @param value
 * @returns {CheckBoxSprite}
 */
const initButton = (value: any): CheckBoxSprite => {
  const button = new CheckBoxSprite(getSpriteMaterialSet());
  button.value = value;
  return button;
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
