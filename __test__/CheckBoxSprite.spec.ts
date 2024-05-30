import { describe, expect, test, vi } from "vitest";
import { CheckBoxSprite } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";
import { clickButton } from "./MouseControl.js";

const spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

/**
 * ボタンを生成する
 * @param value
 * @returns {CheckBoxSprite}
 */
const initButton = (value: any): CheckBoxSprite => {
  const button = new CheckBoxSprite(getSpriteMaterialSet());
  button.interactionHandler.value = value;
  return button;
};

describe("CheckBoxSprite", () => {
  test("初期化", () => {
    const btn = initButton("button01");
    expect(btn.interactionHandler.selection).toBe(false);
  });

  test("選択", () => {
    const btn = initButton("button01");
    btn.interactionHandler.selection = true;
    expect(btn.interactionHandler.selection).toBe(true);
  });

  test("マウスクリックで選択", () => {
    const btn = initButton("button01");

    const spySelect = vi.fn((e) => {});
    const spyClick = vi.fn((e) => {});
    btn.interactionHandler.on("click", spyClick);
    btn.interactionHandler.on("select", spySelect);

    clickButton(btn);
    expect(spySelect).toBeCalled();
    expect(spyClick).toBeCalled();
    expect(btn.material.opacity).toBe(0.85);
  });
});
