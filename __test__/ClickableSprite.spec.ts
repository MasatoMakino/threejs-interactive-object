import {
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
  ClickableSprite
} from "../src/index";
import { SpriteMaterial,Event } from "three";
import { getSpriteMaterialSet } from "../__test__/Materials";
import { clickButton } from "../__test__/MouseControl";
import { testMouseOver } from "../__test__/MouseControl";
import { testDisable } from "../__test__/MouseControl";
import { testSwitch } from "../__test__/MouseControl";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

describe("ClickableSprite", () => {
  let sprite: ClickableSprite;
  const matSet: StateMaterialSet = getSpriteMaterialSet();

  test("初期化", () => {
    sprite = new ClickableSprite(matSet);
    expect(sprite.material).toBe(matSet.normal.material);
  });

  test("マウスオーバー/アウト", () => {
    testMouseOver(sprite, matSet);
  });

  test("disable", () => {
    testDisable(sprite, matSet);
  });

  test("switch", () => {
    testSwitch(sprite, matSet);
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
