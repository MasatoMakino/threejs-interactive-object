import {
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
  ClickableSprite
} from "../src/index";
import { SpriteMaterial } from "three";
import { Event } from "three";
import { getSpriteMaterialSet } from "../__test__/Materials";
import { clickButton } from "../__test__/MouseControl";
import { changeMaterialState } from "../__test__/MouseControl";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

describe("ClickableSprite", () => {
  let sprite: ClickableSprite;
  const matSet: StateMaterialSet = getSpriteMaterialSet();

  test("初期化", () => {
    sprite = new ClickableSprite(matSet);
    expect(sprite.material).toBe(matSet.normal.material);
  });

  test("マウスオーバー/アウト", () => {
    changeMaterialState(sprite, ThreeMouseEventType.OVER, matSet.over);
    changeMaterialState(sprite, ThreeMouseEventType.OUT, matSet.normal);
  });

  test("disable", () => {
    sprite.disable();
    changeMaterialState(sprite, ThreeMouseEventType.OVER, matSet.disable);
    changeMaterialState(sprite, ThreeMouseEventType.DOWN, matSet.disable);
    changeMaterialState(sprite, ThreeMouseEventType.UP, matSet.disable);
    changeMaterialState(sprite, ThreeMouseEventType.OUT, matSet.disable);

    sprite.enable();
    changeMaterialState(sprite, ThreeMouseEventType.OVER, matSet.over);
    changeMaterialState(sprite, ThreeMouseEventType.OUT, matSet.normal);
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

    clickButton(sprite);
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
