import { describe, test, vi } from "vitest";
import { RadioButtonManager, RadioButtonSprite } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";
import {
  testInitManager,
  testRadioSelection,
  testRadioSelectionWithMouse,
} from "./RadioObject.js";

const spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

/**
 * テスト用のボタンを生成する関数。
 * @param buttonValue
 * @returns {RadioButtonSprite}
 */
const initButton = (buttonValue: any): RadioButtonSprite => {
  const button = new RadioButtonSprite(getSpriteMaterialSet());
  button.model.value = buttonValue;
  return button;
};

const manager: RadioButtonManager = new RadioButtonManager();
describe("RadioButtonSprite", () => {
  test("初期化", () => {
    testInitManager(manager, initButton);
  });

  test("選択変更", () => {
    testRadioSelection(manager);
  });

  test("マウスで選択変更", () => {
    testRadioSelectionWithMouse(manager);
  });
});
