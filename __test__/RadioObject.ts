import { expect, vi } from "vitest";
import type {
  ClickableView,
  RadioButtonManager,
  RadioButtonMesh,
  RadioButtonSprite,
} from "../src/index.js";
import { clickButton } from "./MouseControl.js";

/**
 * テスト用のbuttonValueサンプルを生成する。
 * @returns {unknown[]}
 */
export function getButtonValues(): unknown[] {
  return ["button01", 2, { value: "button03" }, undefined, undefined];
}

/**
 * マネージャーの初期化を行う。
 * 格納されたボタンが正常に呼び出せるかをテストする。
 * @param {RadioButtonManager} manager
 * @param {(value) => (RadioButtonMesh | RadioButtonSprite)} generator
 */
export function testInitManager(
  manager: RadioButtonManager,
  generator: (value) => RadioButtonMesh | RadioButtonSprite,
) {
  const values = getButtonValues();
  for (const value of values) {
    manager.addButton(generator(value));
  }
  expect(manager.interactionHandlers[2].value).toBe(values[2]);
}

/**
 * ボタンの選択を行う。
 * イベント発行が行われるか、選択済みのボタンがFrozenになるかを確認
 * @param {RadioButtonManager} manager
 */
export function testRadioSelection(manager: RadioButtonManager) {
  const values = getButtonValues();

  const spySelect = vi.fn(() => {});
  manager.on("select", spySelect);

  const index = 0;
  const handler = manager.interactionHandlers[index];

  expect(handler.isFrozen).toBe(false);
  manager.select(handler);
  expect(manager.selected.value).toEqual(values[index]);
  expect(spySelect).toBeCalled();

  expect(handler.isFrozen).toBe(true);

  spySelect.mockClear();
  manager.select(handler);
  expect(spySelect).not.toBeCalled();
  expect(handler.isFrozen).toBe(true);
}

/**
 * マウスイベントハンドラー経由でボタンの選択を行う。
 * @param {RadioButtonManager} manager
 */
export function testRadioSelectionWithMouse(manager: RadioButtonManager) {
  manager.select(manager.interactionHandlers[0]);

  const index = 2;

  const handler = manager.interactionHandlers[index];

  expect(handler.isFrozen).toBe(false);
  clickButton(handler.view);
  expect(handler.isFrozen).toBe(true);
  expect(manager.selected.value).toEqual(handler.value);

  onClickSecondTime(handler.view);
}

/**
 * 二回目のクリックテスト
 * @param {ClickableView} button
 */
const onClickSecondTime = <T>(button: ClickableView<T>) => {
  const spyClick = vi.fn(() => {});
  const spySelect = vi.fn(() => {});

  button.interactionHandler.on("click", spyClick);
  button.interactionHandler.on("select", spySelect);

  clickButton(button);

  expect(spyClick).not.toBeCalled();
  expect(spySelect).not.toBeCalled();
};
