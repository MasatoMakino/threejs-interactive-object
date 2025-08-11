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

  describe("Internal Override API", () => {
    it("should force selection despite disable state", () => {
      const { handler } = createTestSetup();

      // Disable checkbox
      handler.disable();
      expect(handler.selection).toBe(false);

      // Internal API should force selection change
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      // But handler is still disabled, so public API is still blocked
      handler.selection = false;
      expect(handler.selection).toBe(true); // Unchanged due to disable state
    });

    it("should force selection despite frozen state", () => {
      const { handler } = createTestSetup();

      // Freeze checkbox and select
      handler.frozen = true;
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      // Internal API should force deselection
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });

    it("should work with both disable and frozen states", () => {
      const { handler } = createTestSetup();

      // Disable and freeze
      handler.disable();
      handler.frozen = true;

      // Internal API should still work
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });
  });

  describe("Complex State Management Scenarios", () => {
    it("should handle complex state transition sequences", () => {
      const { handler } = createTestSetup();

      // Step 1: Normal selection
      handler.selection = true;
      expect(handler.selection).toBe(true);

      // Step 2: Disable (selection state maintained)
      handler.disable();
      expect(handler.selection).toBe(true);

      // Step 3: Public API deselection attempt (ignored)
      handler.selection = false;
      expect(handler.selection).toBe(true);

      // Step 4: Internal API deselection (succeeds)
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);

      // Step 5: Re-enable and verify public API works
      handler.enable();
      handler.selection = true;
      expect(handler.selection).toBe(true);
    });

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

  describe("Integration with RadioButtonManager Simulation", () => {
    it("should simulate RadioButtonManager frozen button behavior", () => {
      const { handler } = createTestSetup();

      // Simulate RadioButtonManager selection (using internal API)
      handler.frozen = true;
      handler._setSelectionOverride(true);

      expect(handler.selection).toBe(true);
      expect(handler.frozen).toBe(true);

      // Public API should respect frozen state
      handler.selection = false;
      expect(handler.selection).toBe(true); // Should remain selected

      // Internal API should still work
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });
  });
});
