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
  expect(
    manager.interactionHandlers[2].value,
    `Manager should store button value correctly: expected ${JSON.stringify(values[2])} at index 2`,
  ).toBe(values[2]);
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

  expect(
    handler.isFrozen,
    "Handler should not be frozen before selection",
  ).toBe(false);
  manager.select(handler);
  expect(
    manager.selected.value,
    `Selected value should be ${JSON.stringify(values[index])}`,
  ).toEqual(values[index]);
  expect(
    spySelect,
    "Select event should be emitted when button is selected",
  ).toBeCalled();

  expect(
    handler.isFrozen,
    "Handler should be frozen after selection for exclusive behavior",
  ).toBe(true);

  spySelect.mockClear();
  manager.select(handler);
  expect(
    spySelect,
    "Select event should not be emitted when selecting already selected button",
  ).not.toBeCalled();
  expect(
    handler.isFrozen,
    "Handler should remain frozen after re-selection attempt",
  ).toBe(true);
}

/**
 * マウスイベントハンドラー経由でボタンの選択を行う。
 * @param {RadioButtonManager} manager
 */
export function testRadioSelectionWithMouse(manager: RadioButtonManager) {
  manager.select(manager.interactionHandlers[0]);

  const index = 2;
  const handler = manager.interactionHandlers[index];

  expect(
    handler.isFrozen,
    `Handler at index ${index} should not be frozen before mouse selection`,
  ).toBe(false);
  clickButton(handler.view);
  expect(
    handler.isFrozen,
    `Handler at index ${index} should be frozen after mouse selection`,
  ).toBe(true);
  expect(
    manager.selected.value,
    `Manager selected value should match handler value: ${JSON.stringify(handler.value)}`,
  ).toEqual(handler.value);

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

  expect(
    spyClick,
    "Click event should not be emitted when clicking frozen radio button",
  ).not.toBeCalled();
  expect(
    spySelect,
    "Select event should not be emitted when clicking already selected radio button",
  ).not.toBeCalled();
};
