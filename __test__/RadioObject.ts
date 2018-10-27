import { Event } from "three";
import {
  ThreeMouseEventType,
  ThreeMouseEvent,
  RadioButtonManager,
  RadioButtonMesh,
  RadioButtonSprite
} from "../src/index";
import { clickButton } from "../__test__/MouseControl";
import { IRadioButtonObject3D } from "../src/index";
import SpyInstance = jest.SpyInstance;

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
 * @param {(value: any) => (RadioButtonMesh | RadioButtonSprite)} genarator
 */
export function testInitManager(
  manager: RadioButtonManager,
  genarator: (value: any) => RadioButtonMesh | RadioButtonSprite
) {
  const values = getButtonValues();
  for (let value of values) {
    manager.addButton(genarator(value));
  }
  expect(manager.buttons[2].value).toBe(values[2]);
}

/**
 * ボタンの選択を行う。
 * イベント発行が行われるか、選択済みのボタンがFrozenになるかを確認
 * @param {RadioButtonManager} manager
 */
export function testRadioSelection(manager: RadioButtonManager) {
  const values = getButtonValues();
  const spyManager = jest
    .spyOn(manager, "dispatchEvent")
    .mockImplementation((e: Event) => null);

  const index = 0;
  const button = manager.buttons[index];

  expect(button.isFrozen).toBe(false);
  manager.select(button);
  expect(manager.selected.value).toEqual(values[index]);

  expect(spyManager).toHaveBeenCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
  );
  expect(button.isFrozen).toBe(true);

  spyManager.mockClear();
  manager.select(button);
  expect(spyManager).not.toHaveBeenCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
  );
  expect(button.isFrozen).toBe(true);
}

/**
 * マウスイベントハンドラー経由でボタンの選択を行う。
 * @param {RadioButtonManager} manager
 */
export function testRadioSelectionWithMouse(
  manager: RadioButtonManager
  // done: () => void
) {
  manager.select(manager.buttons[0]);

  const index = 2;
  const button = manager.buttons[index];

  expect(button.isFrozen).toBe(false);
  clickButton(button);
  expect(button.isFrozen).toBe(true);
  expect(manager.selected.value).toEqual(button.value);

  onClickSecondTime(manager, button);
}

/**
 * 二回目のクリックテスト
 * @param {RadioButtonManager} manager
 * @param {IRadioButtonObject3D} button
 */
const onClickSecondTime = (
  manager: RadioButtonManager,
  button: IRadioButtonObject3D
) => {
  const spyButton = jest
    .spyOn(button, "dispatchEvent")
    .mockImplementation((e: Event) => null);

  clickButton(button);
  expect(spyButton).not.toHaveBeenCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
  );
  expect(spyButton).not.toHaveBeenCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.CLICK, button)
  );
};
