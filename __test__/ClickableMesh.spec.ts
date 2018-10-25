import { MeshBasicMaterial, BoxBufferGeometry, Event } from "three";
import {
  ClickableMesh,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType
} from "../src/index";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

describe("ClickableMesh", () => {
  let clickable: ClickableMesh;
  let matSet: StateMaterialSet;

  test("初期化", () => {
    const geometry = new BoxBufferGeometry(3, 3, 3);
    matSet = new StateMaterialSet({
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
      })
    });

    clickable = new ClickableMesh({
      geo: geometry,
      material: matSet
    });

    expect(clickable.material).toBe(matSet.normal.material);
  });

  test("マウスオーバー/アウト", () => {
    clickable.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, clickable)
    );
    expect(clickable.material).toBe(matSet.over.material);
    clickable.onMouseOutHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OUT, clickable)
    );
    expect(clickable.material).toBe(matSet.normal.material);
    clickable.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, clickable)
    );
    expect(clickable.material).toBe(matSet.over.material);
    clickable.onMouseOutHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OUT, clickable)
    );
    expect(clickable.material).toBe(matSet.normal.material);
  });

  test("disable", () => {
    clickable.disable();
    clickable.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, clickable)
    );
    expect(clickable.material).toBe(matSet.disable.material);
    clickable.onMouseDownHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, clickable)
    );
    expect(clickable.material).toBe(matSet.disable.material);
    clickable.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, clickable)
    );
    expect(clickable.material).toBe(matSet.disable.material);
    clickable.onMouseOutHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, clickable)
    );
    expect(clickable.material).toBe(matSet.disable.material);

    clickable.enable();
    clickable.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, clickable)
    );
    expect(clickable.material).toBe(matSet.over.material);
    clickable.onMouseOutHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OUT, clickable)
    );
    expect(clickable.material).toBe(matSet.normal.material);
  });

  test("switch", () => {
    clickable.switchEnable(false);
    expect(clickable.getEnable()).toBe(false);

    clickable.switchEnable(true);
    expect(clickable.getEnable()).toBe(true);
  });

  test("マウスアップ", () => {
    const spy = jest
      .spyOn(clickable, "dispatchEvent")
      .mockImplementation((e: Event) => null);
    clickable.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, clickable)
    );
    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.UP, clickable)
    );
  });

  test("マウスダウン/クリック", () => {
    const spy = jest
      .spyOn(clickable, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    clickable.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, clickable)
    );
    clickable.onMouseDownHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, clickable)
    );
    clickable.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, clickable)
    );
    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.CLICK, clickable)
    );
  });

  test("alpha", () => {
    clickable.alpha = 0.5;
    expect(
      (clickable.materialSet.normal.material as MeshBasicMaterial).opacity
    ).toBe(0.3);
    expect(
      (clickable.materialSet.over.material as MeshBasicMaterial).opacity
    ).toBe(0.4);
    expect(
      (clickable.materialSet.down.material as MeshBasicMaterial).opacity
    ).toBe(0.5);
  });
});
