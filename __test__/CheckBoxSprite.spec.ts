import { describe, expect, test } from "vitest";
import { CheckBoxSprite } from "../src/index.js";
import { getSpriteMaterialSet } from "./Materials.js";

/**
 * ボタンを生成する
 * @param value
 * @returns {CheckBoxSprite}
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
    const initialOpacity = btn.material.opacity;

    // Test sprite-specific material behavior during selection
    btn.interactionHandler.selection = true;
    // Material opacity should be updated for selected state
    expect(btn.material.opacity).toBe(0.65); // Selected state opacity

    btn.interactionHandler.selection = false;
    expect(btn.material.opacity).toBe(initialOpacity); // Restored to initial
  });
});
