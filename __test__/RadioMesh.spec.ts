import { BoxBufferGeometry } from "three";
import { RadioButtonManager, RadioButtonMesh } from "../src/index";
import { getMeshMaterialSet } from "../__test__/Materials";
import {
  testRadioSelection,
  testRadioSelectionWithMouse,
  testInitManager
} from "../__test__/RadioObject";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

/**
 * テスト用のボタンを生成する関数。
 * @param buttonValue
 * @returns {RadioButtonMesh}
 */
const initButton = (buttonValue: any): RadioButtonMesh => {
  const button = new RadioButtonMesh({
    geo: new BoxBufferGeometry(3, 3, 3),
    material: getMeshMaterialSet()
  });
  button.model.value = buttonValue;
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
    manager.select(notManagedButton.model);
    expect(spyWarn).toHaveBeenCalledWith(
      "管理下でないボタンが選択処理されました。"
    );

    //管理外のボタンをremoveしてもエラーは発生しない。
    const removedButton = manager.removeButton(notManagedButton);
  });

  test("ボタンを管理から外す", () => {
    const index = 4;
    const model = manager.models[index];
    manager.removeModel(model);
    expect(manager.models.length).toEqual(4);
  });

  test("マウスで選択変更", () => {
    testRadioSelectionWithMouse(manager);
  });
});
