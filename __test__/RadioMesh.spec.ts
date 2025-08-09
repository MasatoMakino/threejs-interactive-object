import { BoxGeometry } from "three";
import { describe, expect, test } from "vitest";
import { RadioButtonManager, RadioButtonMesh } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { testRadioSelectionWithMouse } from "./RadioObject.js";

/**
 * テスト用のボタンを生成する関数。
 * @param buttonValue
 * @returns {RadioButtonMesh}
 */
const initButton = (buttonValue: unknown): RadioButtonMesh => {
  const button = new RadioButtonMesh({
    geo: new BoxGeometry(3, 3, 3),
    material: getMeshMaterialSet(),
  });
  button.interactionHandler.value = buttonValue;
  return button;
};

describe("RadioButtonMesh", () => {
  test("should create radio button mesh with proper interaction handler", () => {
    const button = initButton("mesh-test");

    expect(button, "RadioButtonMesh instance should be created").toBeDefined();
    expect(
      button.interactionHandler,
      "Should have radio button interaction handler",
    ).toBeDefined();
    expect(
      button.interactionHandler.value,
      "Handler should preserve assigned value",
    ).toBe("mesh-test");
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
    const button1 = initButton("mesh1");
    const button2 = initButton("mesh2");
    const button3 = initButton("mesh3");
    const testManager = new RadioButtonManager();

    testManager.addButton(button1, button2, button3);

    // Test mouse-driven selection integration
    testRadioSelectionWithMouse(testManager);
  });
});
