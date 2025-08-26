import { BoxGeometry } from "three";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClickableMesh,
  ClickableObject,
  createThreeMouseEvent,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

// Global spy for console.warn to avoid affecting other tests
const _globalWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("ButtonInteractionHandler", () => {
  beforeEach(() => {
    _globalWarnSpy.mockClear();
  });

  afterAll(() => {
    _globalWarnSpy.mockRestore();
  });

  const createTestSetup = () => {
    const matSet = getMeshMaterialSet();
    const clickable = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: matSet,
    });
    clickable.interactionHandler.value = "test button";
    const handler = clickable.interactionHandler;
    return { clickable, handler, matSet };
  };

  describe("Basic Interaction", () => {
    it("should handle mouse down events and set press state to true", () => {
      const { handler } = createTestSetup();
      expect(handler.isPress, "Initial press state should be false").toBe(
        false,
      );

      const downSpy = vi.fn();
      handler.on("down", downSpy);

      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));

      expect(
        handler.isPress,
        "Press state should be true after mouse down",
      ).toBe(true);
      expect(
        handler.state,
        "State should transition to 'down' on mouse down",
      ).toBe("down");
      expect(
        downSpy,
        "Down event should be emitted exactly once",
      ).toHaveBeenCalledTimes(1);
    });

    it("should handle mouse up events and reset press state", () => {
      const { handler } = createTestSetup();

      // Set up initial press state
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(handler.isPress, "Press state should be true after setup").toBe(
        true,
      );

      const upSpy = vi.fn();
      handler.on("up", upSpy);

      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));

      expect(
        handler.isPress,
        "Press state should be false after mouse up",
      ).toBe(false);
      expect(
        handler.state,
        "State should transition to 'normal' when not hovering",
      ).toBe("normal");
      expect(
        upSpy,
        "Up event should be emitted exactly once",
      ).toHaveBeenCalledTimes(1);
    });

    it("should handle mouse over events and set hover state", () => {
      const { handler } = createTestSetup();
      expect(handler.isOver, "Initial hover state should be false").toBe(false);

      const overSpy = vi.fn();
      handler.on("over", overSpy);

      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));

      expect(
        handler.isOver,
        "Hover state should be true after mouse over",
      ).toBe(true);
      expect(
        handler.state,
        "State should transition to 'over' on mouse over",
      ).toBe("over");
      expect(
        overSpy,
        "Over event should be emitted exactly once",
      ).toHaveBeenCalledTimes(1);
    });

    it("should handle mouse out events and reset hover state", () => {
      const { handler } = createTestSetup();

      // Set up initial hover state
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(handler.isOver, "Hover state should be true after setup").toBe(
        true,
      );

      const outSpy = vi.fn();
      handler.on("out", outSpy);

      handler.onMouseOutHandler(createThreeMouseEvent("out", handler));

      expect(
        handler.isOver,
        "Hover state should be false after mouse out",
      ).toBe(false);
      expect(
        handler.state,
        "State should transition to 'normal' on mouse out",
      ).toBe("normal");
      expect(
        outSpy,
        "Out event should be emitted exactly once",
      ).toHaveBeenCalledTimes(1);
    });

    it("should emit click event only when mouse up follows mouse down", () => {
      const { handler } = createTestSetup();
      const clickSpy = vi.fn();
      handler.on("click", clickSpy);

      // Test: up without down should not emit click
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(
        clickSpy,
        "Click should not be emitted without preceding down",
      ).toHaveBeenCalledTimes(0);

      // Test: down followed by up should emit click
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(
        clickSpy,
        "Click should be emitted after down-up sequence",
      ).toHaveBeenCalledTimes(1);
    });

    it("should NOT emit click when pointer leaves before release (down -> out -> up)", () => {
      const { handler } = createTestSetup();
      const clickSpy = vi.fn();
      handler.on("click", clickSpy);

      // Test: down -> out -> up should NOT emit click (corrected behavior)
      // Note: MouseEventManager delivers up events regardless of press state,
      // but ButtonInteractionHandler now resets _isPress on out to prevent unintended clicks
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      handler.onMouseOutHandler(createThreeMouseEvent("out", handler));
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));

      expect(
        clickSpy,
        "Click should NOT be emitted when releasing outside",
      ).toHaveBeenCalledTimes(0);
    });

    it("should transition to over state on mouse up when hovering", () => {
      const { handler } = createTestSetup();

      // Set up hover and press states
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(
        handler.state,
        "State should be 'down' after mouse down while hovering",
      ).toBe("down");

      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));

      expect(
        handler.state,
        "State should return to 'over' when releasing while hovering",
      ).toBe("over");
      expect(handler.isOver, "Hover state should remain true").toBe(true);
    });

    it("should track hover state even when handler is inactive", () => {
      const { handler } = createTestSetup();
      handler.disable();

      const overSpy = vi.fn();
      handler.on("over", overSpy);

      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));

      expect(
        handler.isOver,
        "Hover state should be tracked even when disabled",
      ).toBe(true);
      expect(
        overSpy,
        "Over event should not be emitted when disabled",
      ).toHaveBeenCalledTimes(0);
      expect(
        handler.state,
        "Visual state should remain 'disable' when inactive",
      ).toBe("disable");
    });

    it("should call onMouseClick hook when click occurs", () => {
      const { handler } = createTestSetup();

      // Spy on the onMouseClick method
      const clickHookSpy = vi.spyOn(handler, "onMouseClick");

      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));

      expect(
        clickHookSpy,
        "onMouseClick hook should be called during click interaction",
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe("State Management", () => {
    it("should initialize with correct default states", () => {
      const { handler } = createTestSetup();

      expect(handler.isPress, "Initial press state should be false").toBe(
        false,
      );
      expect(handler.isOver, "Initial hover state should be false").toBe(false);
      expect(
        handler.state,
        "Initial interaction state should be 'normal'",
      ).toBe("normal");
      expect(
        handler.interactionScannable,
        "interactionScannable should be true by default",
      ).toBe(true);
      expect(handler.frozen, "frozen should be false by default").toBe(false);
      expect(handler.enabled, "enabled should be true by default").toBe(true);
    });

    it("should enable and disable correctly with enable/disable methods", () => {
      const { handler } = createTestSetup();

      // Initial state should be enabled
      expect(handler.enabled, "Handler should be enabled initially").toBe(true);

      handler.disable();
      expect(
        handler.state,
        "State should be 'disable' after calling disable()",
      ).toBe("disable");
      expect(
        handler.enabled,
        "Handler should be disabled after disable()",
      ).toBe(false);

      handler.enable();
      expect(
        handler.state,
        "State should be 'normal' after calling enable()",
      ).toBe("normal");
      expect(handler.enabled, "Handler should be enabled after enable()").toBe(
        true,
      );
    });

    it("should enable and disable correctly with switchEnable method", () => {
      const { handler } = createTestSetup();

      // Initial state should be enabled
      expect(handler.enabled, "Handler should be enabled initially").toBe(true);

      handler.switchEnable(false);
      expect(
        handler.state,
        "State should be 'disable' when switchEnable(false)",
      ).toBe("disable");
      expect(
        handler.enabled,
        "Handler should be disabled after switchEnable(false)",
      ).toBe(false);

      handler.switchEnable(true);
      expect(
        handler.state,
        "State should be 'normal' when switchEnable(true)",
      ).toBe("normal");
      expect(
        handler.enabled,
        "Handler should be enabled after switchEnable(true)",
      ).toBe(true);
    });

    it("should ignore mouse events when frozen", () => {
      const { handler } = createTestSetup();
      handler.frozen = true;

      const downSpy = vi.fn();
      const overSpy = vi.fn();
      handler.on("down", downSpy);
      handler.on("over", overSpy);

      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));

      expect(
        downSpy,
        "Down event should not be emitted when frozen",
      ).toHaveBeenCalledTimes(0);
      expect(
        overSpy,
        "Over event should not be emitted when frozen",
      ).toHaveBeenCalledTimes(0);
      expect(handler.isPress, "Press state should not change when frozen").toBe(
        false,
      );
    });

    it("should not emit click when frozen between down and up events", () => {
      const { handler } = createTestSetup();
      const clickSpy = vi.fn();
      handler.on("click", clickSpy);

      // 1. Mouse down (press becomes true)
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(handler.isPress, "Press state should be true after down").toBe(
        true,
      );

      // 2. Freeze handler
      handler.frozen = true;

      // 3. Mouse up (should clear press state but not emit click due to early return)
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(handler.isPress, "Press state should be cleared after up").toBe(
        false,
      );
      expect(
        clickSpy,
        "Click should not be emitted when frozen",
      ).toHaveBeenCalledTimes(0);

      // 4. Unfreeze handler
      handler.frozen = false;

      // 5. Another mouse up (should not emit click - no stale press state)
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(
        clickSpy,
        "Click should still not be emitted after unfreeze",
      ).toHaveBeenCalledTimes(0);
    });

    it("should ignore mouse events when disabled", () => {
      const { handler } = createTestSetup();
      handler.disable();

      const downSpy = vi.fn();
      const overSpy = vi.fn();
      handler.on("down", downSpy);
      handler.on("over", overSpy);

      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));

      expect(
        downSpy,
        "Down event should not be emitted when disabled",
      ).toHaveBeenCalledTimes(0);
      expect(
        overSpy,
        "Over event should not be emitted when disabled",
      ).toHaveBeenCalledTimes(0);
      expect(
        handler.isPress,
        "Press state should not change when disabled",
      ).toBe(false);
    });

    it("should not emit click when disabled between down and up events", () => {
      const { handler } = createTestSetup();
      const clickSpy = vi.fn();
      handler.on("click", clickSpy);

      // 1. Mouse down (press becomes true)
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(handler.isPress, "Press state should be true after down").toBe(
        true,
      );

      // 2. Disable handler
      handler.disable();

      // 3. Mouse up (should clear press state but not emit click due to early return)
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(handler.isPress, "Press state should be cleared after up").toBe(
        false,
      );
      expect(
        clickSpy,
        "Click should not be emitted when disabled",
      ).toHaveBeenCalledTimes(0);

      // 4. Re-enable handler
      handler.enable();

      // 5. Another mouse up (should not emit click - no stale press state)
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(
        clickSpy,
        "Click should still not be emitted after enable",
      ).toHaveBeenCalledTimes(0);
    });
  });

  describe("Boundary Conditions & Error Handling", () => {
    it("should handle alpha values at boundary conditions", () => {
      const { handler } = createTestSetup();

      expect(() => {
        handler.alpha = 0.0;
        handler.alpha = 1.0;
        handler.alpha = 0.5;
      }, "Handler should accept valid alpha range without errors").not.toThrow();
    });

    it("should process events regardless of interactionScannable property value", () => {
      const { handler } = createTestSetup();
      // Note: interactionScannable controls MouseEventManager scanning, not handler-level event processing
      // At handler level, events are processed regardless of interactionScannable value
      handler.interactionScannable = false;

      const downSpy = vi.fn();
      handler.on("down", downSpy);

      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));

      // Handler-level processing: interactionScannable doesn't affect direct handler calls
      // Event processing is controlled by enable/disable and frozen states only
      expect(
        downSpy,
        "Events are processed regardless of interactionScannable property value",
      ).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple rapid state transitions", () => {
      const { handler } = createTestSetup();

      expect(() => {
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
        handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
        handler.onMouseOutHandler(createThreeMouseEvent("out", handler));
        handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
        handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      }, "Handler should handle rapid state transitions without errors").not.toThrow();
    });

    it("should emit ClickableObject deprecation warning", () => {
      expect(() => {
        const view = new ClickableMesh({
          geo: new BoxGeometry(1, 1, 1),
          material: getMeshMaterialSet(),
        });
        new ClickableObject({ view });
      }, "ClickableObject constructor should not throw").not.toThrow();

      expect(
        _globalWarnSpy,
        "ClickableObject should emit deprecation warning",
      ).toHaveBeenCalledWith(
        "This class is deprecated. Use ButtonInteractionHandler instead.",
      );
    });

    it("should maintain state consistency during frozen/unfrozen transitions", () => {
      const { handler } = createTestSetup();

      // Set up some initial state
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(handler.state, "Initial state should be 'over'").toBe("over");

      // Freeze and try to change state
      handler.frozen = true;
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(handler.state, "State should not change when frozen").toBe("over");

      // Unfreeze and verify state is consistent
      handler.frozen = false;
      expect(
        handler.state,
        "State should remain consistent after unfreezing",
      ).toBe("over");
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle complex mouse interaction sequences", () => {
      const { handler } = createTestSetup();

      const events: string[] = [];
      const eventTypes = ["over", "down", "up", "out", "click"] as const;
      for (const eventType of eventTypes) {
        handler.on(eventType, () => events.push(eventType));
      }

      // Execute complex interaction sequence
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      handler.onMouseOutHandler(createThreeMouseEvent("out", handler));

      expect(
        events,
        "Events should fire in correct sequence: over, down, up, click, out",
      ).toEqual(["over", "down", "up", "click", "out"]);
      expect(
        handler.state,
        "Final state should be 'normal' after complete sequence",
      ).toBe("normal");
    });

    it("should preserve custom value types in events", () => {
      const { handler } = createTestSetup();

      interface CustomValue {
        id: number;
        name: string;
        metadata: { category: string };
      }

      const customValue: CustomValue = {
        id: 42,
        name: "test-button",
        metadata: { category: "ui-control" },
      };

      handler.value = customValue;

      const clickSpy = vi.fn();
      handler.on("click", clickSpy);

      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));

      expect(
        clickSpy,
        "Click event should be emitted with custom value",
      ).toHaveBeenCalledTimes(1);
      const clickEvent = clickSpy.mock.calls[0][0];
      expect(
        clickEvent.interactionHandler?.value,
        "Custom value should be preserved in click event",
      ).toEqual(customValue);
    });

    it("should maintain interaction state when material set is replaced", () => {
      const { handler, clickable } = createTestSetup();
      const newMatSet = getMeshMaterialSet();

      // Set up hover state
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(handler.state, "State should be 'over' before replacement").toBe(
        "over",
      );

      // Replace material set while in hover state
      handler.materialSet = newMatSet;

      expect(
        handler.materialSet,
        "Material set should be updated to new set",
      ).toBe(newMatSet);
      expect(
        handler.state,
        "Interaction state should be preserved after replacement",
      ).toBe("over");
      expect(
        clickable.material,
        "View object should have new material set's 'over' material applied",
      ).toBe(newMatSet.over.material);
    });

    it("should apply correct materials to view object during state transitions", () => {
      const { handler, clickable, matSet } = createTestSetup();

      // Test normal state
      expect(
        clickable.material,
        "Initial state should have normal material",
      ).toBe(matSet.normal.material);

      // Test over state
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(
        clickable.material,
        "Over state should apply over material to view object",
      ).toBe(matSet.over.material);

      // Test down state
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(
        clickable.material,
        "Down state should apply down material to view object",
      ).toBe(matSet.down.material);

      // Test back to over state (mouse still over)
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler));
      expect(
        clickable.material,
        "Should return to over material when releasing while hovering",
      ).toBe(matSet.over.material);

      // Test disable state
      handler.disable();
      expect(
        clickable.material,
        "Disabled state should apply disable material",
      ).toBe(matSet.disable.material);
    });

    it("should handle state transitions during disable/enable cycles", () => {
      const { handler } = createTestSetup();

      // Set up hover state
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(handler.state, "Initial state should be 'over'").toBe("over");
      expect(handler.isOver, "Initial hover state should be true").toBe(true);

      // Disable while hovering
      handler.disable();
      expect(handler.state, "State should change to 'disable'").toBe("disable");
      expect(
        handler.isOver,
        "Hover state should be cleared when disabled",
      ).toBe(false);

      // Enable again (hover state was cleared on disable)
      handler.enable();
      expect(
        handler.state,
        "State should return to 'normal' after enable",
      ).toBe("normal");
      expect(
        handler.isOver,
        "Hover state should remain cleared after enable",
      ).toBe(false);
    });

    it("should clear press state when disabling during mouse interaction", () => {
      const { handler } = createTestSetup();

      // Start mouse interaction
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(handler.isPress, "Press state should be true after down").toBe(
        true,
      );

      // Disable while pressed
      handler.disable();
      expect(
        handler.isPress,
        "Press state should be cleared when disabled",
      ).toBe(false);
      expect(handler.state, "State should be 'disable'").toBe("disable");
    });

    it("should clear hover state when disabling during hover interaction", () => {
      const { handler } = createTestSetup();

      // Start hover
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(handler.isOver, "Hover state should be true after over").toBe(
        true,
      );
      expect(handler.state, "State should be 'over'").toBe("over");

      // Disable while hovering
      handler.disable();
      expect(
        handler.isOver,
        "Hover state should be cleared when disabled",
      ).toBe(false);
      expect(handler.state, "State should be 'disable'").toBe("disable");
    });

    it("should clear press state when freezing during mouse interaction", () => {
      const { handler } = createTestSetup();

      // Start mouse interaction
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler));
      expect(handler.isPress, "Press state should be true after down").toBe(
        true,
      );

      // Freeze while pressed
      handler.frozen = true;
      expect(handler.isPress, "Press state should be cleared when frozen").toBe(
        false,
      );
      expect(handler.state, "State should remain 'down' when frozen").toBe(
        "down",
      );
    });

    it("should clear hover state when freezing during hover interaction", () => {
      const { handler } = createTestSetup();

      // Start hover
      handler.onMouseOverHandler(createThreeMouseEvent("over", handler));
      expect(handler.isOver, "Hover state should be true after over").toBe(
        true,
      );
      expect(handler.state, "State should be 'over'").toBe("over");

      // Freeze while hovering
      handler.frozen = true;
      expect(handler.isOver, "Hover state should be cleared when frozen").toBe(
        false,
      );
      expect(handler.state, "State should remain 'over' when frozen").toBe(
        "over",
      );
    });
  });

  describe("Multi-touch Click Suppression", () => {
    it("should suppress click events for subsequent pointers in multi-touch", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const { handler } = createTestSetup();
      const clickEvents: Array<{ pointerId: number }> = [];

      handler.on("click", (event) => {
        clickEvents.push({ pointerId: event.pointerId });
      });

      // First pointer interaction
      const pointer1Event = createThreeMouseEvent("down", handler, POINTER_1);
      handler.onMouseDownHandler(pointer1Event);
      expect(handler.isPress).toBe(true);

      // Second pointer interaction
      const pointer2Event = createThreeMouseEvent("down", handler, POINTER_2);
      handler.onMouseDownHandler(pointer2Event);
      expect(handler.isPress).toBe(true);

      // Release first pointer - should trigger click
      const pointer1UpEvent = createThreeMouseEvent("up", handler, POINTER_1);
      handler.onMouseUpHandler(pointer1UpEvent);
      expect(clickEvents.length).toBe(1);
      expect(clickEvents[0].pointerId).toBe(POINTER_1);

      // Release second pointer - should NOT trigger click
      const pointer2UpEvent = createThreeMouseEvent("up", handler, POINTER_2);
      handler.onMouseUpHandler(pointer2UpEvent);
      expect(clickEvents.length).toBe(1); // Still only 1 click
    });

    it("should clear all press states after first click in multi-touch", () => {
      const { handler } = createTestSetup();

      // Multiple pointers down
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler, 1));
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler, 2));
      handler.onMouseDownHandler(createThreeMouseEvent("down", handler, 3));

      // Verify all pointers are in press state
      expect(handler.isPress).toBe(true);
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
      const pressPointerIds = (handler as any).pressPointerIds as Set<number>;
      expect(pressPointerIds.size).toBe(3);

      // Release first pointer - triggers click and clears all press states
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, 1));

      expect(pressPointerIds.size).toBe(0);
      expect(handler.isPress).toBe(false);
    });

    it("should suppress clicks regardless of pointer release order", () => {
      const POINTER_1 = 1;
      const POINTER_3 = 3;
      const POINTER_5 = 5;
      const { handler } = createTestSetup();
      const clickEvents: Array<{ pointerId: number }> = [];

      handler.on("click", (event) => {
        clickEvents.push({ pointerId: event.pointerId });
      });

      // Three pointers down
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_5),
      );
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_3),
      );
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_1),
      );

      // Release middle pointer first - should trigger click
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_3));
      expect(clickEvents.length).toBe(1);
      expect(clickEvents[0].pointerId).toBe(POINTER_3);

      // Release other pointers - should not trigger clicks
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_5));
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_1));
      expect(clickEvents.length).toBe(1); // Still only 1 click
    });

    it("should maintain single-touch click behavior compatibility", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const { handler } = createTestSetup();
      const clickEvents: Array<{ pointerId: number }> = [];

      handler.on("click", (event) => {
        clickEvents.push({ pointerId: event.pointerId });
      });

      // Single pointer interaction should work normally
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_1),
      );
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_1));
      expect(clickEvents.length).toBe(1);

      // Another single pointer interaction should work normally
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_2),
      );
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_2));
      expect(clickEvents.length).toBe(2);
    });

    it("should handle mixed single and multi-touch scenarios", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const POINTER_3 = 3;
      const POINTER_4 = 4;
      const { handler } = createTestSetup();
      const clickEvents: Array<{ pointerId: number }> = [];

      handler.on("click", (event) => {
        clickEvents.push({ pointerId: event.pointerId });
      });

      // Single touch first
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_1),
      );
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_1));
      expect(clickEvents.length).toBe(1);

      // Multi-touch scenario
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_2),
      );
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_3),
      );
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_2)); // First release triggers click
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_3)); // Second release suppressed
      expect(clickEvents.length).toBe(2);

      // Single touch again
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_4),
      );
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_4));
      expect(clickEvents.length).toBe(3);
    });

    it("should allow click when one pointer moves out during multi-touch", () => {
      const POINTER_A = 1;
      const POINTER_B = 2;
      const { handler } = createTestSetup();
      const clickEvents: Array<{ pointerId: number }> = [];

      handler.on("click", (event) => {
        clickEvents.push({ pointerId: event.pointerId });
      });

      // Both pointers down
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_A),
      );
      handler.onMouseDownHandler(
        createThreeMouseEvent("down", handler, POINTER_B),
      );
      expect(handler.isPress).toBe(true);
      // biome-ignore lint/suspicious/noExplicitAny: Accessing private property for testing
      const pressPointerIds = (handler as any).pressPointerIds as Set<number>;
      expect(pressPointerIds.size).toBe(2);

      // Pointer B moves out - should remove from press state
      handler.onMouseOutHandler(
        createThreeMouseEvent("out", handler, POINTER_B),
      );
      expect(pressPointerIds.size).toBe(1);
      expect(pressPointerIds.has(POINTER_A)).toBe(true);
      expect(pressPointerIds.has(POINTER_B)).toBe(false);

      // Pointer A up - should trigger click (only remaining pressed pointer)
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_A));
      expect(clickEvents.length).toBe(1);
      expect(clickEvents[0].pointerId).toBe(POINTER_A);

      // Pointer B up later - should NOT trigger click (not in press state)
      handler.onMouseUpHandler(createThreeMouseEvent("up", handler, POINTER_B));
      expect(clickEvents.length).toBe(1); // Still only 1 click
    });

    it("should maintain backward compatibility with mouseEnabled property", () => {
      const { handler } = createTestSetup();

      // Test getter/setter compatibility
      handler.mouseEnabled = false;
      expect(handler.interactionScannable).toBe(false);
      expect(handler.mouseEnabled).toBe(false);

      handler.interactionScannable = true;
      expect(handler.mouseEnabled).toBe(true);
      expect(handler.interactionScannable).toBe(true);

      // Test that both properties refer to the same underlying value
      handler.mouseEnabled = false;
      handler.interactionScannable = true;
      expect(handler.mouseEnabled).toBe(true); // Should reflect the latest change
    });
  });
});
