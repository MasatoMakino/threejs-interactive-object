import { Event } from "three";
import { CheckBoxSprite, ThreeMouseEventUtil } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";
import { clickButton } from "./MouseControl.js";

const spyWarn = jest.spyOn(console, "warn").mockImplementation((x) => x);

/**
 * ボタンを生成する
 * @param value
 * @returns {CheckBoxSprite}
 */
const initButton = (value: any): CheckBoxSprite => {
  const button = new CheckBoxSprite(getSpriteMaterialSet());
  button.model.value = value;
  return button;
};

describe("CheckBoxSprite", () => {
  test("初期化", () => {
    const btn = initButton("button01");
    expect(btn.model.selection).toBe(false);
  });

  test("選択", () => {
    const btn = initButton("button01");
    btn.model.selection = true;
    expect(btn.model.selection).toBe(true);
  });

  test("マウスクリックで選択", () => {
    const btn = initButton("button01");
    const spy = jest
      .spyOn(btn, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    clickButton(btn);
    expect(spy).toHaveBeenCalledWith(
      ThreeMouseEventUtil.generate("select", btn),
    );
    expect(spy).toHaveBeenCalledWith(
      ThreeMouseEventUtil.generate("click", btn),
    );
    expect(btn.material.opacity).toBe(0.85);
  });
});
