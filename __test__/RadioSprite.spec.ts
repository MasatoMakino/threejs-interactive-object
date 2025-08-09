import { describe, test, vi } from "vitest";
import { RadioButtonManager, RadioButtonSprite } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";
import {
  testInitManager,
  testRadioSelection,
  testRadioSelectionWithMouse,
} from "./RadioObject.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

/**
 * テスト用のボタンを生成する関数。
 * @param buttonValue
 * @returns {RadioButtonSprite}
 */
const initButton = (buttonValue): RadioButtonSprite => {
  const button = new RadioButtonSprite(getSpriteMaterialSet());
  button.interactionHandler.value = buttonValue;
  return button;
};

const manager: RadioButtonManager = new RadioButtonManager();
describe("RadioButtonSprite", () => {
  test("should initialize manager with radio button sprites", () => {
    testInitManager(manager, initButton);
  });

  test("should handle exclusive selection behavior", () => {
    testRadioSelection(manager);
  });

  test("should handle mouse-driven selection", () => {
    testRadioSelectionWithMouse(manager);
  });
});
