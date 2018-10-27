import { RadioButtonManager, RadioButtonSprite } from "../src/index";
import { getSpriteMaterialSet } from "../__test__/Materials";
import { testRadioSelection } from "../__test__/RadioObject";
import { testRadioSelectionWithMouse } from "../__test__/RadioObject";
import { testInitManager } from "../__test__/RadioObject";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

/**
 * テスト用のボタンを生成する関数。
 * @param buttonValue
 * @returns {RadioButtonSprite}
 */
const initButton = (buttonValue: any): RadioButtonSprite => {
  const button = new RadioButtonSprite(getSpriteMaterialSet());
  button.value = buttonValue;
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
