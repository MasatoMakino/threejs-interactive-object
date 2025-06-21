import { BoxGeometry } from "three";
import { describe, expect, test, vi } from "vitest";
import { CheckBoxMesh, type StateMaterialSet } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { changeMaterialState, clickButton } from "./MouseControl.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

describe("CheckBoxMesh", () => {
  let checkbox: CheckBoxMesh;
  const matSet: StateMaterialSet = getMeshMaterialSet();

  test("初期化", () => {
    const geometry = new BoxGeometry(3, 3, 3);

    checkbox = new CheckBoxMesh({
      geo: geometry,
      material: matSet,
    });

    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("set / get selection", () => {
    expect(checkbox.interactionHandler.selection).toBe(false);

    checkbox.interactionHandler.selection = true;
    expect(checkbox.interactionHandler.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    checkbox.interactionHandler.selection = false;
    expect(checkbox.interactionHandler.selection).toBe(false);
    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("click", () => {
    const spyClick = vi.fn(() => {});
    checkbox.interactionHandler.on("click", spyClick);

    //クリックして選択
    clickButton(checkbox);
    expect(spyClick).toBeCalled();

    expect(checkbox.interactionHandler.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.overSelect.material);

    //クリックして選択解除
    changeMaterialState(checkbox, "down", matSet.downSelect);
    changeMaterialState(checkbox, "up", matSet.over);
    expect(checkbox.interactionHandler.selection).toBe(false);
  });
});
