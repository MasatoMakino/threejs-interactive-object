import { BoxGeometry } from "three";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  ClickableMesh,
  ClickableObject,
  ThreeMouseEventUtil,
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

      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));

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
      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      expect(handler.isPress, "Press state should be true after setup").toBe(
        true,
      );

      const upSpy = vi.fn();
      handler.on("up", upSpy);

      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

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

      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));

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
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));
      expect(handler.isOver, "Hover state should be true after setup").toBe(
        true,
      );

      const outSpy = vi.fn();
      handler.on("out", outSpy);

      handler.onMouseOutHandler(ThreeMouseEventUtil.generate("out", handler));

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
      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));
      expect(
        clickSpy,
        "Click should not be emitted without preceding down",
      ).toHaveBeenCalledTimes(0);

      // Test: down followed by up should emit click
      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));
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
      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      handler.onMouseOutHandler(ThreeMouseEventUtil.generate("out", handler));
      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

      expect(
        clickSpy,
        "Click should NOT be emitted when releasing outside",
      ).toHaveBeenCalledTimes(0);
    });

    it("should transition to over state on mouse up when hovering", () => {
      const { handler } = createTestSetup();

      // Set up hover and press states
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));
      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      expect(
        handler.state,
        "State should be 'down' after mouse down while hovering",
      ).toBe("down");

      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

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

      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));

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

      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

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
        handler.mouseEnabled,
        "mouseEnabled should be true by default",
      ).toBe(true);
      expect(handler.frozen, "frozen should be false by default").toBe(false);
    });

    it("should enable and disable correctly with enable/disable methods", () => {
      const { handler } = createTestSetup();

      handler.disable();
      expect(
        handler.state,
        "State should be 'disable' after calling disable()",
      ).toBe("disable");

      handler.enable();
      expect(
        handler.state,
        "State should be 'normal' after calling enable()",
      ).toBe("normal");
    });

    it("should enable and disable correctly with switchEnable method", () => {
      const { handler } = createTestSetup();

      handler.switchEnable(false);
      expect(
        handler.state,
        "State should be 'disable' when switchEnable(false)",
      ).toBe("disable");

      handler.switchEnable(true);
      expect(
        handler.state,
        "State should be 'normal' when switchEnable(true)",
      ).toBe("normal");
    });

    it("should ignore mouse events when frozen", () => {
      const { handler } = createTestSetup();
      handler.frozen = true;

      const downSpy = vi.fn();
      const overSpy = vi.fn();
      handler.on("down", downSpy);
      handler.on("over", overSpy);

      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));

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

    it("should ignore mouse events when disabled", () => {
      const { handler } = createTestSetup();
      handler.disable();

      const downSpy = vi.fn();
      const overSpy = vi.fn();
      handler.on("down", downSpy);
      handler.on("over", overSpy);

      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));

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

    it("should process events regardless of mouseEnabled property value", () => {
      const { handler } = createTestSetup();
      // Note: mouseEnabled is a property that currently doesn't affect event processing
      // This test documents current implementation behavior vs. property name expectation
      handler.mouseEnabled = false;

      const downSpy = vi.fn();
      handler.on("down", downSpy);

      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));

      // Current implementation: mouseEnabled property doesn't control event processing
      // Event processing is controlled by enable/disable and frozen states only
      expect(
        downSpy,
        "Events are processed regardless of mouseEnabled property value",
      ).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple rapid state transitions", () => {
      const { handler } = createTestSetup();

      expect(() => {
        handler.onMouseOverHandler(
          ThreeMouseEventUtil.generate("over", handler),
        );
        handler.onMouseDownHandler(
          ThreeMouseEventUtil.generate("down", handler),
        );
        handler.onMouseOutHandler(ThreeMouseEventUtil.generate("out", handler));
        handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));
        handler.onMouseOverHandler(
          ThreeMouseEventUtil.generate("over", handler),
        );
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
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));
      expect(handler.state, "Initial state should be 'over'").toBe("over");

      // Freeze and try to change state
      handler.frozen = true;
      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
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
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));
      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));
      handler.onMouseOutHandler(ThreeMouseEventUtil.generate("out", handler));

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

      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

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
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));
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
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));
      expect(
        clickable.material,
        "Over state should apply over material to view object",
      ).toBe(matSet.over.material);

      // Test down state
      handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
      expect(
        clickable.material,
        "Down state should apply down material to view object",
      ).toBe(matSet.down.material);

      // Test back to over state (mouse still over)
      handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));
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
      handler.onMouseOverHandler(ThreeMouseEventUtil.generate("over", handler));
      expect(handler.state, "Initial state should be 'over'").toBe("over");

      // Disable while hovering
      handler.disable();
      expect(handler.state, "State should change to 'disable'").toBe("disable");

      // Enable again while still hovering
      handler.enable();
      expect(
        handler.state,
        "State should return to 'normal' after enable",
      ).toBe("normal");
      expect(
        handler.isOver,
        "Hover state should be preserved during disable/enable",
      ).toBe(true);
    });
  });
});
