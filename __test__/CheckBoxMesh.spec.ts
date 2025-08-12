import { BoxGeometry } from "three";
import { describe, expect, test } from "vitest";
import { CheckBoxMesh, type StateMaterialSet } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { changeMaterialState } from "./MouseControl.js";

describe("CheckBoxMesh", () => {
  let checkbox: CheckBoxMesh;
  const matSet: StateMaterialSet = getMeshMaterialSet();

  test("should initialize with correct geometry, material, and default selection state", () => {
    const geometry = new BoxGeometry(3, 3, 3);

    checkbox = new CheckBoxMesh({
      geo: geometry,
      material: matSet,
    });

    expect(checkbox.geometry).toBe(geometry);
    expect(checkbox.material).toBe(matSet.normal.material);
    expect(checkbox.interactionHandler.selection).toBe(false);
  });

  test("should update mesh material when selection state changes", () => {
    // Focus on view-specific material updates, not handler logic
    expect(checkbox.material).toBe(matSet.normal.material);

    checkbox.interactionHandler.selection = true;
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    checkbox.interactionHandler.selection = false;
    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("should update mesh material during interaction states with selection awareness", () => {
    // Test View-specific concern: material updates during complex interaction states
    checkbox.interactionHandler.selection = true;
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    // Simulate mouse over during selected state
    changeMaterialState(checkbox, "over", matSet.overSelect);
    expect(checkbox.material).toBe(matSet.overSelect.material);

    // Simulate mouse down during selected state
    changeMaterialState(checkbox, "down", matSet.downSelect);
    expect(checkbox.material).toBe(matSet.downSelect.material);

    // Return to out state (normal) with selection
    changeMaterialState(checkbox, "out", matSet.normalSelect);
    expect(checkbox.material).toBe(matSet.normalSelect.material);
  });
});
