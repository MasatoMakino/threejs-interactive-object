import { BoxBufferGeometry, Event } from "three";
import { RadioButtonMesh, RadioButtonManager } from "../src/index";
import { getMeshMaterialSet } from "../__test__/Materials";
import { testRadioSelection } from "../__test__/RadioObject";
import { testRadioSelectionWithMouse } from "../__test__/RadioObject";
import { testInitManager } from "../__test__/RadioObject";

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
  button.value = buttonValue;
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
    manager.select(notManagedButton);
    expect(spyWarn).toHaveBeenCalledWith(
      "管理下でないボタンが選択処理されました。"
    );

    //管理外のボタンをremoveしてもそのまま返ってくるだけ
    const removedButton = manager.removeButton(notManagedButton);
    expect(removedButton).toBe(notManagedButton);
  });

  test("ボタンを管理から外す", () => {
    const index = 4;
    const button = manager.buttons[index];
    const removedButton = manager.removeButton(button);
    expect(removedButton).toBe(button);
    expect(manager.buttons.length).toEqual(4);
  });

  test("マウスで選択変更", () => {
    testRadioSelectionWithMouse(manager);
  });
});
