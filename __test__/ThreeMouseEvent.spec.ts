import { BoxGeometry, MeshBasicMaterial } from "three";
import { afterAll, describe, expect, test, vi } from "vitest";
import {
  CheckBoxMesh,
  ClickableMesh,
  clone,
  cloneThreeMouseEvent,
  createThreeMouseEvent,
  generate,
  StateMaterialSet,
  type ThreeMouseEventMap,
  ThreeMouseEventUtil,
} from "../src/index.js";

describe("ThreeMouseEvent", () => {
  const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

  afterAll(() => {
    _spyWarn.mockRestore();
  });
  test("should throw error when generating select event for non-selectable objects", () => {
    const geometry = new BoxGeometry(3, 3, 3);
    const matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
    });

    const clickable = new ClickableMesh({
      geo: geometry,
      material: matSet,
    });

    expect(() => {
      createThreeMouseEvent("select", clickable);
    }).toThrowError("選択可能なボタン以外を引数にして");
  });

  test("should create identical event object with clone function", () => {
    const geometry = new BoxGeometry(3, 3, 3);
    const matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
    });

    const clickable = new CheckBoxMesh({
      geo: geometry,
      material: matSet,
    });

    const e = createThreeMouseEvent("select", clickable);

    expect(e).toEqual(cloneThreeMouseEvent(e));
  });

  describe("Event generation for all event types", () => {
    test("should generate all event types for basic button", () => {
      const geometry = new BoxGeometry(3, 3, 3);
      const matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0xff0000, transparent: true }),
      });

      const clickable = new ClickableMesh({
        geo: geometry,
        material: matSet,
      });

      // Test all non-select event types including click
      const eventTypes: Array<keyof ThreeMouseEventMap> = [
        "click",
        "over",
        "out",
        "down",
        "up",
      ];

      for (const eventType of eventTypes) {
        const event = createThreeMouseEvent(eventType, clickable);

        expect(event.type).toBe(eventType);
        expect(event.interactionHandler).toBe(clickable.interactionHandler);
        expect(event.isSelected).toBeUndefined(); // Basic buttons don't have selection
      }
    });

    test("should generate select event for checkbox with correct selection state", () => {
      const geometry = new BoxGeometry(3, 3, 3);
      const matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0x0000ff, transparent: true }),
      });

      const checkbox = new CheckBoxMesh({
        geo: geometry,
        material: matSet,
      });

      // Test with unchecked state
      checkbox.interactionHandler.selection = false;
      let event = createThreeMouseEvent("select", checkbox);

      expect(event.type).toBe("select");
      expect(event.interactionHandler).toBe(checkbox.interactionHandler);
      expect(event.isSelected).toBe(false);

      // Test with checked state
      checkbox.interactionHandler.selection = true;
      event = createThreeMouseEvent("select", checkbox);

      expect(event.type).toBe("select");
      expect(event.interactionHandler).toBe(checkbox.interactionHandler);
      expect(event.isSelected).toBe(true);
    });
  });

  describe("Event cloning with dynamic state reflection", () => {
    test("should reflect current selection state when cloning checkbox events", () => {
      const geometry = new BoxGeometry(3, 3, 3);
      const matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0xffff00, transparent: true }),
      });

      const checkbox = new CheckBoxMesh({
        geo: geometry,
        material: matSet,
      });

      // Initial state: unchecked
      checkbox.interactionHandler.selection = false;
      const originalEvent = createThreeMouseEvent("select", checkbox);

      expect(originalEvent.isSelected).toBe(false);

      // Change handler state after event creation
      checkbox.interactionHandler.selection = true;

      // Clone should reflect current handler state, not original event state
      const clonedEvent = cloneThreeMouseEvent(originalEvent);

      expect(clonedEvent.type).toBe(originalEvent.type);
      expect(clonedEvent.interactionHandler).toBe(
        originalEvent.interactionHandler,
      );
      expect(clonedEvent.isSelected).toBe(true); // Reflects current state, not original
    });
  });

  describe("Input type handling", () => {
    test("should handle different input types for event generation", () => {
      const geometry = new BoxGeometry(3, 3, 3);
      const matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0x123456, transparent: true }),
      });

      const clickable = new ClickableMesh({
        geo: geometry,
        material: matSet,
      });

      // Test with IClickableObject3D (view object)
      const eventFromView = createThreeMouseEvent("click", clickable);

      expect(eventFromView.type).toBe("click");
      expect(eventFromView.interactionHandler).toBe(
        clickable.interactionHandler,
      );

      // Test with ButtonInteractionHandler directly
      const eventFromHandler = createThreeMouseEvent(
        "click",
        clickable.interactionHandler,
      );

      expect(eventFromHandler.type).toBe("click");
      expect(eventFromHandler.interactionHandler).toBe(
        clickable.interactionHandler,
      );

      // Both should produce identical events
      expect(eventFromView).toEqual(eventFromHandler);

      // Test with undefined
      const eventFromUndefined = createThreeMouseEvent("click", undefined);

      expect(eventFromUndefined.type).toBe("click");
      expect(eventFromUndefined.interactionHandler).toBeUndefined();
      expect(eventFromUndefined.isSelected).toBeUndefined();
    });
  });

  /**
   * Legacy API Compatibility Tests
   *
   * These tests verify that deprecated APIs remain callable for backward compatibility.
   * They only check that functions can be invoked without throwing errors - they do
   * NOT test implementation details or return values, as those are covered by the
   * main test suites above.
   *
   * Purpose:
   * - Ensure deprecated exports remain accessible during migration period
   * - Detect breaking changes in legacy API surface
   * - Provide confidence for users transitioning to new APIs
   *
   * Removal:
   * This entire describe block should be removed when legacy API compatibility
   * is no longer required (e.g., in a future major version).
   */
  describe("Legacy API Compatibility", () => {
    test("should support deprecated namespace exports without errors", () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0x999999 }),
      });
      const clickable = new ClickableMesh({
        geo: geometry,
        material: matSet,
      });

      // Test ThreeMouseEventUtil.generate (namespace export)
      expect(() => {
        ThreeMouseEventUtil.generate("click", clickable);
      }).not.toThrow();

      // Test ThreeMouseEventUtil.clone (namespace export)
      const event = createThreeMouseEvent("click", clickable);
      expect(() => {
        ThreeMouseEventUtil.clone(event);
      }).not.toThrow();

      // Test ThreeMouseEventUtil.getInteractionHandler (namespace export)
      expect(() => {
        ThreeMouseEventUtil.getInteractionHandler(clickable);
      }).not.toThrow();

      // Test ThreeMouseEventUtil.getSelection (namespace export)
      const checkbox = new CheckBoxMesh({
        geo: geometry,
        material: matSet,
      });
      checkbox.interactionHandler.selection = true;
      expect(() => {
        ThreeMouseEventUtil.getSelection(checkbox.interactionHandler);
      }).not.toThrow();
    });

    test("should support deprecated direct function exports without errors", () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({ color: 0x999999 }),
      });
      const clickable = new ClickableMesh({
        geo: geometry,
        material: matSet,
      });

      // Test generate (direct export)
      expect(() => {
        generate("click", clickable);
      }).not.toThrow();

      // Test clone (direct export)
      const event = createThreeMouseEvent("click", clickable);
      expect(() => {
        clone(event);
      }).not.toThrow();
    });
  });
});
