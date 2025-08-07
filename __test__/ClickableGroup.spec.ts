import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ClickableGroup, ThreeMouseEventUtil } from "../src/index.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

describe("ClickableGroup", () => {
  let clickableGroup: ClickableGroup<string>;

  beforeEach(() => {
    clickableGroup = new ClickableGroup<string>();
    clickableGroup.interactionHandler.value = "test group value";
    // Ensure handler is in a clean state
    clickableGroup.interactionHandler.enable();
    clickableGroup.interactionHandler.frozen = false;
  });

  test("should initialize ClickableGroup with ButtonInteractionHandler", () => {
    expect(clickableGroup.interactionHandler).toBeDefined();
    expect(clickableGroup.interactionHandler.value).toBe("test group value");
    expect(clickableGroup.children.length).toBe(0);
  });

  test("should handle mouse over/out interactions without material changes", () => {
    const spyOver = vi.fn();
    const spyOut = vi.fn();

    clickableGroup.interactionHandler.on("over", spyOver);
    clickableGroup.interactionHandler.on("out", spyOut);

    // Simulate mouse over
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(spyOver).toHaveBeenCalledTimes(1);

    // Simulate mouse out
    clickableGroup.interactionHandler.onMouseOutHandler(
      ThreeMouseEventUtil.generate("out", clickableGroup),
    );
    expect(spyOut).toHaveBeenCalledTimes(1);

    // ClickableGroup should not have material property (unlike ClickableMesh)
    // biome-ignore lint/suspicious/noExplicitAny: Need to check non-existent property
    expect((clickableGroup as any).material).toBeUndefined();
  });

  test("should handle disable and enable states correctly", () => {
    const spyOver = vi.fn();
    clickableGroup.interactionHandler.on("over", spyOver);

    // Disable interactions (changes internal _enable state, not mouseEnabled)
    clickableGroup.interactionHandler.disable();

    // Mouse over should not trigger event when disabled
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(spyOver).not.toHaveBeenCalled();

    // Enable interactions
    clickableGroup.interactionHandler.enable();

    // Should now respond to mouse over
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(spyOver).toHaveBeenCalledTimes(1);
  });

  test("should handle frozen state", () => {
    const spyOver = vi.fn();

    clickableGroup.interactionHandler.on("over", spyOver);

    // Set frozen state
    clickableGroup.interactionHandler.frozen = true;

    // Mouse over should not trigger event when frozen
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(spyOver).not.toHaveBeenCalled();

    // Unfreeze
    clickableGroup.interactionHandler.frozen = false;

    // Should now respond to mouse over
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(spyOver).toHaveBeenCalledTimes(1);
  });

  test("should handle switch enable/disable functionality", () => {
    const spyOver = vi.fn();
    clickableGroup.interactionHandler.on("over", spyOver);

    // Disable and test that events don't fire
    clickableGroup.interactionHandler.switchEnable(false);

    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(spyOver).not.toHaveBeenCalled();

    // Re-enable and test that events fire
    clickableGroup.interactionHandler.switchEnable(true);

    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(spyOver).toHaveBeenCalledTimes(1);
  });

  test("should handle mouse up events", () => {
    const spyUp = vi.fn();

    clickableGroup.interactionHandler.on("up", spyUp);

    // Simulate mouse up
    clickableGroup.interactionHandler.onMouseUpHandler(
      ThreeMouseEventUtil.generate("up", clickableGroup),
    );

    expect(spyUp).toHaveBeenCalledTimes(1);
  });

  test("should handle mouse down and click events", () => {
    const spyDown = vi.fn();
    const spyClick = vi.fn();

    clickableGroup.interactionHandler.on("down", spyDown);
    clickableGroup.interactionHandler.on("click", spyClick);

    // Simulate mouse down
    clickableGroup.interactionHandler.onMouseDownHandler(
      ThreeMouseEventUtil.generate("down", clickableGroup),
    );
    expect(spyDown).toHaveBeenCalledTimes(1);

    // Simulate full click sequence (down + up)
    clickableGroup.interactionHandler.onMouseDownHandler(
      ThreeMouseEventUtil.generate("down", clickableGroup),
    );
    clickableGroup.interactionHandler.onMouseUpHandler(
      ThreeMouseEventUtil.generate("up", clickableGroup),
    );
    expect(spyClick).toHaveBeenCalledTimes(1);
  });

  test("should manage child objects", () => {
    const childMesh = new Mesh(
      new BoxGeometry(1, 1, 1),
      new MeshBasicMaterial({ color: 0xff0000 }),
    );

    // Add child object
    clickableGroup.add(childMesh);
    expect(clickableGroup.children.length).toBe(1);
    expect(clickableGroup.children[0]).toBe(childMesh);

    // Remove child object
    clickableGroup.remove(childMesh);
    expect(clickableGroup.children.length).toBe(0);
  });

  describe("ClickableGroup-specific functionality", () => {
    test("should manage multiple child objects with proper hierarchy", () => {
      const backgroundMesh = new Mesh(
        new BoxGeometry(4, 2, 0.1),
        new MeshBasicMaterial({ color: 0x333333 }),
      );

      const labelMesh = new Mesh(
        new BoxGeometry(3, 1, 0.2),
        new MeshBasicMaterial({ color: 0xffffff }),
      );
      labelMesh.position.z = 0.1;

      // Add multiple children
      clickableGroup.add(backgroundMesh);
      clickableGroup.add(labelMesh);

      expect(clickableGroup.children.length).toBe(2);
      expect(clickableGroup.children[0]).toBe(backgroundMesh);
      expect(clickableGroup.children[1]).toBe(labelMesh);

      // Remove specific child
      clickableGroup.remove(backgroundMesh);
      expect(clickableGroup.children.length).toBe(1);
      expect(clickableGroup.children[0]).toBe(labelMesh);

      // Clear all children
      clickableGroup.clear();
      expect(clickableGroup.children.length).toBe(0);
    });

    test("should work without child objects (empty group)", () => {
      // Group should work even without children
      expect(clickableGroup.children.length).toBe(0);

      // Events should still work on empty group
      const spyClick = vi.fn();
      clickableGroup.interactionHandler.on("click", spyClick);

      clickableGroup.interactionHandler.onMouseDownHandler(
        ThreeMouseEventUtil.generate("down", clickableGroup),
      );
      clickableGroup.interactionHandler.onMouseUpHandler(
        ThreeMouseEventUtil.generate("up", clickableGroup),
      );

      expect(spyClick).toHaveBeenCalledTimes(1);
    });

    test("should not affect child object materials (unlike ClickableMesh)", () => {
      const childMesh = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({ color: 0xff0000, opacity: 0.8 }),
      );

      const originalOpacity = childMesh.material.opacity;
      clickableGroup.add(childMesh);

      // Trigger interaction on group
      clickableGroup.interactionHandler.onMouseOverHandler(
        ThreeMouseEventUtil.generate("over", clickableGroup),
      );

      // Child material should remain unchanged
      expect(childMesh.material.opacity).toBe(originalOpacity);
      expect(childMesh.material.color.getHex()).toBe(0xff0000);
    });

    test("should support generic value type association", () => {
      interface CustomData {
        buttonId: string;
        category: string;
        priority: number;
      }

      const typedGroup = new ClickableGroup<CustomData>();
      typedGroup.interactionHandler.value = {
        buttonId: "compound-btn-001",
        category: "navigation",
        priority: 1,
      };

      expect(typedGroup.interactionHandler.value.buttonId).toBe(
        "compound-btn-001",
      );
      expect(typedGroup.interactionHandler.value.category).toBe("navigation");
      expect(typedGroup.interactionHandler.value.priority).toBe(1);
    });

    test("should maintain group transformation properties", () => {
      // Set group transformation
      clickableGroup.position.set(10, 5, 2);
      clickableGroup.rotation.y = Math.PI / 4;
      clickableGroup.scale.setScalar(2);

      const childMesh = new Mesh(
        new BoxGeometry(1, 1, 1),
        new MeshBasicMaterial({ color: 0x00ff00 }),
      );

      clickableGroup.add(childMesh);

      // Group transformations should be preserved
      expect(clickableGroup.position.x).toBe(10);
      expect(clickableGroup.position.y).toBe(5);
      expect(clickableGroup.position.z).toBe(2);
      expect(clickableGroup.rotation.y).toBeCloseTo(Math.PI / 4);
      expect(clickableGroup.scale.x).toBe(2);

      // Interaction should still work with transformed group
      const spyOver = vi.fn();
      clickableGroup.interactionHandler.on("over", spyOver);

      clickableGroup.interactionHandler.onMouseOverHandler(
        ThreeMouseEventUtil.generate("over", clickableGroup),
      );
      expect(spyOver).toHaveBeenCalledTimes(1);
    });
  });
});
