/**
 * @fileoverview MouseEventManager constructor options tests
 *
 * @description
 * Tests constructor option handling for MouseEventManager including
 * throttlingTime_ms, viewport, targets, and recursive options configuration.
 *
 * **Test Environment**: Uses extended MouseEventManagerScene with constructor options
 * support to create controlled Three.js environments with different MouseEventManager
 * configurations.
 *
 * **Isolation Strategy**: Each test creates its own isolated environment
 * following the same pattern as MouseEventManager.spec.ts to ensure no
 * shared state between test executions.
 */

import { BoxGeometry, Group, Vector4 } from "three";
import { afterAll, describe, expect, test } from "vitest";
import { ClickableMesh } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import {
  type MouseEventManagerConstructorOptions,
  MouseEventManagerScene,
} from "./MouseEventManagerScene.js";

/**
 * Test environment interface for type safety and clarity
 *
 * @description
 * Defines the test environment structure returned by
 * createTestEnvironment helper function for MouseEventManager constructor tests.
 */
interface TestEnvironment {
  managerScene: MouseEventManagerScene;
  btn: MouseEventManagerButton;
  halfW: number;
  halfH: number;
}

/**
 * MouseEventManager constructor options tests
 *
 * @description
 * Comprehensive test suite for MouseEventManager's constructor options,
 * including throttlingTime_ms, viewport, targets, and recursive configuration.
 *
 * **Isolation Strategy**:
 * Each test creates its own isolated environment using createTestEnvironment()
 * to ensure no shared state between test executions.
 *
 * **Test Environment Components**:
 * - Fresh Three.js scene, camera, canvas, and MouseEventManager instances
 * - Configurable MouseEventManager with custom constructor options
 * - Canvas center coordinates for consistent pointer positioning
 *
 * **Memory Management**:
 * All MouseEventManagerScene instances are tracked and properly disposed in afterAll
 * to prevent memory leaks during test execution.
 */
describe("MouseEventManager Constructor Options", () => {
  const testEnvironments: MouseEventManagerScene[] = [];

  afterAll(() => {
    // Clean up all MouseEventManager instances and canvas elements to prevent memory leaks
    testEnvironments.forEach((env) => {
      env.dispose();
    });
    testEnvironments.length = 0;
  });

  /**
   * Creates an isolated test environment for MouseEventManager constructor tests
   *
   * @param options - Optional constructor options for MouseEventManager
   * @returns Test environment with all necessary components
   *
   * @description
   * Generates a fresh test environment containing:
   * - MouseEventManagerScene with Three.js scene, camera, canvas, and MouseEventManager
   * - Primary ClickableMesh button for interaction testing
   * - Canvas center coordinates for consistent pointer positioning
   */
  const createTestEnvironment = (
    options?: MouseEventManagerConstructorOptions,
  ): TestEnvironment => {
    const managerScene = new MouseEventManagerScene(options);

    // Track instance for cleanup in afterAll
    testEnvironments.push(managerScene);

    const btn = new MouseEventManagerButton();
    managerScene.scene.add(btn.button);

    const halfW = MouseEventManagerScene.W / 2;
    const halfH = MouseEventManagerScene.H / 2;

    return {
      managerScene,
      btn,
      halfW,
      halfH,
    };
  };

  /**
   * Default Options Validation Block
   */
  describe("Default Options", () => {
    test("should initialize with default constructor options when no options provided", () => {
      const { managerScene } = createTestEnvironment();

      expect(
        managerScene.manager.throttlingTime_ms,
        "Default throttling time should be 33ms",
      ).toBe(33);
      // Note: Protected properties (recursive, targets, viewport) are tested through behavior, not direct access
    });

    test("should initialize with default values when empty options object provided", () => {
      const { managerScene } = createTestEnvironment({});

      expect(
        managerScene.manager.throttlingTime_ms,
        "Throttling time should default to 33ms with empty options",
      ).toBe(33);
      // Note: Other default behaviors are verified through integration tests below
    });
  });

  /**
   * throttlingTime_ms Option Block
   */
  describe("throttlingTime_ms Option", () => {
    test("should accept custom throttling time and use it for interval calculations", () => {
      const customThrottlingTime = 50;
      const { managerScene } = createTestEnvironment({
        throttlingTime_ms: customThrottlingTime,
      });

      expect(
        managerScene.manager.throttlingTime_ms,
        `Custom throttling time should be ${customThrottlingTime}ms`,
      ).toBe(customThrottlingTime);

      // Verify that interval() method uses the custom throttling time
      const initialTime = managerScene.currentTime;
      managerScene.interval(1.0); // Should advance by exactly customThrottlingTime * 1.0
      const expectedTime = initialTime + customThrottlingTime;
      expect(
        managerScene.currentTime,
        `Time should advance by custom throttling interval: ${customThrottlingTime}ms`,
      ).toBe(expectedTime);
    });

    test("should handle boundary values for throttling time correctly", () => {
      // Test minimum positive value
      const { managerScene: minScene } = createTestEnvironment({
        throttlingTime_ms: 1,
      });
      expect(
        minScene.manager.throttlingTime_ms,
        "Should accept minimum throttling time of 1ms",
      ).toBe(1);

      // Test zero value
      const { managerScene: zeroScene } = createTestEnvironment({
        throttlingTime_ms: 0,
      });
      expect(
        zeroScene.manager.throttlingTime_ms,
        "Should accept zero throttling time",
      ).toBe(0);

      // Test large value
      const { managerScene: largeScene } = createTestEnvironment({
        throttlingTime_ms: 1000,
      });
      expect(
        largeScene.manager.throttlingTime_ms,
        "Should accept large throttling time",
      ).toBe(1000);
    });
  });

  /**
   * viewport Option Block
   */
  describe("viewport Option", () => {
    test("should accept Vector4 viewport configuration for multi-viewport applications", () => {
      const customViewport = new Vector4(10, 20, 300, 400);
      const { managerScene } = createTestEnvironment({
        viewport: customViewport,
      });

      // Verify that manager initializes without errors when viewport is provided
      expect(
        managerScene.manager,
        "MouseEventManager should initialize successfully with custom viewport",
      ).toBeDefined();
      expect(
        managerScene.manager.throttlingTime_ms,
        "Manager should be functional with custom viewport",
      ).toBe(33);
    });

    test("should handle default viewport behavior when not specified", () => {
      const { managerScene } = createTestEnvironment({ throttlingTime_ms: 50 }); // Other option without viewport

      // Verify that manager works normally without viewport
      expect(
        managerScene.manager,
        "MouseEventManager should initialize successfully without viewport",
      ).toBeDefined();
      expect(
        managerScene.manager.throttlingTime_ms,
        "Manager should be functional without viewport",
      ).toBe(50);
    });

    test("should integrate with ViewPortUtil for coordinate transformation", () => {
      // This test verifies basic integration with ViewPortUtil without duplicating detailed coordinate tests
      // Using a full-screen viewport that matches the canvas to ensure coordinates work
      const fullScreenViewport = new Vector4(
        0,
        0,
        MouseEventManagerScene.W,
        MouseEventManagerScene.H,
      );
      const { managerScene, btn, halfW, halfH } = createTestEnvironment({
        viewport: fullScreenViewport,
      });

      // Basic interaction test to verify viewport integration works
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // This verifies that the manager can process events with custom viewport
      // (detailed coordinate transformation is tested in ViewPortUtil.spec.ts)
      expect(
        btn.button.interactionHandler.isOver,
        "Manager should handle interactions with custom viewport",
      ).toBe(true);
    });
  });

  /**
   * targets Option Block
   */
  describe("targets Option", () => {
    test("should limit raycasting to custom targets array when specified", () => {
      // Create two buttons: one in targets, one not in targets
      const targetButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });
      const nonTargetButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });

      // Position buttons at same location but different Z depths
      targetButton.position.set(0, 0, 0);
      nonTargetButton.position.set(0, 0, -5);

      const { managerScene, halfW, halfH } = createTestEnvironment({
        targets: [targetButton], // Only targetButton is in targets array
      });

      // Add both buttons to scene, but only targetButton is in targets
      managerScene.scene.add(targetButton);
      managerScene.scene.add(nonTargetButton);

      // Reset and test interaction
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Only the target button should respond to interactions
      expect(
        targetButton.interactionHandler.isOver,
        "Target button should receive interaction when in targets array",
      ).toBe(true);
      expect(
        nonTargetButton.interactionHandler.isOver,
        "Non-target button should not receive interaction when not in targets array",
      ).toBe(false);
    });

    test("should not detect any interactions when empty targets array provided", () => {
      const { managerScene, btn, halfW, halfH } = createTestEnvironment({
        targets: [], // Empty targets array
      });

      // Button is in scene but not in targets array
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // No interactions should be detected
      expect(
        btn.button.interactionHandler.isOver,
        "Button should not respond when targets array is empty",
      ).toBe(false);
    });

    test("should use scene.children as default targets when not specified", () => {
      const { managerScene, btn, halfW, halfH } = createTestEnvironment(); // No targets specified

      // Button is added to scene via createTestEnvironment, so it's in scene.children
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Button should respond because it's in scene.children (default targets)
      expect(
        btn.button.interactionHandler.isOver,
        "Button should respond when using default scene.children targets",
      ).toBe(true);
    });
  });

  /**
   * recursive Option Block
   */
  describe("recursive Option", () => {
    test("should detect child objects when recursive: true (default behavior)", () => {
      const parentGroup = new Group();
      const childButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });

      // Add child to parent group
      parentGroup.add(childButton);

      const { managerScene, halfW, halfH } = createTestEnvironment({
        targets: [parentGroup], // Parent group in targets
        recursive: true, // Explicit true for clarity
      });

      managerScene.scene.add(parentGroup);

      // Reset and test interaction
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Child button should be detected through recursive raycasting
      expect(
        childButton.interactionHandler.isOver,
        "Child button should be detected when recursive: true",
      ).toBe(true);
    });

    test("should not detect child objects when recursive: false", () => {
      const parentGroup = new Group();
      const childButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });

      // Add child to parent group
      parentGroup.add(childButton);

      const { managerScene, halfW, halfH } = createTestEnvironment({
        targets: [parentGroup], // Parent group in targets
        recursive: false, // Child objects should not be detected
      });

      managerScene.scene.add(parentGroup);

      // Reset and test interaction
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Child button should NOT be detected when recursive: false
      expect(
        childButton.interactionHandler.isOver,
        "Child button should not be detected when recursive: false",
      ).toBe(false);
    });

    test("should use recursive: true as default behavior", () => {
      const parentGroup = new Group();
      const childButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });

      parentGroup.add(childButton);

      const { managerScene, halfW, halfH } = createTestEnvironment({
        targets: [parentGroup], // No recursive specified, should default to true
      });

      managerScene.scene.add(parentGroup);

      // Reset and test interaction
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Child button should be detected with default recursive: true
      expect(
        childButton.interactionHandler.isOver,
        "Child button should be detected with default recursive: true",
      ).toBe(true);
    });
  });

  /**
   * Combined Options Block
   */
  describe("Combined Options", () => {
    test("should handle multiple options specified simultaneously", () => {
      const customButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });

      const customOptions: MouseEventManagerConstructorOptions = {
        throttlingTime_ms: 25,
        viewport: new Vector4(
          0,
          0,
          MouseEventManagerScene.W,
          MouseEventManagerScene.H,
        ), // Full screen viewport
        targets: [customButton],
        recursive: false,
      };

      const { managerScene, halfW, halfH } =
        createTestEnvironment(customOptions);

      // Verify throttlingTime_ms setting (publicly accessible)
      expect(
        managerScene.manager.throttlingTime_ms,
        "Custom throttling time should be applied",
      ).toBe(25);

      // Add button to scene and test targets + recursive behavior
      managerScene.scene.add(customButton);
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Button should respond (verifies targets option works)
      expect(
        customButton.interactionHandler.isOver,
        "Custom targets option should work correctly",
      ).toBe(true);
    });

    test("should handle partial options specification with correct defaults", () => {
      const { managerScene, btn, halfW, halfH } = createTestEnvironment({
        throttlingTime_ms: 100,
        // Other options use defaults
      });

      // Verify specified option
      expect(
        managerScene.manager.throttlingTime_ms,
        "Specified throttling time should be applied",
      ).toBe(100);

      // Verify default behavior (recursive: true, targets: scene.children)
      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      expect(
        btn.button.interactionHandler.isOver,
        "Default targets and recursive behavior should work",
      ).toBe(true);
    });

    test("should demonstrate performance optimization scenario with combined options", () => {
      const optimizedButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });

      // Create a child in parent group to test recursive: false
      const parentGroup = new Group();
      const childButton = new ClickableMesh({
        geo: new BoxGeometry(3, 3, 3),
        material: getMeshMaterialSet(),
      });
      parentGroup.add(childButton);

      const optimizedOptions: MouseEventManagerConstructorOptions = {
        throttlingTime_ms: 16, // High frequency for responsive interactions
        targets: [optimizedButton, parentGroup], // Limit to known interactive objects
        recursive: false, // Disable hierarchy search for performance
      };

      const { managerScene, halfW, halfH } =
        createTestEnvironment(optimizedOptions);

      // Verify public properties
      expect(
        managerScene.manager.throttlingTime_ms,
        "Performance optimization: fast throttling should be applied",
      ).toBe(16);

      // Add objects to scene and test behavior
      managerScene.scene.add(optimizedButton);
      managerScene.scene.add(parentGroup);

      managerScene.reset();
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Direct target should work
      expect(
        optimizedButton.interactionHandler.isOver,
        "Performance optimization: direct target should respond",
      ).toBe(true);

      // Child should NOT respond due to recursive: false
      expect(
        childButton.interactionHandler.isOver,
        "Performance optimization: child should not respond with recursive: false",
      ).toBe(false);
    });
  });
});
