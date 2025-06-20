import { BoxGeometry, type MeshBasicMaterial } from "three";
import { describe, expect, test, vi } from "vitest";
import { ClickableMesh, type StateMaterialSet } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import {
  testClick,
  testDisable,
  testFrozen,
  testMouseOver,
  testMouseUP,
  testSwitch,
} from "./MouseControl.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

describe("ClickableMesh", () => {
  let clickable: ClickableMesh<string>;
  const matSet: StateMaterialSet = getMeshMaterialSet();

  test("初期化", () => {
    clickable = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: matSet,
    });
    clickable.interactionHandler.value = "test button value.";
    expect(clickable.material).toBe(matSet.normal.material);
  });

  test("マウスオーバー/アウト", () => {
    testMouseOver(clickable, matSet);
  });

  test("disable", () => {
    testDisable(clickable, matSet);
  });

  test("frozen", () => {
    testFrozen(clickable, matSet);
  });

  test("switch", () => {
    testSwitch(clickable, matSet);
  });

  test("マウスアップ", () => {
    testMouseUP(clickable);
  });

  test("マウスダウン/クリック", () => {
    testClick(clickable);
  });

  test("alpha", () => {
    clickable.interactionHandler.alpha = 0.5;
    expect(
      (
        clickable.interactionHandler.materialSet?.normal
          .material as MeshBasicMaterial
      ).opacity,
    ).toBe(0.3);
    expect(
      (
        clickable.interactionHandler.materialSet?.over
          .material as MeshBasicMaterial
      ).opacity,
    ).toBe(0.4);
    expect(
      (
        clickable.interactionHandler.materialSet?.down
          .material as MeshBasicMaterial
      ).opacity,
    ).toBe(0.5);
  });
});
