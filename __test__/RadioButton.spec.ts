import { MeshBasicMaterial, BoxBufferGeometry, Event } from "three";
import {
  RadioButtonMesh,
  RadioButtonManager,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
  IRadioButtonObject3D
} from "../src/index";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

/**
 * テスト用のボタンを生成する関数。
 * @param buttonValue
 * @returns {RadioButtonMesh}
 */
const initButton = (buttonValue: any): RadioButtonMesh => {
  const getMaterialSet = () => {
    const matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true
      }),
      over: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true
      }),
      down: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 1.0,
        transparent: true
      }),
      normalSelect: new MeshBasicMaterial({
        color: 0xffff00,
        opacity: 0.6,
        transparent: true
      }),
      overSelect: new MeshBasicMaterial({
        color: 0xffff00,
        opacity: 0.8,
        transparent: true
      }),
      downSelect: new MeshBasicMaterial({
        color: 0xffff00,
        opacity: 1.0,
        transparent: true
      })
    });
    return matSet;
  };

  const button = new RadioButtonMesh({
    geo: new BoxBufferGeometry(3, 3, 3),
    material: getMaterialSet()
  });
  button.value = buttonValue;
  return button;
};

/**
 * 対象のボタンをクリックする
 * @param {IRadioButtonObject3D} button
 */
const clickButton = (button: IRadioButtonObject3D) => {
  button.onMouseOverHandler(
    new ThreeMouseEvent(ThreeMouseEventType.OVER, button)
  );
  button.onMouseDownHandler(
    new ThreeMouseEvent(ThreeMouseEventType.DOWN, button)
  );
  button.onMouseUpHandler(new ThreeMouseEvent(ThreeMouseEventType.UP, button));
};

const values: any[] = [
  "button01",
  2,
  { value: "button03" },
  undefined,
  undefined
];
let manager: RadioButtonManager;

describe("RadioButton", () => {
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
    manager.select(manager.buttons[index]);
    expect(manager.selected.value).toEqual(values[index]);

    expect(spyManager).toHaveBeenCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.SELECT, manager.buttons[index])
    );
    expect(manager.buttons[index].isFrozen).toBe(true);

    manager.select(manager.buttons[index]);

    manager.buttons[index].dispatchEvent(
      new ThreeMouseEvent(ThreeMouseEventType.SELECT, manager.buttons[index])
    );
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