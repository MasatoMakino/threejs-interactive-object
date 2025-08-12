import type { SpriteMaterial } from "three";
import { describe, expect, test } from "vitest";
import { CheckBoxSprite } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";

/**
 * Creates a CheckBoxSprite instance for testing.
 * @param value - The value to associate with the checkbox sprite
 * @returns CheckBoxSprite instance with configured material set and value
 */
const initButton = (value: string): CheckBoxSprite => {
  const button = new CheckBoxSprite(getSpriteMaterialSet());
  button.interactionHandler.value = value;
  return button;
};

describe("CheckBoxSprite", () => {
  test("should initialize with default selection state false", () => {
    const btn = initButton("button01");
    expect(btn.interactionHandler.selection).toBe(false);
  });

  test("should initialize with correct sprite material properties", () => {
    const btn = initButton("button01");
    // Focus on sprite-specific material initialization
    expect(btn.material.opacity).toBeDefined();
    expect(btn.material.transparent).toBe(true);
  });

  test("should update sprite material opacity during selection state changes", () => {
    const btn = initButton("button01");
    const materialSet = getSpriteMaterialSet();
    const initialOpacity = btn.material.opacity;
    const expectedSelectedOpacity = (
      materialSet.normalSelect.material as SpriteMaterial
    ).opacity;

    // Test sprite-specific material behavior during selection
    btn.interactionHandler.selection = true;
    // Material opacity should be updated for selected state
    expect(btn.material.opacity).toBe(expectedSelectedOpacity);

    btn.interactionHandler.selection = false;
    expect(btn.material.opacity).toBe(initialOpacity); // Restored to initial
  });
});
