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
  test("初期化", () => {
    testInitManager(manager, initButton);
  });

  test("選択変更", () => {
    testRadioSelection(manager);
  });

  test("管理外のボタンを選択", () => {
    const notManagedButton = initButton("notManagedButton");
    manager.select(notManagedButton.interactionHandler);
    expect(spyWarn).toHaveBeenCalledWith(
      "管理下でないボタンが選択処理されました。",
    );

    //管理外のボタンをremoveしてもエラーは発生しない。
    expect(manager.removeButton(notManagedButton)).toBeUndefined();
  });

  test("ボタンを管理から外す", () => {
    const index = 4;
    const handler = manager.interactionHandlers[index];
    manager.removeInteractionHandler(handler);
    expect(manager.interactionHandlers.length).toEqual(4);
  });

  test("マウスで選択変更", () => {
    testRadioSelectionWithMouse(manager);
  });
});
