import { BoxGeometry } from "three";
import { describe, expect, test } from "vitest";
import { CheckBoxMesh } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { changeMaterialState } from "./MouseControl.js";

/**
 * Creates a CheckBoxMesh instance for testing.
 * @param value - Optional value to associate with the checkbox mesh
 * @returns CheckBoxMesh instance with configured geometry and material set
 */
const createCheckboxMesh = <T = unknown>(value?: T) => {
  const geometry = new BoxGeometry(3, 3, 3);
  const matSet = getMeshMaterialSet();
  const checkbox = new CheckBoxMesh<T>({
    geo: geometry,
    material: matSet,
  });
  if (value !== undefined) {
    checkbox.interactionHandler.value = value;
  }
  return { checkbox, matSet, geometry };
};

describe("CheckBoxMesh", () => {
  test("should initialize with correct geometry, material, and default selection state", () => {
    const { checkbox, matSet, geometry } = createCheckboxMesh();

    expect(checkbox.geometry).toBe(geometry);
    expect(checkbox.material).toBe(matSet.normal.material);
    expect(checkbox.interactionHandler.selection).toBe(false);
  });

  test("should update mesh material when selection state changes", () => {
    const { checkbox, matSet } = createCheckboxMesh();

    // Focus on view-specific material updates, not handler logic
    expect(checkbox.material).toBe(matSet.normal.material);

    checkbox.interactionHandler.selection = true;
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    checkbox.interactionHandler.selection = false;
    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("should update mesh material during interaction states with selection awareness", () => {
    const { checkbox, matSet } = createCheckboxMesh();

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
