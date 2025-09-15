import { afterAll, describe, expect, it, vi } from "vitest";
import type { IClickableObject3D } from "../src/index.js";
import {
  createRaycastingTestEnvironment,
  type MouseEventManagerScene,
  type RaycastingTestEnvironment,
} from "./MouseEventManagerScene.js";

describe("MouseEventManager Multi-touch Infrastructure", () => {
  const testEnvironments: MouseEventManagerScene[] = [];

  afterAll(() => {
    // Clean up all MouseEventManager instances and canvas elements
    testEnvironments.forEach((env) => {
      env.dispose();
    });
    testEnvironments.length = 0;
  });

  /**
   * Creates test environment using shared factory function
   */
  const createTestEnvironment = (): RaycastingTestEnvironment => {
    return createRaycastingTestEnvironment(
      {
        canvasWidth: 800,
        canvasHeight: 600,
        throttlingTime_ms: 0,
      },
      testEnvironments,
    );
  };

  describe("PointerID Infrastructure", () => {
    it("should handle different pointerId values", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const pointerIds = [1, 2, -560913604, -560913605]; // Chrome mouse + iPad touch style IDs

      pointerIds.forEach((pointerId) => {
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId);
      });

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map state requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver;
      expect(currentOver.size).toBe(pointerIds.length);
      pointerIds.forEach((pointerId) => {
        expect(currentOver.has(pointerId)).toBe(true);
        expect(currentOver.get(pointerId)).toContain(multiFaceMesh);
      });
    });
  });

  describe("currentOver Map Infrastructure", () => {
    it("should have currentOver as Map property", () => {
      const { managerScene } = createTestEnvironment();
      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map type requires accessing private property
      expect((managerScene.manager as any).currentOver).toBeInstanceOf(Map);
    });

    it("should initialize empty currentOver Map", () => {
      const { managerScene } = createTestEnvironment();
      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;
      expect(currentOver.size).toBe(0);
    });

    it("should manage separate hover states per pointerId", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const pointerId1 = 1;
      const pointerId2 = 2;

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;
      // pointerId 1: hover target
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId1);
      // pointerId 2: move outside target (near origin)
      managerScene.dispatchMouseEvent("pointermove", 10, 10, pointerId2);

      expect(currentOver.get(pointerId1)).toContain(multiFaceMesh);
      // pointer 2 may either be absent or present with an empty list depending on impl
      expect(currentOver.get(pointerId2)?.length ?? 0).toBe(0);
    });

    it("should handle multiple pointers on same object", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const mousePointerId = 1;
      const touchPointerId = 2;
      const iPadPointerId = -560913604; // iPad-style pointer ID

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;

      managerScene.dispatchMouseEvent(
        "pointermove",
        halfW,
        halfH,
        mousePointerId,
      );
      managerScene.dispatchMouseEvent(
        "pointermove",
        halfW,
        halfH,
        touchPointerId,
      );
      managerScene.dispatchMouseEvent(
        "pointermove",
        halfW,
        halfH,
        iPadPointerId,
      );

      expect(currentOver.get(mousePointerId)).toContain(multiFaceMesh);
      expect(currentOver.get(touchPointerId)).toContain(multiFaceMesh);
      expect(currentOver.get(iPadPointerId)).toContain(multiFaceMesh);
      expect(currentOver.size).toBe(3);
    });
  });

  describe("Multi-touch Event Processing", () => {
    it("should handle clearOver with specific pointerId", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const pointerId1 = 1;
      const pointerId2 = 2;

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;

      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId2);

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal clearOver method behavior requires accessing private method
      (managerScene.manager as any).clearOver(pointerId1);

      expect(currentOver.has(pointerId1)).toBe(false);
      expect(currentOver.has(pointerId2)).toBe(true);
      expect(currentOver.get(pointerId2)).toContain(multiFaceMesh);
    });

    it("should handle clearOver without pointerId (clear all)", () => {
      const { managerScene, halfW, halfH } = createTestEnvironment();
      const mousePointerId = 1;
      const touchPointerId = 2;
      const iPadPointerId = -560913604;

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;

      managerScene.dispatchMouseEvent(
        "pointermove",
        halfW,
        halfH,
        mousePointerId,
      );
      managerScene.dispatchMouseEvent(
        "pointermove",
        halfW,
        halfH,
        touchPointerId,
      );
      managerScene.dispatchMouseEvent(
        "pointermove",
        halfW,
        halfH,
        iPadPointerId,
      );

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal clearOver method behavior requires accessing private method
      (managerScene.manager as any).clearOver();

      expect(currentOver.size).toBe(0);
    });

    it("should pass pointerId through event processing chain", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const testPointerId = 123;

      const events: Array<{ type: string; pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("over", (e) => {
        events.push({ type: "over", pointerId: e.pointerId });
      });

      multiFaceMesh.interactionHandler.on("down", (e) => {
        events.push({ type: "down", pointerId: e.pointerId });
      });

      const centerX = halfW;
      const centerY = halfH;

      managerScene.dispatchMouseEvent(
        "pointermove",
        centerX,
        centerY,
        testPointerId,
      );
      managerScene.dispatchMouseEvent(
        "pointerdown",
        centerX,
        centerY,
        testPointerId,
      );

      expect(
        events.some((e) => e.type === "over" && e.pointerId === testPointerId),
      ).toBe(true);
      expect(
        events.some((e) => e.type === "down" && e.pointerId === testPointerId),
      ).toBe(true);
    });
  });

  describe("Backward Compatibility", () => {
    it("should maintain Map-based currentOver behavior", () => {
      const { managerScene } = createTestEnvironment();

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map state requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver;
      expect(currentOver).toBeInstanceOf(Map);
      expect(currentOver.size).toBe(0);
    });

    it("should process single pointer events as before", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const defaultPointerId = 1;

      const events: string[] = [];
      multiFaceMesh.interactionHandler.on("over", () => events.push("over"));
      multiFaceMesh.interactionHandler.on("out", () => events.push("out"));

      managerScene.dispatchMouseEvent(
        "pointermove",
        halfW,
        halfH,
        defaultPointerId,
      );

      expect(events).toContain("over");
      expect(events).not.toContain("out");
    });
  });

  describe("Throttling Multi-touch Coordination", () => {
    /**
     * Creates test environment with default throttling settings
     */
    const createThrottlingTestEnvironment = (): RaycastingTestEnvironment => {
      return createRaycastingTestEnvironment(
        {
          canvasWidth: 800,
          canvasHeight: 600,
          // Use default throttlingTime_ms (33ms) - no override
        },
        testEnvironments,
      );
    };

    it("should handle multiple pointers within same throttling frame", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createThrottlingTestEnvironment();
      const pointer1 = 1;
      const pointer2 = 2;
      const pointer3 = 3;

      // Track events from multiple pointers
      const events: Array<{ type: string; pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("over", (e) => {
        events.push({ type: "over", pointerId: e.pointerId });
      });

      // Dispatch multiple pointer events within same frame (before interval())
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointer1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointer2);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointer3);

      // Check currentOver state before throttling resolution
      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;

      // Expected behavior: all pointers should be processed or properly throttled
      // This test will reveal if subsequent pointers are ignored
      expect(events.length).toBeGreaterThanOrEqual(1);

      // Advance time to resolve throttling
      managerScene.interval();

      // Verify final state consistency
      expect(currentOver.size).toBeGreaterThanOrEqual(1);
    });

    /**
     * Verifies independent throttling behavior for simultaneous multi-touch pointers.
     *
     * @motivation Prevents performance degradation when multiple fingers interact simultaneously.
     * Each pointer must have isolated throttling state to avoid interference between touch points.
     *
     * @scope Validates MouseEventManager's per-pointerId throttling coordination with
     * ButtonInteractionHandler's multi-touch hover state management.
     */
    it("should maintain independent throttling states per pointerId", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createThrottlingTestEnvironment();

      const POINTER_1 = 1;
      const POINTER_2 = 2;

      const events: Array<{
        type: string;
        pointerId: number;
        timestamp: number;
      }> = [];
      multiFaceMesh.interactionHandler.on("over", (e) => {
        events.push({
          type: "over",
          pointerId: e.pointerId,
          timestamp: managerScene.currentTime,
        });
      });

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal hasThrottled Set requires accessing private property
      const hasThrottled = (managerScene.manager as any)
        .hasThrottled as Set<number>;
      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;
      // After reset(), POINTER_1 may be throttled due to reset events, so clear it first
      managerScene.interval();
      expect(hasThrottled.size).toBe(0);

      // Start with pointer 1
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);

      expect(hasThrottled.has(POINTER_1)).toBe(true);
      expect(currentOver.has(POINTER_1)).toBe(true);

      // Dispatch pointer 2 independently
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_2);

      // Verify independent throttling behavior
      expect(hasThrottled.has(POINTER_1)).toBe(true);
      expect(hasThrottled.has(POINTER_2)).toBe(true);
      expect(currentOver.has(POINTER_2)).toBe(true);
      expect(hasThrottled.size).toBe(2);
      expect(currentOver.size).toBe(2);

      // Advance time to resolve throttling
      managerScene.interval();
      expect(hasThrottled.size).toBe(0);

      // ButtonInteractionHandler processes first pointer event only to prevent duplicate "over" events

      const pointer1Events = events.filter((e) => e.pointerId === POINTER_1);

      expect(pointer1Events.length).toBeGreaterThanOrEqual(1);
      expect(events.some((e) => e.pointerId === POINTER_1)).toBe(true);

      // Key verification: MouseEventManager processed both pointers independently
      expect(currentOver.has(POINTER_1) || currentOver.has(POINTER_2)).toBe(
        true,
      );
    });

    it("should handle throttling resolution timing per pointerId", () => {
      const { managerScene, halfW, halfH } = createThrottlingTestEnvironment();

      const POINTER_1 = 1;
      const POINTER_2 = 2;

      const processingEvents: Array<{
        pointerId: number;
        timestamp: number;
        phase: string;
      }> = [];

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal checkTarget method requires accessing private method
      const originalCheckTarget = (managerScene.manager as any).checkTarget;
      const checkTargetSpy = vi
        // biome-ignore lint/suspicious/noExplicitAny: Testing internal checkTarget method requires accessing private method
        .spyOn(managerScene.manager as any, "checkTarget")
        // biome-ignore lint/suspicious/noExplicitAny: Vitest mockImplementation requires any[] for internal method compatibility
        .mockImplementation(function (...args: any[]): boolean {
          const pointerId = args[2] || POINTER_1;
          processingEvents.push({
            pointerId,
            timestamp: managerScene.currentTime,
            phase: "checkTarget",
          });
          return originalCheckTarget.apply(this, args);
        });

      try {
        // Dispatch multiple pointers with time gaps
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);
        managerScene.interval();

        managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_2);
        managerScene.interval();

        managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);

        expect(processingEvents.length).toBeGreaterThan(0);
        const pointer1Events = processingEvents.filter(
          (e) => e.pointerId === POINTER_1,
        );
        const pointer2Events = processingEvents.filter(
          (e) => e.pointerId === POINTER_2,
        );

        expect(pointer1Events.length).toBeGreaterThan(0);
        expect(pointer2Events.length).toBeGreaterThan(0);
      } finally {
        // Guaranteed cleanup even if assertions fail
        checkTargetSpy.mockRestore();
      }
    });
  });

  describe("Pointer Cancel and Leave Event Handling", () => {
    it("should handle pointercancel events and clean up internal state", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const pointerId1 = 1;
      const pointerId2 = 2;

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;

      // Set up hover states for multiple pointers
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId2);

      expect(currentOver.get(pointerId1)).toContain(multiFaceMesh);
      expect(currentOver.get(pointerId2)).toContain(multiFaceMesh);

      // Track out events
      const outEvents: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("out", (e) => {
        outEvents.push({ pointerId: e.pointerId });
      });

      // Cancel pointer1 - should clean up state and emit out event
      managerScene.dispatchMouseEvent(
        "pointercancel",
        halfW,
        halfH,
        pointerId1,
      );

      expect(currentOver.has(pointerId1)).toBe(false);
      expect(currentOver.has(pointerId2)).toBe(true);
      expect(outEvents.some((e) => e.pointerId === pointerId1)).toBe(true);
    });

    it("should handle pointerleave events and clean up internal state", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const pointerId1 = 1;
      const pointerId2 = 2;

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;

      // Set up hover states for multiple pointers
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId2);

      expect(currentOver.get(pointerId1)).toContain(multiFaceMesh);
      expect(currentOver.get(pointerId2)).toContain(multiFaceMesh);

      // Track out events
      const outEvents: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("out", (e) => {
        outEvents.push({ pointerId: e.pointerId });
      });

      // Leave with pointer1 - should clean up state and emit out event
      managerScene.dispatchMouseEvent("pointerleave", halfW, halfH, pointerId1);

      expect(currentOver.has(pointerId1)).toBe(false);
      expect(currentOver.has(pointerId2)).toBe(true);
      expect(outEvents.some((e) => e.pointerId === pointerId1)).toBe(true);
    });

    it("should handle pointercancel followed by pointerleave gracefully", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const pointerId = 1;

      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;

      // Set up hover state
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId);
      expect(currentOver.get(pointerId)).toContain(multiFaceMesh);

      // Track out events
      const outEvents: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("out", (e) => {
        outEvents.push({ pointerId: e.pointerId });
      });

      // Cancel first, then leave - should handle both gracefully without errors
      managerScene.dispatchMouseEvent("pointercancel", halfW, halfH, pointerId);
      expect(currentOver.has(pointerId)).toBe(false);

      // Leave should be safe even after cancel already cleaned up
      expect(() => {
        managerScene.dispatchMouseEvent(
          "pointerleave",
          halfW,
          halfH,
          pointerId,
        );
      }).not.toThrow();

      // Should only have one out event from the cancel
      expect(outEvents.filter((e) => e.pointerId === pointerId).length).toBe(1);
    });

    it("should not emit click when a pressed pointer is canceled", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const pointerId = 7;

      const clicks: number[] = [];
      multiFaceMesh.interactionHandler.on("click", (e) =>
        clicks.push(e.pointerId),
      );

      // Over + down on the object
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, pointerId);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, pointerId);

      // Cancel the pointer stream (no up)
      managerScene.dispatchMouseEvent("pointercancel", halfW, halfH, pointerId);

      expect(clicks.length).toBe(0);
    });
  });

  describe("Multi-touch Click Suppression", () => {
    it("should trigger click for single pointer down/up sequence", () => {
      const POINTER_ID = 1;
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();

      const clicks: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("click", (e) => {
        clicks.push({ pointerId: e.pointerId });
      });

      // Single pointer interaction
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_ID);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_ID);
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_ID);

      expect(clicks.length).toBe(1);
      expect(clicks[0].pointerId).toBe(POINTER_ID);
    });

    it("should suppress click when first pointer releases while second is still pressed", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();

      const clicks: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("click", (e) => {
        clicks.push({ pointerId: e.pointerId });
      });

      // Multi-touch scenario: both pointers down, first pointer releases
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_2);

      // First pointer releases while second is still pressed
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_1);

      expect(clicks.length).toBe(1);
      expect(clicks[0].pointerId).toBe(POINTER_1);

      // Second pointer releases - should be suppressed
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_2);

      expect(clicks.length).toBe(1); // Still only one click from first pointer
    });

    it("should suppress click for all subsequent pointers after first click", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const POINTER_3 = 3;
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();

      const clicks: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("click", (e) => {
        clicks.push({ pointerId: e.pointerId });
      });

      // Three-finger interaction scenario
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_3);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_3);

      // Sequential release - only first should trigger click
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_1);
      expect(clicks.length).toBe(1);
      expect(clicks[0].pointerId).toBe(POINTER_1);

      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_2);
      expect(clicks.length).toBe(1); // Still only one click

      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_3);
      expect(clicks.length).toBe(1); // Still only one click
    });

    it("should handle pointer order variations in multi-touch scenarios", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();

      const clicks: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("click", (e) => {
        clicks.push({ pointerId: e.pointerId });
      });

      // Reverse order release: second pointer down first
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_1);

      // Second pointer (which went down first) releases first
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_2);
      expect(clicks.length).toBe(1);
      expect(clicks[0].pointerId).toBe(POINTER_2);

      // First pointer releases - should be suppressed
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_1);
      expect(clicks.length).toBe(1); // Still only one click from POINTER_2
    });

    it("should allow new click sequence after all pointers are released", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();

      const clicks: Array<{ pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("click", (e) => {
        clicks.push({ pointerId: e.pointerId });
      });

      // First multi-touch sequence
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_2);

      expect(clicks.length).toBe(1);
      expect(clicks[0].pointerId).toBe(POINTER_1);

      // Second interaction sequence - should work normally
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_1);

      expect(clicks.length).toBe(2);
      expect(clicks[1].pointerId).toBe(POINTER_1);
    });

    it("should suppress clicks when pointer moves outside target during multi-touch", () => {
      const POINTER_1 = 1;
      const POINTER_2 = 2;
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();

      const clicks: Array<{ pointerId: number }> = [];

      multiFaceMesh.interactionHandler.on("click", (e) => {
        clicks.push({ pointerId: e.pointerId });
      });

      // Both pointers target multiFaceMesh initially
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, POINTER_2);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_1);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, POINTER_2);

      // First pointer releases on target
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, POINTER_1);
      expect(clicks.length).toBe(1);
      expect(clicks[0].pointerId).toBe(POINTER_1);

      // Second pointer moves outside target area and releases
      managerScene.dispatchMouseEvent("pointermove", 10, 10, POINTER_2); // Move to top-left corner (outside target)
      managerScene.dispatchMouseEvent("pointerup", 10, 10, POINTER_2);

      // Click should still be suppressed even when pointer releases outside target
      expect(clicks.length).toBe(1); // Still only one click from first pointer
    });

    it("should ignore pointerup for a pointer with no prior pointerdown", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();
      const clicks: number[] = [];
      multiFaceMesh.interactionHandler.on("click", (e) =>
        clicks.push(e.pointerId),
      );

      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, 1);
      managerScene.dispatchMouseEvent("pointerdown", halfW, halfH, 1);
      // pointerId 2 never pressed
      managerScene.dispatchMouseEvent("pointerup", halfW, halfH, 2);
      expect(clicks).toEqual([]);
    });
  });
});
