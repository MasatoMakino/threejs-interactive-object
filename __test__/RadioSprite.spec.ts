import { Event } from "three";
import {
  RadioButtonManager,
  ThreeMouseEvent,
  ThreeMouseEventType,
  RadioButtonSprite
} from "../src/index";
import { getSpriteMaterialSet } from "../__test__/Materials";
import { clickButton } from "../__test__/MouseControl";

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

const values: any[] = [
  "button01",
  2,
  { value: "button03" },
  undefined,
  undefined
];

let manager: RadioButtonManager;

describe("RadioButtonSprite", () => {
  test("初期化", () => {
    manager = new RadioButtonManager();
    manager.addButton(initButton(values[0]));
    manager.addButton(initButton(values[1]));
    manager.addButton(initButton(values[2]));
    manager.addButton(initButton(values[3]));
    manager.addButton(initButton(values[4]));
  });

  test("選択変更", () => {
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

    manager.select(button);

    button.dispatchEvent(
      new ThreeMouseEvent(ThreeMouseEventType.SELECT, button)
    );
  });

  test("マウスで選択変更", () => {
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
  });
});
