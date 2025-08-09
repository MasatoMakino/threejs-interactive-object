import { describe, test, expect } from "vitest";
import { RadioButtonManager, RadioButtonSprite } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";
import { testRadioSelectionWithMouse } from "./RadioObject.js";

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

describe("RadioButtonSprite", () => {
  test("should create radio button sprite with proper interaction handler", () => {
    const button = initButton("sprite-test");

    expect(
      button,
      "RadioButtonSprite instance should be created",
    ).toBeDefined();
    expect(
      button.interactionHandler,
      "Should have radio button interaction handler",
    ).toBeDefined();
    expect(
      button.interactionHandler.value,
      "Handler should preserve assigned value",
    ).toBe("sprite-test");
    expect(
      button.interactionHandler.isFrozen,
      "New radio button should not be frozen",
    ).toBe(false);
    expect(
      button.interactionHandler.selection,
      "New radio button should not be selected",
    ).toBe(false);
  });

  test("should integrate with RadioButtonManager for mouse interactions", () => {
    const button1 = initButton("sprite1");
    const button2 = initButton("sprite2");
    const button3 = initButton("sprite3");
    const testManager = new RadioButtonManager();

    testManager.addButton(button1, button2, button3);

    // Test mouse-driven selection integration
    testRadioSelectionWithMouse(testManager);
  });
});
