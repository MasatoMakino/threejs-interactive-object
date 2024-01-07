import { BoxGeometry } from "three";
import { describe, expect, test, vi } from "vitest";
import { CheckBoxMesh, StateMaterialSet } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { changeMaterialState, clickButton } from "./MouseControl.js";

const spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

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
    expect(checkbox.model.selection).toBe(false);

    checkbox.model.selection = true;
    expect(checkbox.model.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    checkbox.model.selection = false;
    expect(checkbox.model.selection).toBe(false);
    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("click", () => {
    const spyClick = vi.fn((e) => {});
    checkbox.model.on("click", spyClick);

    //クリックして選択
    clickButton(checkbox);
    expect(spyClick).toBeCalled();

    expect(checkbox.model.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.overSelect.material);

    //クリックして選択解除
    changeMaterialState(checkbox, "down", matSet.downSelect);
    changeMaterialState(checkbox, "up", matSet.over);
    expect(checkbox.model.selection).toBe(false);
  });
});
