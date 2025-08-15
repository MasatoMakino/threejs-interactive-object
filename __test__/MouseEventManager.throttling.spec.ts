/**
 * @fileoverview MouseEventManager advanced throttling and performance tests
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
  hasThrottled: boolean;
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
 * MouseEventManager advanced throttling and performance tests
 */
describe("MouseEventManager Advanced Throttling", () => {
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

        // Set hasThrottled to true
        typedManager.hasThrottled = true;
        expect(
          typedManager.hasThrottled,
          "Initial hasThrottled should be true",
        ).toBe(true);

        // Advance time by less than throttling interval (33ms default)
        RAFTicker.emit("tick", { timestamp: 0, delta: 20 });
        expect(
          typedManager.hasThrottled,
          "hasThrottled should remain true before interval expires",
        ).toBe(true);

        // Advance time beyond throttling interval
        RAFTicker.emit("tick", { timestamp: 20, delta: 20 });
        expect(
          typedManager.hasThrottled,
          "hasThrottled should reset to false after throttling interval expires",
        ).toBe(false);
      });

      test("should apply modulo operation to throttlingDelta after reset", () => {
        const typedManager = exposeMouseEventManagerForTest(manager);
        const throttlingTime = manager.throttlingTime_ms; // Default 33ms

        // Set initial state
        typedManager.hasThrottled = true;
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
        typedManager.hasThrottled = true;

        // Dispatch rapid pointer move events
        const centerX = managerScene.canvas.width / 2;
        const centerY = managerScene.canvas.height / 2;

        // First move should be ignored due to throttling
        managerScene.dispatchMouseEvent("pointermove", centerX, centerY);
        managerScene.dispatchMouseEvent("pointermove", centerX + 10, centerY);
        managerScene.dispatchMouseEvent("pointermove", centerX + 20, centerY);

        // Should remain throttled
        expect(
          typedManager.hasThrottled,
          "Multiple rapid events should maintain throttled state",
        ).toBe(true);
      });

      test("should process events normally after throttling window expires", () => {
        const managerScene = createTestEnvironment();
        const typedManager = exposeMouseEventManagerForTest(
          managerScene.manager,
        );

        // Set throttling state
        typedManager.hasThrottled = true;

        // Advance time beyond throttling interval
        managerScene.interval(); // Advances by 2.0 * throttlingTime_ms

        // Verify throttling reset
        expect(
          typedManager.hasThrottled,
          "Throttling should reset after time advancement",
        ).toBe(false);

        // Dispatch pointer move - should be processed
        const centerX = managerScene.canvas.width / 2;
        const centerY = managerScene.canvas.height / 2;
        managerScene.dispatchMouseEvent("pointermove", centerX, centerY);

        // Should set throttling flag
        expect(
          typedManager.hasThrottled,
          "Event processing should set throttling flag",
        ).toBe(true);
      });
    });
  });
});
