import { BoxGeometry } from "three";
import { describe, expect, test, vi } from "vitest";
import { RadioButtonManager, RadioButtonMesh } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import {
  testInitManager,
  testRadioSelection,
  testRadioSelectionWithMouse,
} from "./RadioObject.js";

const spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

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

const manager: RadioButtonManager = new RadioButtonManager();

describe("RadioButton", () => {
  test("should initialize manager with radio button meshes", () => {
    testInitManager(manager, initButton);
  });

  test("should handle exclusive selection behavior", () => {
    testRadioSelection(manager);
  });

  test("should warn when selecting unmanaged button", () => {
    const notManagedButton = initButton("notManagedButton");
    manager.select(notManagedButton.interactionHandler);
    expect(spyWarn).toHaveBeenCalledWith(
      "管理下でないボタンが選択処理されました。",
    );

    //管理外のボタンをremoveしてもエラーは発生しない。
    expect(manager.removeButton(notManagedButton)).toBeUndefined();
  });

  test("should remove button from manager", () => {
    const index = 4;
    const handler = manager.interactionHandlers[index];
    manager.removeInteractionHandler(handler);
    expect(manager.interactionHandlers.length).toEqual(4);
  });

  test("should handle mouse-driven selection", () => {
    testRadioSelectionWithMouse(manager);
  });
});
