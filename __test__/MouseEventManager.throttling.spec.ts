/**
 * @fileoverview MouseEventManager throttling and performance tests
 *
 * @description
 * Tests advanced throttling mechanisms and performance optimizations beyond
 * basic throttling covered in MouseEventManager.spec.ts. Focuses on onTick()
 * callback behavior, delta time handling, high-frequency event scenarios,
 * and RAFTicker integration.
 *
 * **Test Structure**:
 * - Canvas-independent tests: Pure throttling logic without DOM dependencies
 * - Canvas-dependent tests: Integration with pointer events and raycasting
 */

import { RAFTicker } from "@masatomakino/raf-ticker";
import { PerspectiveCamera, Scene } from "three";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { MouseEventManager } from "../src/index.js";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

/**
 * Test-specific interface for accessing MouseEventManager protected properties
 *
 * @description
 * Defines the shape of protected throttling-related properties needed for testing.
 * Used with exposeMouseEventManagerForTest helper function.
 */
interface MouseEventManagerTestProps {
  throttlingDelta: number;
  hasThrottled: Set<number>;
}

/**
 * Test utility function to expose protected properties of MouseEventManager
 *
 * @param obj - MouseEventManager instance to expose
 * @returns MouseEventManager with accessible protected properties
 *
 * @description
 * Provides type-safe access to protected throttling properties without using 'any'.
 * This approach maintains type checking while allowing test access to internal state.
 */
function exposeMouseEventManagerForTest(
  obj: MouseEventManager,
): MouseEventManager & MouseEventManagerTestProps {
  return obj as MouseEventManager & MouseEventManagerTestProps;
}

/**
 * MouseEventManager throttling and performance tests
 */
describe("MouseEventManager Throttling", () => {
  /**
   * Canvas-independent throttling logic tests
   *
   * @description
   * Tests pure throttling mechanisms without DOM dependencies:
   * - onTick() callback internal behavior
   * - Delta time accumulation and reset processing
   * - RAFTicker integration
   * - Edge cases (negative/zero delta times)
   *
   * Uses minimal MouseEventManager setup without canvas for fast execution.
   */
  describe("Canvas-independent Throttling Logic", () => {
    let manager: MouseEventManager;
    let scene: Scene;
    let camera: PerspectiveCamera;

    // Mock canvas for minimal setup
    let mockCanvas: HTMLCanvasElement;

    beforeEach(() => {
      // Create minimal Three.js components
      scene = new Scene();
      camera = new PerspectiveCamera(45, 1, 1, 400);

      // Create mock canvas without DOM insertion
      mockCanvas = document.createElement("canvas");
      mockCanvas.width = 100;
      mockCanvas.height = 100;

      // Create MouseEventManager with minimal setup
      manager = new MouseEventManager(scene, camera, mockCanvas);
    });

    afterEach(() => {
      // Clean up manager to prevent memory leaks
      manager.dispose();
    });

    describe("onTick() Method Internal Behavior", () => {
      test("should accumulate delta time correctly in onTick callback", () => {
        // Access private throttlingDelta through type assertion for testing
        const typedManager = exposeMouseEventManagerForTest(manager);

        // Initial state verification
        expect(
          typedManager.throttlingDelta,
          "Initial throttling delta should be 0",
        ).toBe(0);

        // First tick: accumulate 10ms
        RAFTicker.emit("tick", { timestamp: 10, delta: 10 });
        expect(
          typedManager.throttlingDelta,
          "After 10ms tick: throttling delta should be 10ms",
        ).toBe(10);

        // Second tick: accumulate additional 15ms
        RAFTicker.emit("tick", { timestamp: 25, delta: 15 });
        expect(
          typedManager.throttlingDelta,
          "After 15ms additional tick: throttling delta should be 25ms total",
        ).toBe(25);
      });

      test("should reset hasThrottled flag when throttling interval expires", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);

        // Set hasThrottled to true for default pointer (pointerId=1)
        typedManager.hasThrottled.add(1);
        expect(
          typedManager.hasThrottled.has(1),
          "Initial hasThrottled should be true for pointerId=1",
        ).toBe(true);

        // Advance time by less than throttling interval (33ms default)
        RAFTicker.emit("tick", { timestamp: 0, delta: 20 });
        expect(
          typedManager.hasThrottled.has(1),
          "hasThrottled should remain true before interval expires",
        ).toBe(true);

        // Advance time beyond throttling interval
        RAFTicker.emit("tick", { timestamp: 20, delta: 20 });
        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should be cleared after throttling interval expires",
        ).toBe(0);
      });

      test("should apply modulo operation to throttlingDelta after reset", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);
        const throttlingTime = manager.throttlingTime_ms; // Default 33ms

        // Set initial state
        typedManager.hasThrottled.add(1);
        typedManager.throttlingDelta = 0;

        // Emit tick with delta larger than throttling interval
        const largeDelta = 67; // 67ms > 33ms default interval
        RAFTicker.emit("tick", { timestamp: 0, delta: largeDelta });

        const expectedRemainder = largeDelta % throttlingTime; // 67 % 33 = 1
        expect(
          typedManager.throttlingDelta,
          `Delta modulo calculation: ${largeDelta} % ${throttlingTime} should equal ${expectedRemainder}`,
        ).toBe(expectedRemainder);
      });

      test("should reset at exact throttling boundary (delta == throttlingTime_ms)", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);
        const throttlingTime = manager.throttlingTime_ms;

        // Start from throttled state
        typedManager.hasThrottled.add(1);
        typedManager.throttlingDelta = 0;

        // Emit exact boundary delta
        RAFTicker.emit("tick", { timestamp: 0, delta: throttlingTime });

        // Expect reset and zero remainder
        expect(typedManager.hasThrottled.size).toBe(0);
        expect(typedManager.throttlingDelta).toBe(0);
      });
    });

    describe("Delta Time Edge Cases", () => {
      test("should handle negative delta time safely using Math.max protection", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);
        const initialDelta = 10;

        // Set initial accumulation
        typedManager.throttlingDelta = initialDelta;

        // Emit negative delta
        RAFTicker.emit("tick", { timestamp: 0, delta: -5 });

        expect(
          typedManager.throttlingDelta,
          "Negative delta protection: delta should not decrease throttling accumulator",
        ).toBe(initialDelta); // Should remain unchanged
      });

      test("should process zero delta time without accumulation", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);
        const initialDelta = 10;

        // Set initial accumulation
        typedManager.throttlingDelta = initialDelta;

        // Emit zero delta
        RAFTicker.emit("tick", { timestamp: 0, delta: 0 });

        expect(
          typedManager.throttlingDelta,
          "Zero delta should not change throttling accumulator",
        ).toBe(initialDelta);
      });

      test("should handle very small positive delta times correctly", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);

        // Emit very small delta
        const smallDelta = 0.1;
        RAFTicker.emit("tick", { timestamp: 0, delta: smallDelta });

        expect(
          typedManager.throttlingDelta,
          `Small positive delta ${smallDelta}ms should be accumulated correctly`,
        ).toBe(smallDelta);
      });

      test("should handle browser freeze recovery with very large delta times", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);
        const throttlingTime = manager.throttlingTime_ms; // Default 33ms

        // Simulate browser freeze recovery: 5-second gap
        const largeDelta = 5000; // 5000ms browser freeze
        RAFTicker.emit("tick", { timestamp: 0, delta: largeDelta });

        // After large delta: hasThrottled Map should be cleared
        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should be cleared after large delta exceeds throttling interval",
        ).toBe(0);

        // Modulo calculation: 5000 % 33 = 17 remainder expected
        const expectedRemainder = largeDelta % throttlingTime; // 5000 % 33 = 17
        expect(
          typedManager.throttlingDelta,
          `Large delta modulo calculation: ${largeDelta} % ${throttlingTime} should equal ${expectedRemainder}`,
        ).toBe(expectedRemainder);
      });

      test("should handle extreme delta values larger than multiple throttling intervals", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);
        const throttlingTime = manager.throttlingTime_ms; // Default 33ms

        // Test with delta spanning multiple intervals: 100ms = 3 × 33ms + 1ms
        const multiIntervalDelta = 100;
        RAFTicker.emit("tick", { timestamp: 0, delta: multiIntervalDelta });

        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should be cleared after multi-interval delta",
        ).toBe(0);

        const expectedRemainder = multiIntervalDelta % throttlingTime; // 100 % 33 = 1
        expect(
          typedManager.throttlingDelta,
          `Multi-interval delta: ${multiIntervalDelta} % ${throttlingTime} should equal ${expectedRemainder}`,
        ).toBe(expectedRemainder);
      });
    });

    describe("RAFTicker Integration", () => {
      test("should register onTick callback with RAFTicker during construction", () => {
        // Create spy to monitor RAFTicker.on calls
        const rafTickerOnSpy = vi.spyOn(RAFTicker, "on");

        // Create new manager to trigger constructor
        const testScene = new Scene();
        const testCamera = new PerspectiveCamera(45, 1, 1, 400);
        const testCanvas = document.createElement("canvas");
        const testManager = new MouseEventManager(
          testScene,
          testCamera,
          testCanvas,
        );

        // Verify onTick callback was registered
        expect(rafTickerOnSpy).toHaveBeenCalledWith(
          "tick",
          expect.any(Function),
        );

        // Clean up
        testManager.dispose();
        rafTickerOnSpy.mockRestore();
      });

      test("should handle zero throttling time safely without modulo-by-zero (NaN)", () => {
        // Create manager with throttlingTime_ms: 0 to test modulo-by-zero safety
        const testScene = new Scene();
        const testCamera = new PerspectiveCamera(45, 1, 1, 400);
        const testCanvas = document.createElement("canvas");
        const testManager = new MouseEventManager(
          testScene,
          testCamera,
          testCanvas,
          { throttlingTime_ms: 0 },
        );

        const typedManager = exposeMouseEventManagerForTest(testManager);

        // Verify throttling is disabled when set to 0
        expect(
          testManager.throttlingTime_ms,
          "Throttling time should be set to 0",
        ).toBe(0);

        // Set initial state for testing
        typedManager.hasThrottled.add(1);
        typedManager.throttlingDelta = 50;

        // Emit tick event with zero throttling time - should not cause modulo-by-zero (NaN)
        expect(() => {
          RAFTicker.emit("tick", { timestamp: 0, delta: 33 });
        }, "Zero throttling time should not cause modulo-by-zero (NaN)").not.toThrow();

        // When throttlingTime_ms is 0, throttlingDelta should be reset to 0 (not NaN)
        // to prevent modulo-by-zero from producing NaN
        expect(
          typedManager.throttlingDelta,
          "Delta should be reset to 0 when throttling time is 0 to prevent NaN",
        ).toBe(0);

        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should be cleared when delta >= throttlingTime (0)",
        ).toBe(0);

        // Clean up
        testManager.dispose();
      });

      test("should effectively disable throttling when throttlingTime_ms is 0", () => {
        const testScene = new Scene();
        const testCamera = new PerspectiveCamera(45, 1, 1, 400);
        const testCanvas = document.createElement("canvas");
        const testManager = new MouseEventManager(
          testScene,
          testCamera,
          testCanvas,
          { throttlingTime_ms: 0 },
        );

        const typedManager = exposeMouseEventManagerForTest(testManager);

        // Initial state
        expect(typedManager.hasThrottled.size).toBe(0);
        expect(typedManager.throttlingDelta).toBe(0);

        // Any delta time should immediately reset hasThrottled to false
        typedManager.hasThrottled.add(1);
        RAFTicker.emit("tick", { timestamp: 0, delta: 1 });

        expect(
          typedManager.hasThrottled.size,
          "Even 1ms delta should clear hasThrottled Set when throttling is disabled",
        ).toBe(0);

        // Multiple rapid ticks should not cause accumulation issues
        for (let i = 0; i < 10; i++) {
          typedManager.hasThrottled.add(1);
          RAFTicker.emit("tick", { timestamp: i, delta: 16 });

          expect(
            typedManager.hasThrottled.size,
            `Tick ${i}: hasThrottled Set should be cleared immediately with zero throttling`,
          ).toBe(0);
        }

        // Clean up
        testManager.dispose();
      });

      test("should prevent NaN propagation in throttling calculations with zero configuration", () => {
        const testScene = new Scene();
        const testCamera = new PerspectiveCamera(45, 1, 1, 400);
        const testCanvas = document.createElement("canvas");
        const testManager = new MouseEventManager(
          testScene,
          testCamera,
          testCanvas,
          { throttlingTime_ms: 0 },
        );

        const typedManager = exposeMouseEventManagerForTest(testManager);

        // Test various edge cases that could produce NaN
        const edgeCases = [
          { delta: 0, description: "zero delta" },
          { delta: -10, description: "negative delta" },
          { delta: Number.NaN, description: "NaN delta" },
          {
            delta: Number.POSITIVE_INFINITY,
            description: "positive infinity delta",
          },
          {
            delta: Number.NEGATIVE_INFINITY,
            description: "negative infinity delta",
          },
          { delta: 1e10, description: "very large delta" },
        ];

        for (const { delta, description } of edgeCases) {
          // Reset state
          typedManager.hasThrottled.add(1);
          typedManager.throttlingDelta = 100;

          // Emit tick with edge case delta
          RAFTicker.emit("tick", { timestamp: 0, delta });

          // Verify no NaN values propagate
          expect(
            Number.isNaN(typedManager.throttlingDelta),
            `throttlingDelta should not be NaN with ${description}`,
          ).toBe(false);

          expect(
            typedManager.hasThrottled.constructor.name,
            `hasThrottled should remain Set instance with ${description}`,
          ).toBe("Set");

          // For zero throttling, delta should be reset regardless of input
          if (delta >= 0) {
            expect(
              typedManager.throttlingDelta,
              `Delta should be 0 after ${description} with zero throttling`,
            ).toBe(0);
          }

          // Reset RAFTicker state with normal value after edge case
          RAFTicker.emit("tick", { timestamp: 0, delta: 33 }); // Use default throttling time
        }

        // Clean up
        testManager.dispose();
      });

      test("should reset throttling state when non-finite values occur with positive throttling time", () => {
        const testScene = new Scene();
        const testCamera = new PerspectiveCamera(45, 1, 1, 400);
        const testCanvas = document.createElement("canvas");
        const testManager = new MouseEventManager(
          testScene,
          testCamera,
          testCanvas,
          { throttlingTime_ms: 33 }, // Positive throttling time
        );

        const typedManager = exposeMouseEventManagerForTest(testManager);

        // Test non-finite values with positive throttling time
        const nonFiniteEdgeCases = [
          { delta: Number.NaN, description: "NaN delta" },
          {
            delta: Number.POSITIVE_INFINITY,
            description: "positive infinity delta",
          },
          {
            delta: Number.NEGATIVE_INFINITY,
            description: "negative infinity delta",
          },
        ];

        for (const { delta, description } of nonFiniteEdgeCases) {
          // Set up throttled state
          typedManager.hasThrottled.add(1);
          typedManager.throttlingDelta = 100;

          // Emit non-finite delta
          RAFTicker.emit("tick", { timestamp: 0, delta });

          // Verify throttling state is reset for all non-finite values
          expect(
            typedManager.hasThrottled.size,
            `hasThrottled Set should be cleared with ${description}`,
          ).toBe(0);

          expect(
            typedManager.throttlingDelta,
            `throttlingDelta should be reset to 0 with ${description}`,
          ).toBe(0);

          // Reset RAFTicker state with normal value after edge case
          RAFTicker.emit("tick", {
            timestamp: 0,
            delta: testManager.throttlingTime_ms,
          }); // Use manager's throttling time
        }

        // Clean up
        testManager.dispose();
      });

      test("should handle multiple MouseEventManager instances sharing RAFTicker", () => {
        // Create second manager instance
        const scene2 = new Scene();
        const camera2 = new PerspectiveCamera(45, 1, 1, 400);
        const canvas2 = document.createElement("canvas");
        const manager2 = new MouseEventManager(scene2, camera2, canvas2);

        const typedManager1 = exposeMouseEventManagerForTest(manager);
        const typedManager2 = exposeMouseEventManagerForTest(manager2);

        // Both should start with clean state
        expect(typedManager1.throttlingDelta).toBe(0);
        expect(typedManager2.throttlingDelta).toBe(0);

        // Emit tick - should affect both instances
        RAFTicker.emit("tick", { timestamp: 0, delta: 15 });

        expect(
          typedManager1.throttlingDelta,
          "First manager should accumulate delta time",
        ).toBe(15);
        expect(
          typedManager2.throttlingDelta,
          "Second manager should also accumulate delta time independently",
        ).toBe(15);

        // Clean up second manager
        manager2.dispose();
      });

      test("should work correctly with custom throttling intervals", () => {
        // Test high-frequency throttling (16ms for 60fps)
        const scene1 = new Scene();
        const camera1 = new PerspectiveCamera(45, 1, 1, 400);
        const canvas1 = document.createElement("canvas");
        const manager16ms = new MouseEventManager(scene1, camera1, canvas1, {
          throttlingTime_ms: 16,
        });

        const typedManager16 = exposeMouseEventManagerForTest(manager16ms);

        // 15ms delta should not trigger reset (< 16ms)
        RAFTicker.emit("tick", { timestamp: 0, delta: 15 });
        expect(
          typedManager16.throttlingDelta,
          "15ms delta should accumulate in 16ms throttling",
        ).toBe(15);

        // 17ms delta should trigger reset (> 16ms)
        RAFTicker.emit("tick", { timestamp: 15, delta: 17 });
        expect(
          typedManager16.hasThrottled.size,
          "32ms total (>16ms) should clear hasThrottled Set in 16ms throttling",
        ).toBe(0);
        expect(
          typedManager16.throttlingDelta,
          "32ms % 16ms should equal 0 remainder",
        ).toBe(0);

        // Test low-frequency throttling (100ms for 10fps)
        const scene2 = new Scene();
        const camera2 = new PerspectiveCamera(45, 1, 1, 400);
        const canvas2 = document.createElement("canvas");
        const manager100ms = new MouseEventManager(scene2, camera2, canvas2, {
          throttlingTime_ms: 100,
        });

        const typedManager100 = exposeMouseEventManagerForTest(manager100ms);

        // 99ms delta should not trigger reset (< 100ms)
        RAFTicker.emit("tick", { timestamp: 0, delta: 99 });
        expect(
          typedManager100.throttlingDelta,
          "99ms delta should accumulate in 100ms throttling",
        ).toBe(99);

        // 150ms delta should trigger reset (> 100ms)
        RAFTicker.emit("tick", { timestamp: 99, delta: 150 });
        expect(
          typedManager100.hasThrottled.size,
          "249ms total (>100ms) should clear hasThrottled Set in 100ms throttling",
        ).toBe(0);
        expect(
          typedManager100.throttlingDelta,
          "249ms % 100ms should equal 49 remainder",
        ).toBe(49);

        // Clean up custom managers
        manager16ms.dispose();
        manager100ms.dispose();
      });

      test("should handle RAFTicker events safely after dispose", () => {
        const typed = exposeMouseEventManagerForTest(manager);

        // Dispose the manager first
        manager.dispose();

        // Emit RAFTicker events after dispose - should not cause errors
        expect(() => {
          RAFTicker.emit("tick", { timestamp: 0, delta: 33 });
          RAFTicker.emit("tick", { timestamp: 33, delta: 16 });
          RAFTicker.emit("tick", { timestamp: 49, delta: 100 });
        }, "RAFTicker events after dispose should not throw errors").not.toThrow();

        // Verify no residual listener mutated state
        expect(typed.throttlingDelta).toBe(0);
        expect(typed.hasThrottled.size).toBe(0);
      });
    });
  });

  /**
   * Canvas-dependent integration tests
   *
   * @description
   * Tests throttling integration with actual pointer events and raycasting:
   * - High-frequency event stress testing
   * - Pointer event processing with throttling
   * - Integration with mouse interaction pipeline
   *
   * Uses full MouseEventManagerScene setup for complete integration testing.
   */
  describe("Canvas-dependent Integration Tests", () => {
    const testEnvironments: MouseEventManagerScene[] = [];

    afterAll(() => {
      // Clean up all MouseEventManager instances to prevent memory leaks
      testEnvironments.forEach((env) => {
        env.dispose();
      });
      testEnvironments.length = 0;
    });

    /**
     * Creates isolated test environment for integration tests
     */
    const createTestEnvironment = () => {
      const managerScene = new MouseEventManagerScene();
      testEnvironments.push(managerScene);
      return managerScene;
    };

    describe("High-frequency Event Stress Testing", () => {
      test("should ignore rapid pointer events during throttling window", () => {
        const managerScene = createTestEnvironment();
        const typedManager = exposeMouseEventManagerForTest(
          managerScene.manager,
        );

        // Set hasThrottled to true to simulate active throttling
        typedManager.hasThrottled.add(1);

        // Dispatch rapid pointer move events
        const centerX = managerScene.canvas.width / 2;
        const centerY = managerScene.canvas.height / 2;

        // First move should be ignored due to throttling
        managerScene.dispatchMouseEvent("pointermove", centerX, centerY);
        managerScene.dispatchMouseEvent("pointermove", centerX + 10, centerY);
        managerScene.dispatchMouseEvent("pointermove", centerX + 20, centerY);

        // Should remain throttled
        expect(
          typedManager.hasThrottled.size,
          "Multiple rapid events should maintain throttled state in Set",
        ).toBeGreaterThan(0);
      });

      test("should process events normally after throttling window expires", () => {
        const managerScene = createTestEnvironment();
        const typedManager = exposeMouseEventManagerForTest(
          managerScene.manager,
        );

        // Set throttling state
        typedManager.hasThrottled.add(1);

        // Advance time beyond throttling interval
        managerScene.interval(); // Advances by 2.0 * throttlingTime_ms

        // Verify throttling reset
        expect(
          typedManager.hasThrottled.size,
          "Throttling Set should be cleared after time advancement",
        ).toBe(0);

        // Dispatch pointer move - should be processed
        const centerX = managerScene.canvas.width / 2;
        const centerY = managerScene.canvas.height / 2;
        managerScene.dispatchMouseEvent("pointermove", centerX, centerY);

        // Should set throttling flag
        expect(
          typedManager.hasThrottled.size,
          "Event processing should set throttling entries",
        ).toBeGreaterThan(0);
      });
    });

    /**
     * Zero throttling event processing tests
     *
     * @description
     * Tests MouseEventManager behavior when throttlingTime_ms is set to 0,
     * ensuring that onDocumentMouseMove processes all pointer events immediately
     * without throttling delays. This verifies the fix for throttling implementation
     * inconsistency between onTick() and onDocumentMouseMove() methods.
     */
    describe("Zero Throttling Event Processing", () => {
      /**
       * Creates test environment with throttling disabled
       */
      const createZeroThrottlingEnvironment = () => {
        const managerScene = new MouseEventManagerScene({
          throttlingTime_ms: 0, // Disable throttling
        });
        testEnvironments.push(managerScene);
        return managerScene;
      };

      test("should process all pointermove events immediately when throttlingTime_ms is 0", () => {
        const managerScene = createZeroThrottlingEnvironment();
        const typedManager = exposeMouseEventManagerForTest(
          managerScene.manager,
        );

        // Verify throttling is disabled
        expect(
          managerScene.manager.throttlingTime_ms,
          "Throttling time should be 0",
        ).toBe(0);

        // Initial state verification
        expect(
          typedManager.hasThrottled.size,
          "Initial hasThrottled Set should be empty",
        ).toBe(0);

        const centerX = managerScene.canvas.width / 2;
        const centerY = managerScene.canvas.height / 2;

        // Dispatch multiple rapid pointermove events without time advancement
        managerScene.dispatchMouseEvent("pointermove", centerX, centerY);
        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should remain empty after first pointermove with zero throttling",
        ).toBe(0);

        managerScene.dispatchMouseEvent("pointermove", centerX + 10, centerY);
        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should remain empty after second pointermove with zero throttling",
        ).toBe(0);

        managerScene.dispatchMouseEvent("pointermove", centerX + 20, centerY);
        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should remain empty after third pointermove with zero throttling",
        ).toBe(0);

        // Verify consistent behavior with additional events
        managerScene.dispatchMouseEvent("pointermove", centerX + 30, centerY);
        expect(
          typedManager.hasThrottled.size,
          "hasThrottled Set should remain empty for all pointermove events with zero throttling",
        ).toBe(0);
      });

      test("should emit interaction events immediately without throttling delay", () => {
        const managerScene = createZeroThrottlingEnvironment();

        // Create button for interaction testing
        const btn = new MouseEventManagerButton();
        managerScene.scene.add(btn.button);

        // Set up event spies
        const spyOver = vi.fn(() => true);
        const spyOut = vi.fn(() => true);
        const spyDown = vi.fn(() => true);
        const spyUp = vi.fn(() => true);

        btn.button.interactionHandler.on("over", spyOver);
        btn.button.interactionHandler.on("out", spyOut);
        btn.button.interactionHandler.on("down", spyDown);
        btn.button.interactionHandler.on("up", spyUp);

        const centerX = managerScene.canvas.width / 2;
        const centerY = managerScene.canvas.height / 2;

        // Initial state - move away from button
        managerScene.dispatchMouseEvent("pointermove", 0, 0);
        managerScene.reset();

        // Move over button - should trigger over event immediately
        managerScene.dispatchMouseEvent("pointermove", centerX, centerY);
        expect(spyOver).toHaveBeenCalledTimes(1);
        expect(btn.button.interactionHandler.isOver).toBe(true);
        spyOver.mockClear();

        // Move within button area - should not trigger additional over events
        managerScene.dispatchMouseEvent(
          "pointermove",
          centerX + 1,
          centerY + 1,
        );
        expect(spyOver).not.toHaveBeenCalled();

        // Press down - should trigger down event immediately
        managerScene.dispatchMouseEvent("pointerdown", centerX, centerY);
        expect(spyDown).toHaveBeenCalledTimes(1);
        expect(btn.button.interactionHandler.isPress).toBe(true);

        // Release - should trigger up event immediately
        managerScene.dispatchMouseEvent("pointerup", centerX, centerY);
        expect(spyUp).toHaveBeenCalledTimes(1);

        // Move away - should trigger out event immediately
        managerScene.dispatchMouseEvent("pointermove", 0, 0);
        expect(spyOut).toHaveBeenCalledTimes(1);
        expect(btn.button.interactionHandler.isOver).toBe(false);

        // Clean up event listeners
        btn.button.interactionHandler.off("over", spyOver);
        btn.button.interactionHandler.off("out", spyOut);
        btn.button.interactionHandler.off("down", spyDown);
        btn.button.interactionHandler.off("up", spyUp);
      });

      test("should demonstrate hasThrottled flag behavior difference between throttled vs non-throttled", () => {
        // Create throttled environment (33ms default)
        const throttledScene = createTestEnvironment();
        const throttledManager = exposeMouseEventManagerForTest(
          throttledScene.manager,
        );

        // Create non-throttled environment (0ms)
        const nonThrottledScene = createZeroThrottlingEnvironment();
        const nonThrottledManager = exposeMouseEventManagerForTest(
          nonThrottledScene.manager,
        );

        // Verify initial configuration
        expect(
          throttledScene.manager.throttlingTime_ms,
          "Throttled environment should have positive throttling time",
        ).toBe(33);
        expect(
          nonThrottledScene.manager.throttlingTime_ms,
          "Non-throttled environment should have zero throttling time",
        ).toBe(0);

        const centerX = 960; // Half of MouseEventManagerScene.W (1920)
        const centerY = 540; // Half of MouseEventManagerScene.H (1080)

        // Reset both environments to ensure clean state
        throttledScene.reset();
        nonThrottledScene.reset();

        // Additional cleanup for throttled environment if needed
        if (throttledManager.hasThrottled.size > 0) {
          throttledScene.interval(); // Additional time advancement to ensure reset
        }

        // Dispatch rapid pointermove events to both environments
        throttledScene.dispatchMouseEvent("pointermove", centerX, centerY);
        nonThrottledScene.dispatchMouseEvent("pointermove", centerX, centerY);

        // Key difference: throttled sets hasThrottled, non-throttled doesn't
        expect(
          throttledManager.hasThrottled.size,
          "Throttled environment should set hasThrottled entries on pointermove",
        ).toBeGreaterThan(0);
        expect(
          nonThrottledManager.hasThrottled.size,
          "Non-throttled environment should not set hasThrottled entries on pointermove",
        ).toBe(0);

        // Dispatch more events rapidly
        throttledScene.dispatchMouseEvent("pointermove", centerX + 5, centerY);
        throttledScene.dispatchMouseEvent("pointermove", centerX + 10, centerY);

        nonThrottledScene.dispatchMouseEvent(
          "pointermove",
          centerX + 5,
          centerY,
        );
        nonThrottledScene.dispatchMouseEvent(
          "pointermove",
          centerX + 10,
          centerY,
        );

        // Throttled should maintain hasThrottled true, non-throttled remains false
        expect(
          throttledManager.hasThrottled.size,
          "Throttled environment should maintain hasThrottled entries during rapid events",
        ).toBeGreaterThan(0);
        expect(
          nonThrottledManager.hasThrottled.size,
          "Non-throttled environment should never set hasThrottled entries",
        ).toBe(0);

        // Reset throttled environment by advancing time
        throttledScene.interval(); // Advances by 2.0 * throttlingTime_ms

        // After time advancement, throttled should reset hasThrottled
        expect(
          throttledManager.hasThrottled.size,
          "Throttled environment should clear hasThrottled Set after time advancement",
        ).toBe(0);
        expect(
          nonThrottledManager.hasThrottled.size,
          "Non-throttled environment should always remain empty",
        ).toBe(0);
      });
    });
  });
});
