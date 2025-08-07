import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  Sprite,
  SpriteMaterial,
} from "three";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  ClickableGroup,
  ClickableMesh,
  ThreeMouseEventUtil,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

// Helper functions for common test patterns (low-risk utilities)
// biome-ignore lint/suspicious/noExplicitAny: Helper function for testing non-existent properties
const expectPlainObject = (obj: any, name: string) => {
  expect(
    obj.interactionHandler,
    `${name} should not have interactionHandler`,
  ).toBeUndefined();
};

describe("ClickableGroup", () => {
  let clickableGroup: ClickableGroup<string>;

  beforeEach(() => {
    clickableGroup = new ClickableGroup<string>();
    clickableGroup.interactionHandler.value = "main-group-value";
    // Ensure handler is in a clean, responsive state for each test
    clickableGroup.interactionHandler.enable();
    clickableGroup.interactionHandler.frozen = false;
  });

  test("should initialize ClickableGroup with ButtonInteractionHandler", () => {
    expect(clickableGroup.interactionHandler).toBeDefined();
    expect(clickableGroup.interactionHandler.value).toBe("main-group-value");
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
    const overEventSpy = vi.fn();
    clickableGroup.interactionHandler.on("over", overEventSpy);

    // Test disable() - should block all interaction events
    clickableGroup.interactionHandler.disable();
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(overEventSpy).not.toHaveBeenCalled(
      /* disable() should block all events */
    );

    // Test enable() - should restore interaction responsiveness
    clickableGroup.interactionHandler.enable();
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(overEventSpy).toHaveBeenCalledTimes(
      1 /* enable() should restore event processing */,
    );
  });

  test("should handle frozen state", () => {
    const frozenTestSpy = vi.fn();
    clickableGroup.interactionHandler.on("over", frozenTestSpy);

    // Test frozen = true - should block all events while preserving handler state
    clickableGroup.interactionHandler.frozen = true;
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(frozenTestSpy).not.toHaveBeenCalled(
      /* frozen=true should block events */
    );

    // Test frozen = false - should restore event processing immediately
    clickableGroup.interactionHandler.frozen = false;
    clickableGroup.interactionHandler.onMouseOverHandler(
      ThreeMouseEventUtil.generate("over", clickableGroup),
    );
    expect(frozenTestSpy).toHaveBeenCalledTimes(
      1 /* frozen=false should restore events */,
    );
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

  describe("Event bubbling integration with MouseEventManager", () => {
    let managerScene: MouseEventManagerScene;
    let parentGroup: ClickableGroup<string>;
    let childMesh: ClickableMesh<string>;

    const halfW = MouseEventManagerScene.W / 2;
    const halfH = MouseEventManagerScene.H / 2;

    beforeEach(() => {
      managerScene = new MouseEventManagerScene();

      parentGroup = new ClickableGroup<string>();
      parentGroup.interactionHandler.value = "parent-group";
      parentGroup.interactionHandler.enable();
      parentGroup.interactionHandler.frozen = false;

      childMesh = new ClickableMesh({
        geo: new BoxGeometry(2, 2, 2),
        material: getMeshMaterialSet(),
      });
      childMesh.interactionHandler.value = "child-mesh";

      parentGroup.add(childMesh);
      managerScene.scene.add(parentGroup);

      // Initialize scene state
      managerScene.reset();
    });

    afterEach(() => {
      // Clean up DOM elements to prevent memory leaks in test suite
      if (managerScene.canvas.parentNode) {
        managerScene.canvas.parentNode.removeChild(managerScene.canvas);
      }
      // Reset scene objects to prevent cross-test contamination
      managerScene.scene.clear();
    });

    describe("Basic bubbling behavior", () => {
      test("should bubble click events from child mesh to parent group", () => {
        const spyChild = vi.fn();
        const spyParent = vi.fn();

        childMesh.interactionHandler.on("click", spyChild);
        parentGroup.interactionHandler.on("click", spyParent);

        // Simulate click on child mesh (mouse events dispatch to canvas center where child is positioned)
        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        expect(spyChild).toHaveBeenCalledTimes(1);
        expect(spyParent).toHaveBeenCalledTimes(1);
      });

      test("should bubble mouse over/out events through hierarchy", () => {
        const spyChildOver = vi.fn();
        const spyChildOut = vi.fn();
        const spyParentOver = vi.fn();
        const spyParentOut = vi.fn();

        childMesh.interactionHandler.on("over", spyChildOver);
        childMesh.interactionHandler.on("out", spyChildOut);
        parentGroup.interactionHandler.on("over", spyParentOver);
        parentGroup.interactionHandler.on("out", spyParentOut);

        // Mouse over child
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

        expect(spyChildOver).toHaveBeenCalledTimes(1);
        expect(spyParentOver).toHaveBeenCalledTimes(1);

        // Mouse out from child
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", 0, 0);

        expect(spyChildOut).toHaveBeenCalledTimes(1);
        expect(spyParentOut).toHaveBeenCalledTimes(1);
      });

      test("should respect mouseEnabled property in bubbling chain", () => {
        const spyChild = vi.fn();
        const spyParent = vi.fn();

        childMesh.interactionHandler.on("click", spyChild);
        parentGroup.interactionHandler.on("click", spyParent);

        // Disable parent group mouseEnabled
        parentGroup.interactionHandler.mouseEnabled = false;

        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        // Child should still receive events, but parent should not
        expect(spyChild).toHaveBeenCalledTimes(1);
        expect(spyParent).not.toHaveBeenCalled();

        // Re-enable parent and test again
        parentGroup.interactionHandler.mouseEnabled = true;
        spyChild.mockClear();

        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        expect(spyChild).toHaveBeenCalledTimes(1);
        expect(spyParent).toHaveBeenCalledTimes(1);
      });
    });

    describe("Event value propagation", () => {
      test("should preserve individual handler values during event bubbling", () => {
        const childHandlerValue: string[] = [];
        const parentHandlerValue: string[] = [];

        childMesh.interactionHandler.on("click", () => {
          childHandlerValue.push(childMesh.interactionHandler.value || "");
        });

        parentGroup.interactionHandler.on("click", () => {
          parentHandlerValue.push(parentGroup.interactionHandler.value || "");
        });

        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        // Each handler should retain its own value when events are received
        expect(childHandlerValue).toEqual(["child-mesh"]);
        expect(parentHandlerValue).toEqual(["parent-group"]);

        // Verify that both handlers maintain their distinct values
        expect(childMesh.interactionHandler.value).toBe("child-mesh");
        expect(parentGroup.interactionHandler.value).toBe("parent-group");
      });

      test("should trigger events on both child and parent during bubbling", () => {
        let childEventReceived = false;
        let parentEventReceived = false;

        childMesh.interactionHandler.on("click", (event) => {
          childEventReceived = true;
          // Event should exist and have correct type
          expect(event.type).toBe("click");
        });

        parentGroup.interactionHandler.on("click", (event) => {
          parentEventReceived = true;
          // Event should exist and have correct type
          expect(event.type).toBe("click");
        });

        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        // Both child and parent should receive the click event through bubbling
        expect(childEventReceived).toBe(true);
        expect(parentEventReceived).toBe(true);
      });
    });

    describe("Multi-level hierarchy bubbling", () => {
      test("should bubble events through multiple Group levels", () => {
        // Create additional hierarchy: grandParentGroup > parentGroup > childMesh
        const grandParentGroup = new ClickableGroup<string>();
        grandParentGroup.interactionHandler.value = "grandparent-group";

        // Move existing parent-child structure into grandparent
        managerScene.scene.remove(parentGroup);
        grandParentGroup.add(parentGroup);
        managerScene.scene.add(grandParentGroup);

        const spyChild = vi.fn();
        const spyParent = vi.fn();
        const spyGrandParent = vi.fn();

        childMesh.interactionHandler.on("click", spyChild);
        parentGroup.interactionHandler.on("click", spyParent);
        grandParentGroup.interactionHandler.on("click", spyGrandParent);

        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        // All three levels should receive the click event
        expect(spyChild).toHaveBeenCalledTimes(1);
        expect(spyParent).toHaveBeenCalledTimes(1);
        expect(spyGrandParent).toHaveBeenCalledTimes(1);
      });

      test("should maintain proper event order in complex hierarchy", () => {
        const grandParentGroup = new ClickableGroup<string>();
        grandParentGroup.interactionHandler.value = "grandparent-group";

        managerScene.scene.remove(parentGroup);
        grandParentGroup.add(parentGroup);
        managerScene.scene.add(grandParentGroup);

        const eventOrder: string[] = [];

        childMesh.interactionHandler.on("click", () => {
          eventOrder.push("child");
        });

        parentGroup.interactionHandler.on("click", () => {
          eventOrder.push("parent");
        });

        grandParentGroup.interactionHandler.on("click", () => {
          eventOrder.push("grandparent");
        });

        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        // Events should bubble from child to parent to grandparent
        expect(eventOrder).toEqual(["child", "parent", "grandparent"]);
      });
    });

    describe("Material isolation during bubbling", () => {
      test("should not affect child materials during parent group interactions", () => {
        const originalChildMaterial = childMesh.material;
        const childMaterialSet = childMesh.interactionHandler.materialSet;
        if (!childMaterialSet)
          throw new Error("Child material set is undefined");

        // Verify initial state
        expect(childMesh.material).toBe(childMaterialSet.normal.material);

        // Simulate mouse over on child mesh (this should change child material to 'over')
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

        expect(childMesh.material).toBe(childMaterialSet.over.material);
        expect(childMesh.material).not.toBe(originalChildMaterial);

        // Parent group should not have material property and should not affect child
        // biome-ignore lint/suspicious/noExplicitAny: Need to check non-existent property
        expect((parentGroup as any).material).toBeUndefined();

        // Mouse out should restore child material to normal, parent group should remain unchanged
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", 0, 0);

        expect(childMesh.material).toBe(childMaterialSet.normal.material);
        // biome-ignore lint/suspicious/noExplicitAny: Need to check non-existent property
        expect((parentGroup as any).material).toBeUndefined();

        // Verify that child material changes are independent of parent group events
        const spyParent = vi.fn();
        parentGroup.interactionHandler.on("over", spyParent);

        // Trigger mouse over again
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

        // Both child and parent should receive over events, but only child material changes
        expect(childMesh.material).toBe(childMaterialSet.over.material);
        expect(spyParent).toHaveBeenCalledTimes(1);
        // biome-ignore lint/suspicious/noExplicitAny: Need to check non-existent property
        expect((parentGroup as any).material).toBeUndefined();
      });
    });
  });

  describe("Plain object children as event triggers", () => {
    let managerScene: MouseEventManagerScene;
    let parentGroup: ClickableGroup<string>;
    let plainMesh: Mesh;
    let plainSprite: Sprite;

    const halfW = MouseEventManagerScene.W / 2;
    const halfH = MouseEventManagerScene.H / 2;

    beforeEach(() => {
      managerScene = new MouseEventManagerScene();

      parentGroup = new ClickableGroup<string>();
      parentGroup.interactionHandler.value = "composite-button";
      parentGroup.interactionHandler.enable();
      parentGroup.interactionHandler.frozen = false;

      // Create plain Mesh (no interaction handler)
      plainMesh = new Mesh(
        new BoxGeometry(3, 1.5, 0.1),
        new MeshBasicMaterial({ color: 0x444444 }),
      );

      // Create plain Sprite (no interaction handler)
      plainSprite = new Sprite(new SpriteMaterial({ color: 0xffffff }));
      plainSprite.position.z = 0.1; // Position sprite slightly forward

      parentGroup.add(plainMesh);
      parentGroup.add(plainSprite);
      managerScene.scene.add(parentGroup);

      // Initialize scene state
      managerScene.reset();
    });

    afterEach(() => {
      // Clean up DOM elements to prevent memory leaks in test suite
      if (managerScene.canvas.parentNode) {
        managerScene.canvas.parentNode.removeChild(managerScene.canvas);
      }
      // Reset scene objects to prevent cross-test contamination
      managerScene.scene.clear();
    });

    describe("Basic plain object triggering", () => {
      test("should trigger parent Group events when clicking plain Mesh children", () => {
        const spyParent = vi.fn();
        parentGroup.interactionHandler.on("click", spyParent);

        // Verify that plain mesh has no interaction handler
        expectPlainObject(plainMesh, "Plain mesh");

        // Click on plain mesh should trigger parent group event
        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        expect(spyParent).toHaveBeenCalledTimes(1);
      });

      test("should trigger parent Group events when clicking plain Sprite children", () => {
        const spyParent = vi.fn();
        parentGroup.interactionHandler.on("click", spyParent);

        // Verify that plain sprite has no interaction handler
        expectPlainObject(plainSprite, "Plain sprite");

        // Click on plain sprite should trigger parent group event
        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        expect(spyParent).toHaveBeenCalledTimes(1);
      });

      test("should handle multiple plain children as unified trigger area", () => {
        // Add additional plain objects to simulate complex UI
        const backgroundMesh = new Mesh(
          new BoxGeometry(4, 2, 0.05),
          new MeshBasicMaterial({ color: 0x333333 }),
        );
        backgroundMesh.position.z = -0.1;

        const iconSprite = new Sprite(new SpriteMaterial({ color: 0x00ff00 }));
        iconSprite.position.set(1, 0, 0.2);
        iconSprite.scale.setScalar(0.5);

        parentGroup.add(backgroundMesh);
        parentGroup.add(iconSprite);

        const spyParent = vi.fn();
        parentGroup.interactionHandler.on("click", spyParent);

        // Click anywhere should trigger the same parent group
        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        expect(spyParent).toHaveBeenCalledTimes(1);

        // Verify all children are plain objects (no interaction handlers)
        expectPlainObject(plainMesh, "Plain mesh");
        expectPlainObject(plainSprite, "Plain sprite");
        expectPlainObject(backgroundMesh, "Background mesh");
        expectPlainObject(iconSprite, "Icon sprite");
      });
    });

    describe("Plain object material independence", () => {
      test("should not change plain children materials during parent interactions", () => {
        // Record original materials
        const originalMeshMaterial = plainMesh.material;
        const originalSpriteMaterial = plainSprite.material;

        const spyParent = vi.fn();
        parentGroup.interactionHandler.on("over", spyParent);

        // Trigger mouse over on parent group via plain children
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

        // Parent should receive event
        expect(spyParent).toHaveBeenCalledTimes(1);

        // Plain children materials should remain unchanged
        expect(plainMesh.material).toBe(originalMeshMaterial);
        expect(plainSprite.material).toBe(originalSpriteMaterial);

        // Trigger mouse out
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", 0, 0);

        // Materials should still be unchanged
        expect(plainMesh.material).toBe(originalMeshMaterial);
        expect(plainSprite.material).toBe(originalSpriteMaterial);
      });

      test("should maintain plain children visual state regardless of interaction state", () => {
        // Record original materials and properties
        const originalMeshMaterial = plainMesh.material;
        const originalMeshColor = (
          plainMesh.material as MeshBasicMaterial
        ).color.getHex();
        const originalSpriteColor = (
          plainSprite.material as SpriteMaterial
        ).color.getHex();

        // Disable parent group
        parentGroup.interactionHandler.disable();

        // Plain children should maintain their visual appearance
        expect(plainMesh.material).toBe(originalMeshMaterial);
        expect((plainMesh.material as MeshBasicMaterial).color.getHex()).toBe(
          originalMeshColor,
        );
        expect((plainSprite.material as SpriteMaterial).color.getHex()).toBe(
          originalSpriteColor,
        );

        // Enable parent group
        parentGroup.interactionHandler.enable();

        // Plain children should still maintain their visual appearance
        expect(plainMesh.material).toBe(originalMeshMaterial);
        expect((plainMesh.material as MeshBasicMaterial).color.getHex()).toBe(
          originalMeshColor,
        );
        expect((plainSprite.material as SpriteMaterial).color.getHex()).toBe(
          originalSpriteColor,
        );

        // Trigger interaction to confirm parent state changes but children don't
        const spyParent = vi.fn();
        parentGroup.interactionHandler.on("click", spyParent);

        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        expect(spyParent).toHaveBeenCalledTimes(1);

        // Children materials should remain completely independent
        expect(plainMesh.material).toBe(originalMeshMaterial);
        expect((plainSprite.material as SpriteMaterial).color.getHex()).toBe(
          originalSpriteColor,
        );
      });
    });

    describe("Mixed plain and clickable hierarchy", () => {
      test("should handle mixed plain and clickable children correctly", () => {
        // Add a ClickableMesh to the existing plain objects
        const clickableMesh = new ClickableMesh({
          geo: new BoxGeometry(2, 2, 0.1),
          material: getMeshMaterialSet(),
        });
        clickableMesh.interactionHandler.value = "interactive-child";
        // Position in front of plain objects to ensure it gets hit first
        clickableMesh.position.set(0, 0, 0.2);

        parentGroup.add(clickableMesh);

        // Advance timer to avoid MouseEventManager throttling
        managerScene.interval();

        const spyParent = vi.fn();
        const spyClickableChild = vi.fn();

        parentGroup.interactionHandler.on("click", spyParent);
        clickableMesh.interactionHandler.on("click", spyClickableChild);

        // Click on center where both plain and clickable children can be hit
        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        expect(spyClickableChild).toHaveBeenCalledTimes(1);
        expect(spyParent).toHaveBeenCalledTimes(1);

        // Verify mixed hierarchy: plain objects have no handlers, clickable objects do
        expectPlainObject(plainMesh, "Plain mesh");
        expectPlainObject(plainSprite, "Plain sprite");
        expect(clickableMesh.interactionHandler).toBeDefined();
      });

      test("should simulate realistic UI component with plain decorative elements", () => {
        // Create a realistic button component:
        // - Background mesh (plain, decorative)
        // - Icon sprite (plain, decorative)
        // - Label mesh (clickable, functional)
        const backgroundMesh = new Mesh(
          new BoxGeometry(4, 1.2, 0.05),
          new MeshBasicMaterial({ color: 0x2c2c2c }),
        );
        backgroundMesh.position.z = -0.1;

        const iconSprite = new Sprite(new SpriteMaterial({ color: 0x4a90e2 }));
        iconSprite.position.set(-1.2, 0, 0.1);
        iconSprite.scale.setScalar(0.3);

        const labelMesh = new ClickableMesh({
          geo: new BoxGeometry(3, 1, 0.1),
          material: getMeshMaterialSet(),
        });
        labelMesh.interactionHandler.value = "button-label";
        // Position in front of other objects to ensure it gets hit first
        labelMesh.position.set(0, 0, 0.2);

        // Add all components to the group
        parentGroup.add(backgroundMesh);
        parentGroup.add(iconSprite);
        parentGroup.add(labelMesh);

        // Advance timer to avoid MouseEventManager throttling
        managerScene.interval();

        const spyGroup = vi.fn();
        const spyLabel = vi.fn();

        parentGroup.interactionHandler.on("click", spyGroup);
        labelMesh.interactionHandler.on("click", spyLabel);

        // Click on center where all components can be hit
        managerScene.dispatchMouseEvent("pointerdown", halfW, halfH);
        managerScene.dispatchMouseEvent("pointerup", halfW, halfH);

        // Group should always receive event (unified interaction area)
        expect(spyGroup).toHaveBeenCalledTimes(1);

        // Label should also receive event (bubbling from functional element)
        expect(spyLabel).toHaveBeenCalledTimes(1);

        // Verify component structure: decorative (plain) + functional (clickable)
        expectPlainObject(backgroundMesh, "Background mesh (decorative)");
        expectPlainObject(iconSprite, "Icon sprite (decorative)");
        expect(labelMesh.interactionHandler).toBeDefined(); // Functional

        // Verify parent group provides unified interaction surface
        expect(parentGroup.interactionHandler.value).toBe("composite-button");
      });
    });
  });
});
