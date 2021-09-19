import { RadioButtonManager, RadioButtonSprite } from "../src/index";
import { getSpriteMaterialSet } from "./Materials";
import {
  testInitManager,
  testRadioSelection,
  testRadioSelectionWithMouse,
} from "./RadioObject";

const spyWarn = jest.spyOn(console, "warn").mockImplementation((x) => x);

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
