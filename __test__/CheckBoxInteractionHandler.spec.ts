import { BoxGeometry } from "three";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CheckBoxMesh } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

// Global spy for console.warn to avoid affecting other tests
const _globalWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("CheckBoxInteractionHandler", () => {
  beforeEach(() => {
    _globalWarnSpy.mockClear();
  });

  afterAll(() => {
    _globalWarnSpy.mockRestore();
  });

  const createTestSetup = () => {
    const matSet = getMeshMaterialSet();
    const checkbox = new CheckBoxMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: matSet,
    });
    checkbox.interactionHandler.value = "test checkbox";
    const handler = checkbox.interactionHandler;
    return { checkbox, handler, matSet };
  };

  describe("Selection Public API Behavior", () => {
    it("should respect disable state when setting selection", () => {
      const { handler, matSet } = createTestSetup();

      // Initially enabled and unselected
      expect(handler.selection).toBe(false);

      // Disable checkbox
      handler.disable();

      // Attempt to set selection (should be ignored)
      handler.selection = true;
      expect(handler.selection).toBe(false);
      expect(handler.view.material).toBe(matSet.disable.material);
    });

    it("should respect frozen state when setting selection", () => {
      const { handler, matSet } = createTestSetup();

      // Initially active and unselected
      expect(handler.selection).toBe(false);

      // Freeze checkbox
      handler.frozen = true;

      // Attempt to set selection (should be ignored)
      handler.selection = true;
      expect(handler.selection).toBe(false);
      expect(handler.view.material).toBe(matSet.normal.material);
    });

    it("should work normally when active", () => {
      const { handler, matSet } = createTestSetup();

      // Normal selection should work
      handler.selection = true;
      expect(handler.selection).toBe(true);
      expect(handler.view.material).toBe(matSet.normalSelect.material);

      // Deselection should work
      handler.selection = false;
      expect(handler.selection).toBe(false);
      expect(handler.view.material).toBe(matSet.normal.material);
    });

    it("should work after re-enabling", () => {
      const { handler, matSet } = createTestSetup();

      // Disable and attempt selection
      handler.disable();
      handler.selection = true;
      expect(handler.selection).toBe(false);

      // Re-enable
      handler.enable();

      // Now selection should work
      handler.selection = true;
      expect(handler.selection).toBe(true);
      expect(handler.view.material).toBe(matSet.normalSelect.material);
    });

    it("should work after unfreezing", () => {
      const { handler, matSet } = createTestSetup();

      // Freeze and attempt selection
      handler.frozen = true;
      handler.selection = true;
      expect(handler.selection).toBe(false);

      // Unfreeze
      handler.frozen = false;

      // Now selection should work
      handler.selection = true;
      expect(handler.selection).toBe(true);
      expect(handler.view.material).toBe(matSet.normalSelect.material);
    });
  });

  describe("Complex State Management Scenarios", () => {
    it("should maintain selection state through disable/enable cycles", () => {
      const { handler } = createTestSetup();

      // Select and disable
      handler.selection = true;
      handler.disable();
      expect(handler.selection).toBe(true);

      // Enable should preserve selection
      handler.enable();
      expect(handler.selection).toBe(true);

      // Public API should work normally after enable
      handler.selection = false;
      expect(handler.selection).toBe(false);
    });

    it("should handle frozen state without affecting selection", () => {
      const { handler } = createTestSetup();

      // Select and freeze
      handler.selection = true;
      handler.frozen = true;
      expect(handler.selection).toBe(true);

      // Unfreeze should preserve selection
      handler.frozen = false;
      expect(handler.selection).toBe(true);

      // Public API should work normally after unfreeze
      handler.selection = false;
      expect(handler.selection).toBe(false);
    });
  });
});
