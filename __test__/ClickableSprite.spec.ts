import {
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
  ClickableSprite
} from "../src/index";
import { SpriteMaterial } from "three";
import { Event } from "three";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

describe("ClickableSprite", () => {
  let sprite: ClickableSprite;
  let matSet: StateMaterialSet;

  test("初期化", () => {
    matSet = new StateMaterialSet({
      normal: new SpriteMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true
      }),
      over: new SpriteMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true
      }),
      down: new SpriteMaterial({
        color: 0xffffff,
        opacity: 1.0,
        transparent: true
      }),
      disable: new SpriteMaterial({
        color: 0xffffff,
        opacity: 0.1,
        transparent: true
      })
    });

    sprite = new ClickableSprite(matSet);
    expect(sprite.material).toBe(matSet.normal.material);
  });

  test("マウスオーバー/アウト", () => {
    sprite.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, sprite)
    );
    expect(sprite.material).toBe(matSet.over.material);
    sprite.onMouseOutHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OUT, sprite)
    );
    expect(sprite.material).toBe(matSet.normal.material);
  });

  test("disable", () => {
    sprite.disable();
    sprite.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, sprite)
    );
    expect(sprite.material).toBe(matSet.disable.material);
    sprite.onMouseDownHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, sprite)
    );
    expect(sprite.material).toBe(matSet.disable.material);
    sprite.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, sprite)
    );
    expect(sprite.material).toBe(matSet.disable.material);
    sprite.onMouseOutHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OUT, sprite)
    );
    expect(sprite.material).toBe(matSet.disable.material);

    sprite.enable();
    sprite.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, sprite)
    );
    expect(sprite.material).toBe(matSet.over.material);
    sprite.onMouseOutHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OUT, sprite)
    );
    expect(sprite.material).toBe(matSet.normal.material);
  });

  test("switch", () => {
    sprite.switchEnable(false);
    expect(sprite.getEnable()).toBe(false);
    expect(sprite.material).toBe(matSet.disable.material);

    sprite.switchEnable(true);
    expect(sprite.getEnable()).toBe(true);
    expect(sprite.material).toBe(matSet.normal.material);
  });

  test("マウスアップ", () => {
    const spy = jest
      .spyOn(sprite, "dispatchEvent")
      .mockImplementation((e: Event) => null);
    sprite.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, sprite)
    );
    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.UP, sprite)
    );
  });

  test("マウスダウン/クリック", () => {
    const spy = jest
      .spyOn(sprite, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    sprite.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, sprite)
    );
    sprite.onMouseDownHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, sprite)
    );
    sprite.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, sprite)
    );
    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.CLICK, sprite)
    );
  });

  test("alpha", () => {
    const matSet = sprite.materialSet;
    sprite.alpha = 0.5;
    expect((matSet.normal.material as SpriteMaterial).opacity).toBe(0.3);
    expect((matSet.over.material as SpriteMaterial).opacity).toBe(0.4);
    expect((matSet.down.material as SpriteMaterial).opacity).toBe(0.5);
    expect((matSet.disable.material as SpriteMaterial).opacity).toBe(0.05);
  });
});
