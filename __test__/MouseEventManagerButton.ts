import { BoxGeometry } from "three";
import { expect } from "vitest";
import {
  ClickableMesh,
  type ClickableState,
  type StateMaterialSet,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

/**
 * Test helper class for ClickableMesh button testing
 *
 * @description
 * Provides a pre-configured ClickableMesh instance with material set
 * for testing button interactions and material state changes.
 * Includes utility methods for material state verification.
 */
export class MouseEventManagerButton {
  /** ClickableMesh instance configured for testing */
  public button: ClickableMesh;
  /** StateMaterialSet used by the button for different interaction states */
  public materialSet: StateMaterialSet;

  /**
   * Creates a new test button with mesh material set
   *
   * @description
   * Initializes a ClickableMesh with a 3x3x3 BoxGeometry and
   * a complete material set for all interaction states
   * (normal, over, down, disable, and selected variants).
   */
  constructor() {
    this.materialSet = getMeshMaterialSet();
    this.button = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: this.materialSet,
    });
  }

  /**
   * Verifies that button's current material matches expected state
   *
   * @param state - Expected ClickableState (normal, over, down, disable, etc.)
   * @param message - Optional test assertion message for debugging
   *
   * @description
   * Compares the button's current material with the expected material
   * for the given state. Uses vitest's expect assertion to verify
   * material equality. Automatically handles selected state detection.
   */
  public checkMaterial(state: ClickableState, message: string = ""): void {
    const setMat = this.materialSet.getMaterial(
      state,
      state !== "disable",
    ).material;

    expect(this.button.material, message).toBe(setMat);
  }
}
