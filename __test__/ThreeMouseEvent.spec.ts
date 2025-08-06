import { BoxGeometry, MeshBasicMaterial } from "three";
import { describe, expect, test, vi } from "vitest";
import {
  CheckBoxMesh,
  ClickableMesh,
  StateMaterialSet,
  ThreeMouseEventMap,
  ThreeMouseEventUtil,
} from "../src/index.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

describe("ThreeMouseEvent", () => {
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
      ThreeMouseEventUtil.generate("select", clickable);
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

    const e = ThreeMouseEventUtil.generate("select", clickable);

    expect(e).toEqual(ThreeMouseEventUtil.clone(e));
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
        const event = ThreeMouseEventUtil.generate(eventType, clickable);

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
      let event = ThreeMouseEventUtil.generate("select", checkbox);

      expect(event.type).toBe("select");
      expect(event.interactionHandler).toBe(checkbox.interactionHandler);
      expect(event.isSelected).toBe(false);

      // Test with checked state
      checkbox.interactionHandler.selection = true;
      event = ThreeMouseEventUtil.generate("select", checkbox);

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
      const originalEvent = ThreeMouseEventUtil.generate("select", checkbox);

      expect(originalEvent.isSelected).toBe(false);

      // Change handler state after event creation
      checkbox.interactionHandler.selection = true;

      // Clone should reflect current handler state, not original event state
      const clonedEvent = ThreeMouseEventUtil.clone(originalEvent);

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
      const eventFromView = ThreeMouseEventUtil.generate("click", clickable);

      expect(eventFromView.type).toBe("click");
      expect(eventFromView.interactionHandler).toBe(
        clickable.interactionHandler,
      );

      // Test with ButtonInteractionHandler directly
      const eventFromHandler = ThreeMouseEventUtil.generate(
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
      const eventFromUndefined = ThreeMouseEventUtil.generate(
        "click",
        undefined,
      );

      expect(eventFromUndefined.type).toBe("click");
      expect(eventFromUndefined.interactionHandler).toBeUndefined();
      expect(eventFromUndefined.isSelected).toBeUndefined();
    });
  });
});
