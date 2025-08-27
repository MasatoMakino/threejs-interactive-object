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
import {
  createThreeMouseEvent,
  type RadioButtonInteractionHandler,
  RadioButtonMesh,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

describe("RadioButtonInteractionHandler", () => {
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

  /**
   * Creates a standard test setup with RadioButtonMesh, interaction handler, and material set.
   *
   * @returns Test setup object containing radioButton, handler, and matSet
   *
   * @description
   * Sets up a complete test environment with:
   * - RadioButtonMesh with BoxGeometry (3x3x3)
   * - Full StateMaterialSet for all interaction states
   * - Handler configured with test value "test radio button"
   */
  const createTestSetup = () => {
    const matSet = getMeshMaterialSet();
    const radioButton = new RadioButtonMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: matSet,
    });
    radioButton.interactionHandler.value = "test radio button";
    const handler = radioButton.interactionHandler;
    return { radioButton, handler, matSet };
  };

  /**
   * Simulates a complete mouse click interaction sequence (hover → down → up).
   *
   * @param handler - The RadioButtonInteractionHandler to simulate interaction on
   *
   * @description
   * Triggers a full click event sequence that mimics real user interaction:
   * 1. Mouse over (hover state)
   * 2. Mouse down (press state)
   * 3. Mouse up (completes click, triggers onMouseClick)
   *
   * This is useful for testing complete user interaction flows and verifying
   * that selection state changes and events are emitted correctly.
   */
  const simulateCompleteClick = (
    handler: RadioButtonInteractionHandler<unknown>,
  ) => {
    handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
    handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
    handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
  };

  /**
   * Simulates mouse leaving the interactive object area.
   *
   * @param handler - The RadioButtonInteractionHandler to simulate mouse out on
   *
   * @description
   * Triggers mouse out event to return the object to normal state when not selected.
   * This clears hover state and resets press state to prevent unintended clicks.
   * Useful for testing state transitions when user moves cursor away from the object.
   */
  const simulateMouseOut = (
    handler: RadioButtonInteractionHandler<unknown>,
  ) => {
    handler.onMouseOutHandler(createThreeMouseEvent("out", handler));
  };

  describe("Internal Override API for RadioButtonManager", () => {
    it("should force selection despite disable state", () => {
      const { handler } = createTestSetup();

      // Disable radio button
      handler.disable();
      expect(handler.selection).toBe(false);

      // Internal API should force selection change
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      // But handler is still disabled, so public API is still blocked
      handler.selection = false;
      expect(handler.selection).toBe(true); // Unchanged due to disable state
    });

    it("should force selection despite exclusive selection state", () => {
      const { handler } = createTestSetup();

      // Mark as exclusively selected and select
      handler.isExclusivelySelected = true;
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      // Internal API should force deselection
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });

    it("should bypass both disable and exclusive selection via internal API", () => {
      const { handler } = createTestSetup();

      // Disable and mark as exclusively selected
      handler.disable();
      handler.isExclusivelySelected = true;

      // Internal API should still work
      handler._setSelectionOverride(true);
      expect(handler.selection).toBe(true);

      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });
  });

  describe("RadioButtonManager Integration Scenarios", () => {
    it("should support RadioButtonManager exclusive selection workflow", () => {
      const { handler } = createTestSetup();

      // Simulate RadioButtonManager workflow
      handler.selection = true;
      handler.isExclusivelySelected = true;
      handler._setSelectionOverride(true);

      expect(handler.selection).toBe(true);
      expect(handler.isExclusivelySelected).toBe(true);

      // Public API should respect exclusive selection state
      handler.selection = false;
      expect(handler.selection).toBe(true); // Should remain selected

      // Internal API should still work
      handler._setSelectionOverride(false);
      expect(handler.selection).toBe(false);
    });
  });

  describe("Exclusive Selection State Management", () => {
    it("should block public API when isExclusivelySelected is true", () => {
      const { handler } = createTestSetup();

      // Initially allow selection
      handler.selection = true;
      expect(handler.selection, "Initial selection should work normally").toBe(
        true,
      );

      // Mark as exclusively selected
      handler.isExclusivelySelected = true;

      // Public API should respect exclusive selection state (cannot deselect)
      handler.selection = false;
      expect(
        handler.selection,
        "Public API should be blocked by isExclusivelySelected state",
      ).toBe(true);

      // Public API should also be blocked for selection changes
      handler.selection = true;
      expect(
        handler.selection,
        "Selection should remain unchanged when exclusively selected",
      ).toBe(true);
    });

    it("should allow internal API to bypass isExclusivelySelected restrictions", () => {
      const { handler } = createTestSetup();

      // Set up exclusively selected state
      handler.isExclusivelySelected = true;
      handler._setSelectionOverride(true);
      expect(
        handler.selection,
        "Internal API should work despite exclusive state",
      ).toBe(true);

      // Internal API should be able to deselect despite exclusive state
      handler._setSelectionOverride(false);
      expect(
        handler.selection,
        "Internal API should bypass exclusive selection restriction",
      ).toBe(false);

      // Verify public API is still blocked
      handler.selection = true;
      expect(handler.selection, "Public API should remain blocked").toBe(false);
    });

    it("should handle combined disable and exclusive selection states", () => {
      const { handler } = createTestSetup();

      // Test disable state blocking
      handler.disable();
      handler.selection = true;
      expect(handler.selection, "Disabled state should block selection").toBe(
        false,
      );

      // Test isExclusivelySelected state blocking after enable
      handler.enable();
      handler.selection = true;
      expect(handler.selection, "Should work normally when enabled").toBe(true);

      handler.isExclusivelySelected = true;
      handler.selection = false;
      expect(
        handler.selection,
        "Exclusively selected state should block deselection",
      ).toBe(true);

      // Test combined states
      handler.disable();
      handler._setSelectionOverride(false);
      expect(
        handler.selection,
        "Internal API should work despite both disabled and exclusive states",
      ).toBe(false);
    });

    it("should block mouse interactions when disabled or exclusively selected", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Initially should respond to complete mouse interaction (enabled, not exclusively selected)
      simulateCompleteClick(handler);
      expect(
        selectEventSpy,
        "Should respond to interactions initially",
      ).toHaveBeenCalledTimes(1);
      expect(
        handler.selection,
        "Should be selected after initial interaction",
      ).toBe(true);

      // Reset for next test
      selectEventSpy.mockClear();
      handler.selection = false;
      simulateMouseOut(handler);

      // Disable should make unresponsive to mouse interactions
      handler.disable();
      simulateCompleteClick(handler);
      expect(
        selectEventSpy,
        "Should not respond to interactions when disabled",
      ).not.toHaveBeenCalled();
      expect(
        handler.selection,
        "Selection should remain unchanged when disabled",
      ).toBe(false);

      // Re-enable should make responsive again
      handler.enable();
      simulateCompleteClick(handler);
      expect(
        selectEventSpy,
        "Should respond to interactions when re-enabled",
      ).toHaveBeenCalledTimes(1);
      expect(
        handler.selection,
        "Should be selected after re-enable interaction",
      ).toBe(true);

      // Exclusively selected should make unresponsive to mouse interactions
      selectEventSpy.mockClear();
      handler.isExclusivelySelected = true;
      simulateMouseOut(handler);
      simulateCompleteClick(handler);
      expect(
        selectEventSpy,
        "Should not respond to interactions when exclusively selected",
      ).not.toHaveBeenCalled();
      expect(
        handler.selection,
        "Selection should remain unchanged when exclusively selected",
      ).toBe(true);

      // Both disabled and exclusively selected should remain unresponsive
      handler.disable();
      simulateCompleteClick(handler);
      expect(
        selectEventSpy,
        "Should remain unresponsive with both conditions",
      ).not.toHaveBeenCalled();

      // Only removing both should make responsive
      handler.enable();
      simulateCompleteClick(handler);
      expect(
        selectEventSpy,
        "Should still be unresponsive with only exclusive state",
      ).not.toHaveBeenCalled();

      handler.isExclusivelySelected = false;
      simulateCompleteClick(handler);
      expect(
        selectEventSpy,
        "Should be responsive when both conditions removed",
      ).toHaveBeenCalled();
    });
  });

  describe("RadioButtonManager Integration", () => {
    it("should restore hover state when deselecting via internal API", () => {
      const { handler, radioButton, matSet } = createTestSetup();

      // Start with selection
      handler._setSelectionOverride(true);
      expect(
        radioButton.material,
        "Should show normalSelect material when selected",
      ).toBe(matSet.normalSelect.material);

      // Simulate hover state
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));

      // Deselect - should restore hover state from internal flags
      handler._setSelectionOverride(false);

      expect(
        handler.selection,
        "Selection should be false after deselection",
      ).toBe(false);
      expect(handler.isOver, "Hover state should remain true").toBe(true);
      expect(
        radioButton.material,
        "Should restore hover material from internal flags",
      ).toBe(matSet.over.material);
    });
  });

  describe("Event Emission Differential Behavior", () => {
    it("should NOT emit events when _setSelectionOverride is used (internal API)", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Internal API selection change - should not emit events
      handler._setSelectionOverride(true);
      expect(
        selectEventSpy,
        "Internal API selection should not emit events",
      ).not.toHaveBeenCalled();

      // Internal API deselection - should not emit events
      handler._setSelectionOverride(false);
      expect(
        selectEventSpy,
        "Internal API deselection should not emit events",
      ).not.toHaveBeenCalled();

      // Multiple internal changes - should not emit events
      handler._setSelectionOverride(true);
      handler._setSelectionOverride(false);
      handler._setSelectionOverride(true);
      expect(
        selectEventSpy,
        "Multiple internal API changes should not emit events",
      ).not.toHaveBeenCalled();
    });

    it("should emit events normally when using onMouseClick (user interaction)", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // User click operation - should emit event
      handler.onMouseClick();
      expect(
        selectEventSpy,
        "User click should emit select event",
      ).toHaveBeenCalledTimes(1);
      expect(
        selectEventSpy,
        "Event should indicate selected state",
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: true,
          interactionHandler: handler,
        }),
      );

      // Another user click operation
      selectEventSpy.mockClear();
      handler.onMouseClick();
      expect(
        selectEventSpy,
        "Second click should emit deselection event",
      ).toHaveBeenCalledTimes(1);
      expect(
        selectEventSpy,
        "Event should indicate deselected state",
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "select",
          isSelected: false,
          interactionHandler: handler,
        }),
      );
    });

    it("should produce identical results for onMouseClick and full mouse flow", () => {
      const { handler } = createTestSetup();
      const selectEventSpy = vi.fn();
      handler.on("select", selectEventSpy);

      // Both onMouseClick() and full mouse flow should behave identically when active
      handler.onMouseClick();
      const directCallResult = {
        selection: handler.selection,
        eventCount: selectEventSpy.mock.calls.length,
      };

      // Reset
      handler.selection = false;
      selectEventSpy.mockClear();

      // Test full mouse flow
      simulateCompleteClick(handler);
      const mouseFlowResult = {
        selection: handler.selection,
        eventCount: selectEventSpy.mock.calls.length,
      };

      expect(
        directCallResult,
        "onMouseClick() and mouse event flow should produce identical results when active",
      ).toEqual(mouseFlowResult);
    });
  });

  describe("Material Update Radio-Specific Behavior", () => {
    it("should force normalSelect material when _setSelectionOverride selects in hover state", () => {
      const { handler, radioButton, matSet } = createTestSetup();

      // Start in hover state
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(radioButton.material, "Should show hover material").toBe(
        matSet.over.material,
      );
      expect(handler.isOver, "Should be in hover state").toBe(true);

      // Internal API selection should force normal state display
      handler._setSelectionOverride(true);
      expect(
        radioButton.material,
        "Should force normalSelect material despite hover",
      ).toBe(matSet.normalSelect.material);
      expect(handler.isOver, "Hover state should be preserved internally").toBe(
        true,
      );
      expect(handler.selection, "Selection should be true").toBe(true);
    });

    it("should restore hover state after deselection (improved behavior)", () => {
      const { handler, radioButton, matSet } = createTestSetup();

      // Start in hover state, then select
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(radioButton.material, "Should show hover material initially").toBe(
        matSet.over.material,
      );

      handler._setSelectionOverride(true);
      expect(
        radioButton.material,
        "Should show normalSelect (forces normal state)",
      ).toBe(matSet.normalSelect.material);
      expect(handler.isOver, "Hover state should be preserved internally").toBe(
        true,
      );

      // Internal API deselection should restore hover state from flags
      handler._setSelectionOverride(false);
      expect(
        radioButton.material,
        "Should restore hover state after deselection",
      ).toBe(matSet.over.material);
      expect(
        handler.isOver,
        "Hover state should still be preserved internally",
      ).toBe(true);
      expect(handler.selection, "Selection should be false").toBe(false);
    });

    it("should handle materialSet changes during internal state management", () => {
      const { handler, radioButton, matSet } = createTestSetup();
      const newMatSet = getMeshMaterialSet();

      // Set up state: hover, then select (which forces normal state)
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      handler._setSelectionOverride(true);
      expect(
        radioButton.material,
        "Should show normalSelect with original materialSet",
      ).toBe(matSet.normalSelect.material);

      // Change materialSet during interaction
      handler.materialSet = newMatSet;
      expect(
        radioButton.material,
        "Should immediately update to new materialSet",
      ).toBe(newMatSet.normalSelect.material);
      expect(handler.selection, "Selection state should be preserved").toBe(
        true,
      );
      expect(handler.isOver, "Hover state should be preserved").toBe(true);

      // Continue interaction with new materialSet (deselection should restore hover state)
      handler._setSelectionOverride(false);
      expect(
        radioButton.material,
        "Should use new materialSet and restore hover state",
      ).toBe(newMatSet.over.material);
    });

    it("should maintain selection-aware materials during complex state transitions", () => {
      const { handler, radioButton, matSet } = createTestSetup();

      // Test unselected state materials
      expect(radioButton.material, "Normal unselected").toBe(
        matSet.normal.material,
      );

      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(radioButton.material, "Hover unselected").toBe(
        matSet.over.material,
      );

      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(radioButton.material, "Down unselected").toBe(
        matSet.down.material,
      );

      // Select during press state (forces normal state)
      handler._setSelectionOverride(true);
      expect(
        radioButton.material,
        "Should force normalSelect even during press",
      ).toBe(matSet.normalSelect.material);

      // Release triggers onMouseClick which toggles selection (true->false) and restores over state
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(
        radioButton.material,
        "Should show over material after UP toggles selection (false, over)",
      ).toBe(matSet.over.material);

      // Move out should show unselected normal
      handler.onMouseOutHandler(createThreeMouseEvent("out", handler));
      expect(
        radioButton.material,
        "Should show normal material (false, normal)",
      ).toBe(matSet.normal.material);
    });

    it("should handle disable state override during material management", () => {
      const { handler, radioButton, matSet } = createTestSetup();

      // Start with hover, then select (which forces normal state)
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      handler._setSelectionOverride(true);
      expect(
        radioButton.material,
        "Should show normalSelect (forced normal state)",
      ).toBe(matSet.normalSelect.material);

      // Disable should override all states
      handler.disable();
      expect(
        radioButton.material,
        "Disable should override all materials",
      ).toBe(matSet.disable.material);
      expect(
        handler.selection,
        "Selection should be preserved during disable",
      ).toBe(true);

      // Re-enable should restore appropriate state
      handler.enable();
      expect(
        radioButton.material,
        "Should restore normalSelect after re-enable",
      ).toBe(matSet.normalSelect.material);
    });
  });

  describe("checkActivity() Base Class Invariant Preservation", () => {
    let handler: RadioButtonInteractionHandler<unknown>;
    let eventSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      ({ handler } = createTestSetup());
      eventSpy = vi.fn();
      handler.on("over", eventSpy);
    });

    describe("Individual State Controls", () => {
      it("should respect frozen state", () => {
        // Test frozen state blocks interactions
        handler.frozen = true;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(eventSpy, "Should NOT emit when frozen").toHaveBeenCalledTimes(
          0,
        );

        // Test that unfreezing restores interaction
        // Clean up hover state before unfreezing
        simulateMouseOut(handler);
        handler.frozen = false;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(eventSpy, "Should emit after unfreezing").toHaveBeenCalledTimes(
          1,
        );
      });

      it("should respect exclusively selected state", () => {
        // Test exclusively selected state blocks interactions
        handler.isExclusivelySelected = true;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(
          eventSpy,
          "Should NOT emit when exclusively selected",
        ).toHaveBeenCalledTimes(0);

        // Test that deselection restores interaction
        // Note: Clean up hover state first with out event, then test deselection
        handler.onMouseOutHandler(createThreeMouseEvent("out", handler));
        handler.isExclusivelySelected = false;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(eventSpy, "Should emit after deselection").toHaveBeenCalledTimes(
          1,
        );
      });

      it("should respect disabled state from base class", () => {
        // Test disabled state blocks interactions
        handler.disable();
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(eventSpy, "Should NOT emit when disabled").toHaveBeenCalledTimes(
          0,
        );

        // Test that re-enabling restores interaction
        // Note: Clean up hover state first with out event, then test enable
        handler.onMouseOutHandler(createThreeMouseEvent("out", handler));
        handler.enable();
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(eventSpy, "Should emit after re-enabling").toHaveBeenCalledTimes(
          1,
        );
      });
    });

    describe("State Combination Logic", () => {
      it("should block interactions when frozen regardless of exclusive selection state", () => {
        // frozen + not exclusively selected = blocked
        handler.frozen = true;
        handler.isExclusivelySelected = false;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(
          eventSpy,
          "Should NOT emit when frozen (even if not exclusively selected)",
        ).toHaveBeenCalledTimes(0);

        // frozen + exclusively selected = blocked
        handler.isExclusivelySelected = true;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(
          eventSpy,
          "Should NOT emit when both frozen and exclusively selected",
        ).toHaveBeenCalledTimes(0);
      });

      it("should block interactions when exclusively selected regardless of frozen state", () => {
        // not frozen + exclusively selected = blocked
        handler.frozen = false;
        handler.isExclusivelySelected = true;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(
          eventSpy,
          "Should NOT emit when exclusively selected (even if not frozen)",
        ).toHaveBeenCalledTimes(0);
      });

      it("should allow interactions only when both frozen=false and exclusively selected=false", () => {
        // Set both conditions to blocking state first
        handler.frozen = true;
        handler.isExclusivelySelected = true;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(
          eventSpy,
          "Should NOT emit when both blocking conditions are active",
        ).toHaveBeenCalledTimes(0);

        // Clear one condition - should still be blocked
        handler.frozen = false;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(
          eventSpy,
          "Should still be blocked by exclusively selected",
        ).toHaveBeenCalledTimes(0);

        // Clear the other condition - should now work
        // Note: Clean up hover state first with out event, then test final state
        handler.onMouseOutHandler(createThreeMouseEvent("out", handler));
        handler.isExclusivelySelected = false;
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        expect(
          eventSpy,
          "Should emit when both conditions are cleared",
        ).toHaveBeenCalledTimes(1);
      });
    });
  });
});
