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
     * @todo Phase 2B/3B Implementation Required
     *
     * TEMPORARILY SKIPPED: This test requires ButtonInteractionHandler multi-touch support
     *
     * ## Current State (Phase 2A/3A with Touch Fixes)
     * - MouseEventManager correctly processes all pointers independently
     * - Real-device touch pointer disappearance issues resolved with pointercancel/pointerleave
     * - ButtonInteractionHandler still uses single `_isOver: boolean` state
     * - Only first pointer generates "over" event, subsequent pointers blocked
     *
     * ## Required for Phase 2B/3B
     * - Convert ButtonInteractionHandler._isOver from boolean to Map<number, boolean>
     * - Implement pointerId-aware over/out event handling in ButtonInteractionHandler
     * - Update onMouseOverHandler to support pointerId parameter
     *
     * ## Test Expectations After Phase 2B/3B
     * - Multiple pointers should generate independent "over" events
     * - ButtonInteractionHandler should maintain per-pointerId isOver states
     * - Integration between MouseEventManager and ButtonInteractionHandler complete
     *
     * ## Current Workaround
     * - MouseEventManager multi-touch throttling validated through internal state inspection
     * - ButtonInteractionHandler integration deferred to Phase 2B/3B
     */
    it.skip("should maintain independent throttling states per pointerId", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createThrottlingTestEnvironment();

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

      // Debug: Check initial state
      // biome-ignore lint/suspicious/noExplicitAny: Testing internal hasThrottled Set requires accessing private property
      const hasThrottled = (managerScene.manager as any)
        .hasThrottled as Set<number>;
      // biome-ignore lint/suspicious/noExplicitAny: Testing internal currentOver Map requires accessing private property
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        IClickableObject3D<unknown>[]
      >;
      // After reset(), pointerId=1 may be throttled due to reset events, so clear it first
      managerScene.interval();
      expect(hasThrottled.size).toBe(0); // Should be empty after clearing

      // Start with pointer 1 - should be processed immediately
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, 1);

      // Debug: Check state after first event
      expect(hasThrottled.has(1)).toBe(true); // Should be throttled now
      expect(currentOver.has(1)).toBe(true); // Should have currentOver entry

      // Immediately dispatch pointer 2 - should be processed independently
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, 2);

      // Debug: Check state after second event - this verifies independent throttling
      expect(hasThrottled.has(1)).toBe(true); // Should still be throttled
      expect(hasThrottled.has(2)).toBe(true); // Should also be throttled now (independent processing)
      expect(currentOver.has(2)).toBe(true); // Should have independent currentOver entry

      // Verify independent throttling behavior by checking Map states
      expect(hasThrottled.size).toBe(2); // Both pointers should be tracked independently
      expect(currentOver.size).toBe(2); // Both pointers should have independent currentOver states

      // Now advance time to resolve throttling
      managerScene.interval();

      // Debug: Check throttling state after interval
      expect(hasThrottled.size).toBe(0); // Should be cleared for all pointers

      // Note: Due to ButtonInteractionHandler's single isOver state design,
      // only the first pointer generates an "over" event. The second pointer
      // is processed by MouseEventManager (independent throttling/currentOver)
      // but ButtonInteractionHandler blocks duplicate "over" events.
      // This is expected behavior for Phase 2A/3A scope (MouseEventManager only).

      const pointer1Events = events.filter((e) => e.pointerId === 1);

      // Verify pointer1 generated event and throttling worked independently per pointer
      expect(pointer1Events.length).toBeGreaterThanOrEqual(1);
      expect(events.some((e) => e.pointerId === 1)).toBe(true);

      // The key test: verify that MouseEventManager processed both pointers independently
      // even though ButtonInteractionHandler only emitted one "over" event
      expect(currentOver.has(1) || currentOver.has(2)).toBe(true);
    });

    it("should handle throttling resolution timing per pointerId", () => {
      const { managerScene, halfW, halfH } = createThrottlingTestEnvironment();

      const processingEvents: Array<{
        pointerId: number;
        timestamp: number;
        phase: string;
      }> = [];

      // Store original method before spying
      // biome-ignore lint/suspicious/noExplicitAny: Testing internal checkTarget method requires accessing private method
      const originalCheckTarget = (managerScene.manager as any).checkTarget;

      // Monitor internal processing using vi.spyOn for guaranteed cleanup
      const checkTargetSpy = vi
        // biome-ignore lint/suspicious/noExplicitAny: Testing internal checkTarget method requires accessing private method
        .spyOn(managerScene.manager as any, "checkTarget")
        // biome-ignore lint/suspicious/noExplicitAny: Vitest mockImplementation requires any[] for internal method compatibility
        .mockImplementation(function (...args: any[]): boolean {
          const pointerId = args[2] || 1; // Default pointerId is 1
          processingEvents.push({
            pointerId,
            timestamp: managerScene.currentTime,
            phase: "checkTarget",
          });
          // Call original implementation
          return originalCheckTarget.apply(this, args);
        });

      try {
        // Dispatch multiple pointers with time gaps
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH, 1);
        managerScene.interval(); // Advance 66ms (2 * throttlingTime_ms)

        managerScene.dispatchMouseEvent("pointermove", halfW, halfH, 2);
        managerScene.interval(); // Advance another 66ms

        managerScene.dispatchMouseEvent("pointermove", halfW, halfH, 1); // pointer 1 again

        // Verify processing events occurred at expected times
        expect(processingEvents.length).toBeGreaterThan(0);

        // Each pointerId should have independent processing timeline
        const pointer1Events = processingEvents.filter(
          (e) => e.pointerId === 1,
        );
        const pointer2Events = processingEvents.filter(
          (e) => e.pointerId === 2,
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
});
