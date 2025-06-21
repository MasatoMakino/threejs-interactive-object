import type { SpriteMaterial } from "three";
import { describe, expect, test, vi } from "vitest";
import { ClickableSprite, type StateMaterialSet } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";
import {
  testClick,
  testDisable,
  testFrozen,
  testMouseOver,
  testMouseUP,
  testSwitch,
} from "./MouseControl.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

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

  test("frozen", () => {
    testFrozen(sprite, matSet);
  });

  test("switch", () => {
    testSwitch(sprite, matSet);
  });

  test("マウスアップ", () => {
    testMouseUP(sprite);
  });

  test("マウスダウン/クリック", () => {
    testClick(sprite);
  });

  test("alpha", () => {
    const matSet = sprite.interactionHandler.materialSet;
    sprite.interactionHandler.alpha = 0.5;
    expect((matSet?.normal.material as SpriteMaterial).opacity).toBe(0.3);
    expect((matSet?.over.material as SpriteMaterial).opacity).toBe(0.4);
    expect((matSet?.down.material as SpriteMaterial).opacity).toBe(0.5);
    expect((matSet?.disable.material as SpriteMaterial).opacity).toBe(0.05);
  });
});
