import {
  ClickableView,
  RadioButtonManager,
  RadioButtonMesh,
  RadioButtonSprite,
  ThreeMouseEventUtil,
  ClickableObject,
  ThreeMouseEvent,
  ThreeMouseEventMap,
} from "../src/index.js";
import { clickButton } from "./MouseControl.js";

/**
 * テスト用のbuttonValueサンプルを生成する。
 * @returns {any[]}
 */
export function getButtonValues(): any[] {
  return ["button01", 2, { value: "button03" }, undefined, undefined];
}

/**
 * マネージャーの初期化を行う。
 * 格納されたボタンが正常に呼び出せるかをテストする。
 * @param {RadioButtonManager} manager
 * @param {(value: any) => (RadioButtonMesh | RadioButtonSprite)} generator
 */
export function testInitManager(
  manager: RadioButtonManager,
  generator: (value: any) => RadioButtonMesh | RadioButtonSprite,
) {
  const values = getButtonValues();
  const buttons = [];
  for (let value of values) {
    buttons.push(generator(value));
  }

  manager.addButton(...buttons);
  expect(manager.models[2].value).toBe(values[2]);
}

/**
 * ボタンの選択を行う。
 * イベント発行が行われるか、選択済みのボタンがFrozenになるかを確認
 * @param {RadioButtonManager} manager
 */
export function testRadioSelection(manager: RadioButtonManager) {
  const values = getButtonValues();

  const spySelect = jest.fn((e) => {});
  manager.on("select", spySelect);

  const index = 0;
  const button = manager.models[index];

  expect(button.isFrozen).toBe(false);
  manager.select(button);
  expect(manager.selected.value).toEqual(values[index]);
  expect(spySelect).toBeCalled();

  expect(button.isFrozen).toBe(true);

  spySelect.mockClear();
  manager.select(button);
  expect(spySelect).not.toBeCalled();
  expect(button.isFrozen).toBe(true);
}

/**
 * マウスイベントハンドラー経由でボタンの選択を行う。
 * @param {RadioButtonManager} manager
 */
export function testRadioSelectionWithMouse(manager: RadioButtonManager) {
  manager.select(manager.models[0]);

  const index = 2;

  const model = manager.models[index];

  expect(model.isFrozen).toBe(false);
  clickButton(model.view);
  expect(model.isFrozen).toBe(true);
  expect(manager.selected.value).toEqual(model.value);

  onClickSecondTime(manager, model.view);
}

/**
 * 二回目のクリックテスト
 * @param {RadioButtonManager} manager
 * @param {ClickableView} button
 */
const onClickSecondTime = <T>(
  manager: RadioButtonManager,
  button: ClickableView<T>,
) => {
  const spyClick = jest.fn((e) => {});
  const spySelect = jest.fn((e) => {});

  button.model.on("click", spyClick);
  button.model.on("select", spySelect);

  clickButton(button);

  expect(spyClick).not.toBeCalled();
  expect(spySelect).not.toBeCalled();
};
