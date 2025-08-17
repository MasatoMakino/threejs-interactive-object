/**
 * @fileoverview MouseEventManager edge cases and error handling tests
 *
 * @description
 * Tests MouseEventManager's robustness under error conditions and edge cases,
 * including null object handling, invalid events, system boundary conditions,
 * and error recovery scenarios.
 *
 * **Test Focus**: Edge cases and error conditions that could cause system
 * instability or unexpected behavior in production environments.
 *
 * **Test Environment**: Uses MouseEventManagerScene helper for controlled
 * Three.js environment setup with error condition simulation.
 */

import { BoxGeometry, Object3D } from "three";
import { afterAll, describe, expect, test, vi } from "vitest";
import { ClickableMesh } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import {
  MouseEventManagerScene,
  type MouseEventManagerSceneOptions,
} from "./MouseEventManagerScene.js";

/**
 * MouseEventManager edge cases and error handling test suite
 *
 * @description
 * Validates MouseEventManager's robustness under various error conditions
 * and edge cases that could occur in production environments.
 *
 * **Test Categories**:
 * - Error-prone Object Handling: null/undefined objects, invalid hierarchies
 * - Invalid Event Processing: malformed events, invalid coordinates
 * - System Boundary Conditions: null cameras/scenes, invalid viewports
 * - Robustness Verification: memory leaks, exception recovery, state consistency
 */
describe("MouseEventManager Edge Cases & Error Handling", () => {
  const testEnvironments: MouseEventManagerScene[] = [];

  afterAll(() => {
    // Clean up all test environments to prevent memory leaks
    testEnvironments.forEach((env) => {
      env.dispose();
    });
    testEnvironments.length = 0;
  });

  /**
   * Creates an isolated test environment for edge case testing
   *
   * @param options - Optional scene configuration options for custom canvas dimensions
   * @returns Test environment with MouseEventManager ready for testing
   *
   * @description
   * Generates a fresh test environment for edge case validation.
   * Each test gets its own isolated MouseEventManager instance to ensure
   * no shared state affects testing accuracy. Supports custom canvas dimensions
   * for testing boundary conditions.
   */
  const createTestEnvironment = (options?: MouseEventManagerSceneOptions) => {
    const managerScene = new MouseEventManagerScene(options);
    testEnvironments.push(managerScene);

    const btn = new MouseEventManagerButton();
    managerScene.scene.add(btn.button);

    // Calculate half dimensions based on actual canvas size
    const halfW = managerScene.canvas.width / 2;
    const halfH = managerScene.canvas.height / 2;

    return {
      managerScene,
      btn,
      halfW,
      halfH,
    };
  };

  /**
   * Error-prone Object Handling Tests
   *
   * @description
   * Tests MouseEventManager's ability to handle edge cases in object lifecycle
   * management, particularly focusing on currentOver state consistency when
   * objects are removed during interaction states.
   */
  describe("Error-prone Object Handling", () => {
    test("should handle removed objects from currentOver state gracefully", () => {
      const { managerScene, btn, halfW, halfH } = createTestEnvironment();

      // Set up spy to monitor out events on the existing button
      const outEventSpy = vi.fn();
      btn.button.interactionHandler.on("out", outEventSpy);

      // Step 1: Move mouse over the button to set hover state
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Verify the button is now in hover state (should be in currentOver array)
      expect(
        btn.button.interactionHandler.isOver,
        "Button should be in hover state after mouse over",
      ).toBe(true);

      // Step 2: Remove the button from scene while it's in hover state
      // This simulates the edge case where an object is removed during interaction
      managerScene.scene.remove(btn.button);

      // Step 3: Move mouse to trigger currentOver cleanup processing
      // This should safely handle the removed object in currentOver array
      expect(() => {
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", halfW + 10, halfH + 10);
      }, "Should handle removed objects from currentOver state without crashing").not.toThrow();

      // Step 4: Verify that out event was safely sent to the removed object
      expect(
        outEventSpy,
        "Out event should be sent to removed object for proper state cleanup",
      ).toHaveBeenCalledTimes(1);

      // Step 5: Verify that currentOver array is properly cleaned up
      // biome-ignore lint/suspicious/noExplicitAny: Testing protected property access
      const currentOverArray = (managerScene.manager as any).currentOver;
      expect(
        currentOverArray,
        "currentOver array should be empty after cleanup",
      ).toHaveLength(0);

      // Clean up event listener
      btn.button.interactionHandler.off("out", outEventSpy);
    });
  });

  /**
   * Invalid Event Processing Tests
   *
   * @description
   * Tests MouseEventManager's handling of malformed or invalid pointer events
   * that could be encountered in various browser environments.
   */
  describe("Invalid Event Processing", () => {
    test("should handle PointerEvent with invalid coordinates gracefully", () => {
      const { managerScene } = createTestEnvironment();

      // Test with various invalid coordinate values
      const invalidCoordinates = [
        { x: Number.NaN, y: Number.NaN, description: "NaN coordinates" },
        {
          x: Number.POSITIVE_INFINITY,
          y: Number.NEGATIVE_INFINITY,
          description: "infinite coordinates",
        },
        {
          x: -1000000,
          y: -1000000,
          description: "extremely negative coordinates",
        },
        { x: 1000000, y: 1000000, description: "extremely large coordinates" },
      ];

      for (const { x, y, description } of invalidCoordinates) {
        expect(() => {
          managerScene.interval(); // Release throttling to ensure coordinate processing
          managerScene.dispatchMouseEvent("pointermove", x, y);
        }, `Should handle ${description} without throwing errors`).not.toThrow();
      }
    });

    test("should handle PointerEvent with missing properties safely", () => {
      const { managerScene } = createTestEnvironment();

      // Create PointerEvent with minimal properties
      const incompleteEvent = new PointerEvent("pointermove", {
        // Intentionally omit clientX and clientY to test handling
        bubbles: true,
        cancelable: true,
      });

      // Dispatch the incomplete event
      expect(() => {
        managerScene.interval(); // Release throttling to ensure event processing
        managerScene.canvas.dispatchEvent(incompleteEvent);
      }, "Should handle PointerEvent with missing clientX/clientY properties").not.toThrow();
    });

    test("should recover normal hover operation after rapid invalid events stress test", () => {
      const { managerScene, btn, halfW, halfH } = createTestEnvironment();

      // Stress test: Dispatch multiple invalid events rapidly
      for (let i = 0; i < 10; i++) {
        expect(() => {
          // Release throttling only for the first pointermove event in each iteration
          // to ensure coordinate processing actually occurs
          managerScene.interval();
          managerScene.dispatchMouseEvent(
            "pointermove",
            Number.NaN,
            Number.NaN,
          );
          managerScene.dispatchMouseEvent(
            "pointerdown",
            Number.POSITIVE_INFINITY,
            Number.NEGATIVE_INFINITY,
          );
          managerScene.dispatchMouseEvent("pointerup", -1000000, 1000000);
        }, `Rapid invalid events iteration ${i} should not throw errors`).not.toThrow();
      }

      // Recovery test: Verify system can resume normal hover operations
      // Step 1: Move pointer away from button (ensure clean out state)
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", 0, 0);
      expect(
        btn.button.interactionHandler.isOver,
        "Button should not be in hover state when pointer is away",
      ).toBe(false);

      // Step 2: Move pointer over button to test hover recovery
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
      expect(
        btn.button.interactionHandler.isOver,
        "Button should recover to hover state after invalid events stress test",
      ).toBe(true);

      // Step 3: Verify hover can be cleared normally
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", 0, 0);
      expect(
        btn.button.interactionHandler.isOver,
        "Button should exit hover state normally after recovery",
      ).toBe(false);
    });
  });

  /**
   * System Boundary Conditions Tests
   *
   * @description
   * Tests MouseEventManager's behavior when core system components
   * are in invalid states or missing entirely.
   */
  describe("System Boundary Conditions", () => {
    test("should handle zero-size canvas initialization and coordinate processing gracefully", () => {
      // Create environment with zero-size canvas to test integration with ViewPortUtil
      const { managerScene } = createTestEnvironment({
        canvasWidth: 0,
        canvasHeight: 0,
      });

      // Verify zero-size canvas was created as intended
      expect(managerScene.canvas.width).toBe(0);
      expect(managerScene.canvas.height).toBe(0);

      // Test coordinate processing with zero-size canvas - should not crash
      expect(() => {
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", 0, 0);
      }, "Should handle zero-size canvas coordinate processing without crashing").not.toThrow();

      // Test various coordinate values to ensure robustness
      const testCoordinates = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: -10, y: -10 },
        { x: 100, y: 100 },
      ];

      for (const { x, y } of testCoordinates) {
        expect(() => {
          managerScene.interval();
          managerScene.dispatchMouseEvent("pointermove", x, y);
        }, `Should handle coordinates (${x}, ${y}) with zero-size canvas`).not.toThrow();
      }
    });

    test("should handle empty scene gracefully", () => {
      const { managerScene, halfW, halfH } = createTestEnvironment();

      // Clear all objects from scene to test empty scene handling
      managerScene.scene.remove(...managerScene.scene.children);

      expect(() => {
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
      }, "Should handle empty scene without crashing").not.toThrow();
    });
  });

  /**
   * Robustness Verification Tests
   *
   * @description
   * Tests MouseEventManager's overall robustness including memory leak
   * prevention, exception recovery, and state consistency under stress.
   */
  describe("Robustness Verification", () => {
    test("should handle complex error scenarios with dynamic scene changes", () => {
      const { managerScene, btn } = createTestEnvironment();

      // Simulate complex error scenario with multiple simultaneous issues
      const createComplexErrorScenario = () => {
        // Invalid coordinates from corrupted input data
        managerScene.dispatchMouseEvent(
          "pointermove",
          Number.NaN,
          Number.POSITIVE_INFINITY,
        );

        // Dynamic scene modification during event processing
        const tempMesh = new ClickableMesh({
          geo: new BoxGeometry(1, 1, 1),
          material: getMeshMaterialSet(),
        });
        managerScene.scene.add(tempMesh);

        // Time progression during scene changes
        managerScene.interval();

        // Clean up temporary object
        managerScene.scene.remove(tempMesh);
      };

      // Run complex error scenarios multiple times
      for (let i = 0; i < 3; i++) {
        expect(() => {
          createComplexErrorScenario();
        }, `Complex error scenario iteration ${i} should not throw`).not.toThrow();
      }

      // Verify system state integrity
      expect(
        btn.button.interactionHandler.isOver,
        "Button state should remain valid after complex error scenarios",
      ).toBe(false);
      expect(
        btn.button.interactionHandler.isPress,
        "Button press state should remain valid after complex error scenarios",
      ).toBe(false);

      // Verify MouseEventManager internal state consistency
      // biome-ignore lint/suspicious/noExplicitAny: Testing protected property access
      const currentOverArray = (managerScene.manager as any).currentOver;
      expect(
        currentOverArray,
        "currentOver array should be empty after error conditions",
      ).toHaveLength(0);

      // Verify manager remains functional with basic operation
      expect(
        managerScene.manager.throttlingTime_ms,
        "Manager throttling configuration should remain intact",
      ).toBeGreaterThan(0);
      expect(
        typeof managerScene.manager.throttlingTime_ms,
        "Manager throttling should be numeric",
      ).toBe("number");
    });

    test("should recover gracefully from exception during event processing", () => {
      const { managerScene, btn, halfW, halfH } = createTestEnvironment();

      // Create a spy that throws an error once, then works normally
      let callCount = 0;
      const originalDispatchEvent = managerScene.canvas.dispatchEvent.bind(
        managerScene.canvas,
      );

      const mockDispatchEvent = vi.fn((event: Event) => {
        callCount++;
        if (callCount === 1) {
          throw new Error("Simulated event processing error");
        }
        return originalDispatchEvent(event);
      });

      managerScene.canvas.dispatchEvent = mockDispatchEvent;

      // First call should throw error (simulated)
      expect(() => {
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
      }, "Simulated error should be thrown").toThrow(
        "Simulated event processing error",
      );

      // Restore normal dispatch behavior
      managerScene.canvas.dispatchEvent = originalDispatchEvent;

      // Subsequent calls should work normally
      expect(() => {
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", halfW, halfH);
      }, "Should recover normal operation after exception").not.toThrow();

      // Verify functionality is restored
      expect(
        btn.button.interactionHandler.isOver,
        "Button should respond normally after error recovery",
      ).toBe(true);
    });

    test("should maintain consistent internal state across error scenarios", () => {
      const { managerScene } = createTestEnvironment();

      // Get initial throttling state
      const initialThrottlingTime = managerScene.manager.throttlingTime_ms;

      // Subject system to various error conditions
      const errorScenarios = [
        () =>
          managerScene.dispatchMouseEvent(
            "pointermove",
            Number.NaN,
            Number.NaN,
          ),
        () => {
          // Corrupt canvas temporarily
          const original = managerScene.canvas.clientWidth;
          Object.defineProperty(managerScene.canvas, "clientWidth", {
            value: Number.NaN,
            configurable: true,
          });
          managerScene.dispatchMouseEvent("pointermove", 100, 100);
          Object.defineProperty(managerScene.canvas, "clientWidth", {
            value: original,
            configurable: true,
          });
        },
        () => {
          // Add and remove object rapidly (simulates rapid scene changes)
          const tempObject = new Object3D();
          managerScene.scene.add(tempObject);
          managerScene.interval();
          managerScene.scene.remove(tempObject);
        },
      ];

      for (let i = 0; i < errorScenarios.length; i++) {
        expect(() => {
          errorScenarios[i]();
        }, `Error scenario ${i} should not throw`).not.toThrow();
      }

      // Verify core properties remain unchanged
      expect(
        managerScene.manager.throttlingTime_ms,
        "Throttling time should remain consistent after error scenarios",
      ).toBe(initialThrottlingTime);

      // Verify manager is still functional
      expect(() => {
        managerScene.interval();
        managerScene.dispatchMouseEvent("pointermove", 100, 100);
      }, "Manager should remain functional after error scenarios").not.toThrow();
    });
  });
});
