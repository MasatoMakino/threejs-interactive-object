import { BoxGeometry } from "three";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { CheckBoxMesh } from "../src/index.js";
import { CheckBoxObject } from "../src/interactionHandler/CheckBoxInteractionHandler.js";
import { getMeshMaterialSet } from "./Materials.js";

describe("CheckBoxInteractionHandler", () => {
  let _warnSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // Spy for console.warn to avoid affecting other tests
    _warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  beforeEach(() => {
    _warnSpy.mockClear();
  });

  afterAll(() => {
    _warnSpy.mockRestore();
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

    it("should block programmatic deselection when disabled after selection", () => {
      const { handler } = createTestSetup();

      // Select first, then disable
      handler.selection = true;
      expect(handler.selection).toBe(true);

      handler.disable();

      // Attempt to deselect while disabled (should be blocked)
      handler.selection = false;
      expect(handler.selection).toBe(true);
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

  describe("Event Emission Behavior", () => {
    it("should NOT emit select events when using selection setter (programmatic)", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Programmatic selection change - should not emit events
      handler.selection = true;
      expect(selectEventSpy).not.toHaveBeenCalled();

      // Programmatic deselection - should not emit events
      handler.selection = false;
      expect(selectEventSpy).not.toHaveBeenCalled();

      // Multiple programmatic changes - should not emit events
      handler.selection = true;
      handler.selection = false;
      handler.selection = true;
      expect(selectEventSpy).not.toHaveBeenCalled();
    });

    it("should emit select events when using onMouseClick (user input device operation)", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // User click operation - should emit event
      handler.onMouseClick();
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
      expect(selectEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: true,
          interactionHandler: handler,
        }),
      );

      // Clear spy and test another user click operation
      selectEventSpy.mockClear();
      handler.onMouseClick();
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
      expect(selectEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: false,
          interactionHandler: handler,
        }),
      );
    });

    it("should demonstrate clear distinction between programmatic and user operations", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Mix programmatic and user operations to prove different behavior
      handler.selection = true; // Programmatic - no event
      expect(selectEventSpy).not.toHaveBeenCalled();
      expect(handler.selection).toBe(true);

      handler.onMouseClick(); // User operation - emit event (toggles to false)
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
      expect(handler.selection).toBe(false);

      handler.selection = true; // Programmatic - no event
      expect(selectEventSpy).toHaveBeenCalledTimes(1); // Still only one event
      expect(handler.selection).toBe(true);

      handler.onMouseClick(); // User operation - emit event (toggles to false)
      expect(selectEventSpy).toHaveBeenCalledTimes(2);
      expect(handler.selection).toBe(false);
    });

    it("should optimize redundant same-value settings by skipping updateMaterial calls", () => {
      const { handler } = createTestSetup();
      // biome-ignore lint/suspicious/noExplicitAny : spy private method
      const updateMaterialSpy = vi.spyOn(handler as any, "updateMaterial");

      // Initial state: false
      expect(handler.selection).toBe(false);

      // First change: false → true (should call updateMaterial)
      handler.selection = true;
      expect(updateMaterialSpy).toHaveBeenCalledTimes(1);
      expect(handler.selection).toBe(true);

      // Same-value setting: true → true (should skip updateMaterial)
      updateMaterialSpy.mockClear();
      handler.selection = true;
      expect(updateMaterialSpy).not.toHaveBeenCalled();
      expect(handler.selection).toBe(true);

      // Different value: true → false (should call updateMaterial)
      handler.selection = false;
      expect(updateMaterialSpy).toHaveBeenCalledTimes(1);
      expect(handler.selection).toBe(false);

      // Same-value setting: false → false (should skip updateMaterial)
      updateMaterialSpy.mockClear();
      handler.selection = false;
      expect(updateMaterialSpy).not.toHaveBeenCalled();
      expect(handler.selection).toBe(false);

      updateMaterialSpy.mockRestore();
    });
  });

  describe("Toggle Behavior Deep Dive", () => {
    it("should toggle selection state through multiple consecutive clicks", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Initial state should be false
      expect(handler.selection).toBe(false);

      // First click: false → true
      handler.onMouseClick();
      expect(handler.selection).toBe(true);
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
      expect(selectEventSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: true,
        }),
      );

      // Second click: true → false
      selectEventSpy.mockClear();
      handler.onMouseClick();
      expect(handler.selection).toBe(false);
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
      expect(selectEventSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: false,
        }),
      );

      // Third click: false → true
      selectEventSpy.mockClear();
      handler.onMouseClick();
      expect(handler.selection).toBe(true);
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
      expect(selectEventSpy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: true,
        }),
      );
    });

    it("should maintain selection state when click sequence is interrupted by pointer leaving", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Simulate down → out → up sequence (interrupted click)
      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      handler.onMouseDownHandler({ type: "down", interactionHandler: handler });
      handler.onMouseOutHandler({ type: "out", interactionHandler: handler });
      handler.onMouseUpHandler({ type: "up", interactionHandler: handler });

      // Selection should remain unchanged (no click event)
      expect(handler.selection).toBe(false);
      expect(selectEventSpy).not.toHaveBeenCalled();

      // Follow-up complete click should work normally
      handler.onMouseClick();
      expect(handler.selection).toBe(true);
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
    });

    it("should handle rapid consecutive toggles without state corruption", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Perform 10 rapid toggles
      for (let i = 0; i < 10; i++) {
        handler.onMouseClick();
        const expectedState = (i + 1) % 2 === 1; // Odd clicks = true, even clicks = false
        expect(
          handler.selection,
          `Toggle ${i + 1} should result in ${expectedState}`,
        ).toBe(expectedState);
      }

      // Final state should be false (10 is even)
      expect(handler.selection).toBe(false);
      expect(selectEventSpy).toHaveBeenCalledTimes(10);
    });
  });

  describe("Selection State Edge Cases", () => {
    it("should initialize with unselected state", () => {
      const { handler } = createTestSetup();

      expect(
        handler.selection,
        "CheckBox should initialize as unselected",
      ).toBe(false);
    });

    it("should handle selection state changes during active interaction sequences", () => {
      const { handler, matSet } = createTestSetup();

      // Start interaction sequence: over → down
      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      handler.onMouseDownHandler({ type: "down", interactionHandler: handler });
      expect(handler.view.material).toBe(matSet.down.material);

      // Change selection programmatically during interaction
      handler.selection = true;
      expect(handler.selection).toBe(true);
      expect(handler.view.material).toBe(matSet.downSelect.material);

      // Complete interaction: up (programmatic selection cleared press state, no click occurs)
      handler.onMouseUpHandler({ type: "up", interactionHandler: handler });
      expect(
        handler.selection,
        "Selection should remain true as programmatic change cleared press state",
      ).toBe(true);
      expect(handler.view.material, "Should be over state with selection").toBe(
        matSet.overSelect.material,
      );
    });

    it("should persist selection state across disable/enable cycles with complex transitions", () => {
      const { handler, matSet } = createTestSetup();

      // Set initial selection
      handler.selection = true;
      expect(handler.view.material).toBe(matSet.normalSelect.material);

      // Start hover interaction, then disable
      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      expect(handler.view.material).toBe(matSet.overSelect.material);

      handler.disable();
      expect(
        handler.selection,
        "Selection state should persist through disable",
      ).toBe(true);
      expect(handler.view.material).toBe(matSet.disable.material);

      // Re-enable should restore previous visual state
      handler.enable();
      expect(handler.selection).toBe(true);
      expect(handler.view.material).toBe(matSet.normalSelect.material);
    });

    it("should handle mixed programmatic and user operations with correct state transitions", () => {
      const { handler, matSet } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Programmatic selection
      handler.selection = true;
      expect(handler.selection).toBe(true);
      expect(handler.view.material).toBe(matSet.normalSelect.material);
      expect(selectEventSpy).not.toHaveBeenCalled();

      // User click (should toggle to false)
      handler.onMouseClick();
      expect(handler.selection).toBe(false);
      expect(handler.view.material).toBe(matSet.normal.material);
      expect(selectEventSpy).toHaveBeenCalledTimes(1);

      // Another programmatic change
      handler.selection = true;
      expect(handler.selection).toBe(true);
      expect(handler.view.material).toBe(matSet.normalSelect.material);
      expect(selectEventSpy).toHaveBeenCalledTimes(1); // Still only 1 event

      // Another user click (should toggle to false)
      handler.onMouseClick();
      expect(handler.selection).toBe(false);
      expect(selectEventSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe("Material Update Integration", () => {
    it("should call getMaterial with selection parameter in updateMaterial override", () => {
      const { handler, matSet } = createTestSetup();
      const getMaterialSpy = vi.spyOn(matSet, "getMaterial");

      // Clear any initial calls
      getMaterialSpy.mockClear();

      // Test selected state (change from initial false to true)
      handler.selection = true;
      expect(getMaterialSpy).toHaveBeenLastCalledWith("normal", true, true);

      // Test unselected state (change from true to false)
      handler.selection = false;
      expect(getMaterialSpy).toHaveBeenLastCalledWith("normal", true, false);

      getMaterialSpy.mockRestore();
    });

    it("should apply correct selection-aware materials during state transitions", () => {
      const { handler, matSet } = createTestSetup();

      // Test all state combinations with selection=false
      handler.selection = false;
      expect(handler.view.material, "Normal state, unselected").toBe(
        matSet.normal.material,
      );

      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      expect(handler.view.material, "Over state, unselected").toBe(
        matSet.over.material,
      );

      handler.onMouseDownHandler({ type: "down", interactionHandler: handler });
      expect(handler.view.material, "Down state, unselected").toBe(
        matSet.down.material,
      );

      // Reset to normal for selection tests
      handler.onMouseOutHandler({ type: "out", interactionHandler: handler });

      // Test all state combinations with selection=true
      handler.selection = true;
      expect(handler.view.material, "Normal state, selected").toBe(
        matSet.normalSelect.material,
      );

      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      expect(handler.view.material, "Over state, selected").toBe(
        matSet.overSelect.material,
      );

      handler.onMouseDownHandler({ type: "down", interactionHandler: handler });
      expect(handler.view.material, "Down state, selected").toBe(
        matSet.downSelect.material,
      );
    });

    it("should maintain material consistency when materialSet is replaced", () => {
      const { handler, matSet } = createTestSetup();
      const newMatSet = getMeshMaterialSet();

      // Set initial state with selection
      handler.selection = true;
      expect(handler.view.material).toBe(matSet.normalSelect.material);

      // Replace materialSet
      handler.materialSet = newMatSet;
      expect(handler.view.material, "Should update to new materialSet").toBe(
        newMatSet.normalSelect.material,
      );
      expect(handler.selection, "Selection state should persist").toBe(true);

      // Verify continued functionality with new materialSet
      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      expect(handler.view.material).toBe(newMatSet.overSelect.material);
    });

    it("should handle materialSet changes during interaction sequences", () => {
      const { handler, matSet } = createTestSetup();
      const newMatSet = getMeshMaterialSet();

      // Start interaction with selection
      handler.selection = true;
      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      expect(handler.view.material).toBe(matSet.overSelect.material);

      // Change materialSet mid-interaction
      handler.materialSet = newMatSet;
      expect(
        handler.view.material,
        "Should immediately update to new materialSet",
      ).toBe(newMatSet.overSelect.material);

      // Continue interaction
      handler.onMouseDownHandler({ type: "down", interactionHandler: handler });
      expect(
        handler.view.material,
        "Should use new materialSet for state changes",
      ).toBe(newMatSet.downSelect.material);
    });
  });

  describe("Event System Robustness", () => {
    it("should emit select events with correct isSelected property", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Toggle to selected
      handler.onMouseClick();
      expect(selectEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: true,
          interactionHandler: handler,
        }),
      );

      // Toggle to unselected
      selectEventSpy.mockClear();
      handler.onMouseClick();
      expect(selectEventSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: false,
          interactionHandler: handler,
        }),
      );
    });

    it("should maintain correct event emission sequence during complex interactions", () => {
      const { handler } = createTestSetup();
      const eventLog: string[] = [];

      handler.on("over", () => eventLog.push("over"));
      handler.on("down", () => eventLog.push("down"));
      handler.on("up", () => eventLog.push("up"));
      handler.on("click", () => eventLog.push("click"));
      handler.on("select", () => eventLog.push("select"));

      // Simulate complete interaction sequence
      handler.onMouseOverHandler({ type: "over", interactionHandler: handler });
      handler.onMouseDownHandler({ type: "down", interactionHandler: handler });
      handler.onMouseUpHandler({ type: "up", interactionHandler: handler });

      expect(
        eventLog,
        "Event sequence should be: over, down, up, select, click",
      ).toEqual(["over", "down", "up", "select", "click"]);
    });

    it("should handle event listener removal during event emission", () => {
      const { handler } = createTestSetup();
      const selectEventSpy1 = vi.fn();
      const selectEventSpy2 = vi.fn(() => {
        // Remove the first listener during emission
        handler.off("select", selectEventSpy1);
      });

      handler.on("select", selectEventSpy1);
      handler.on("select", selectEventSpy2);

      // Trigger event
      handler.onMouseClick();

      expect(selectEventSpy1).toHaveBeenCalledTimes(1);
      expect(selectEventSpy2).toHaveBeenCalledTimes(1);

      // Next trigger should only call the remaining listener
      handler.onMouseClick();
      expect(selectEventSpy1).toHaveBeenCalledTimes(1); // Still 1
      expect(selectEventSpy2).toHaveBeenCalledTimes(2); // Now 2
    });

    it("should preserve value property in event objects across state changes", () => {
      const { handler } = createTestSetup();
      handler.value = { id: "test-checkbox", metadata: "important" };

      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      handler.onMouseClick();

      const emittedEvent = selectEventSpy.mock.calls[0][0];
      expect(emittedEvent.interactionHandler?.value).toEqual({
        id: "test-checkbox",
        metadata: "important",
      });
    });
  });

  describe("Legacy Compatibility", () => {
    it("should emit deprecation warning when using CheckBoxObject class", () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      const matSet = getMeshMaterialSet();
      const checkbox = new CheckBoxMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: matSet,
      });

      // Create CheckBoxObject instance
      new CheckBoxObject({ view: checkbox });

      expect(warnSpy).toHaveBeenCalledWith(
        "This class is deprecated. Use CheckBoxInteractionHandler instead.",
      );

      warnSpy.mockRestore();
    });

    it("should maintain identical functionality between CheckBoxInteractionHandler and CheckBoxObject", () => {
      const matSet = getMeshMaterialSet();
      const checkbox = new CheckBoxMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: matSet,
      });

      const legacyHandler = new CheckBoxObject({ view: checkbox });

      // Test core functionality
      expect(legacyHandler.selection).toBe(false);

      legacyHandler.selection = true;
      expect(legacyHandler.selection).toBe(true);

      const selectEventSpy = vi.fn();
      legacyHandler.on("select", selectEventSpy);

      legacyHandler.onMouseClick();
      expect(legacyHandler.selection).toBe(false);
      expect(selectEventSpy).toHaveBeenCalledTimes(1);
    });
  });
});
