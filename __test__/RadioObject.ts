import { Event } from "three";
import {
  ThreeMouseEventType,
  ThreeMouseEvent,
  RadioButtonManager
} from "../src/index";
import { clickButton } from "../__test__/MouseControl";

/**
 * テスト用のbuttonValueサンプルを生成する。
 * @returns {any[]}
 */
export function getButtonValues(): any[] {
  return ["button01", 2, { value: "button03" }, undefined, undefined];
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
  manager.select(button);
  expect(manager.selected.value).toEqual(values[index]);

  expect(spyManager).toHaveBeenCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
  );
  expect(button.isFrozen).toBe(true);
}

/**
 * マウスイベントハンドラー経由でボタンの選択を行う。
 * @param {RadioButtonManager} manager
 */
export function testRadioSelectionWithMouse(manager: RadioButtonManager) {
  manager.select(manager.buttons[0]);

  const index = 2;
  const button = manager.buttons[index];
  const spyButton = jest
    .spyOn(button, "dispatchEvent")
    .mockImplementation((e: Event) => null);
  const spyManager = jest
    .spyOn(manager, "dispatchEvent")
    .mockImplementation((e: Event) => null);

  clickButton(button);
  expect(spyButton).toHaveBeenCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
  );
  expect(spyButton).toHaveBeenLastCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.CLICK, button)
  );
  //操作完了直後はFrozenがdispatchされていないのでまだfalseのまま
  expect(button.isFrozen).toBe(false);

  //マウス操作の場合、managerはdispatch後に稼働するため、1フレーム分のディレイを入れている。
  setTimeout(() => {
    expect(manager.selected.value).toEqual(button.value);
    expect(spyManager).toHaveBeenCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
    );
    expect(button.isFrozen).toBe(true);

    clickButton(button);
    //二回目の操作はイベントが発生しない。
    setTimeout(() => {
      expect(spyButton).not.toHaveBeenCalledWith(
        new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
      );
      expect(spyButton).not.toHaveBeenCalledWith(
        new ThreeMouseEvent(ThreeMouseEventType.CLICK, button)
      );
      expect(spyManager).not.toHaveBeenCalledWith(
        new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
      );
    }, 16);
  }, 16);
}
