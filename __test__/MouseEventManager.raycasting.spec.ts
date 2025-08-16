/**
 * @fileoverview MouseEventManager raycasting and intersection processing tests
 *
 * @description
 * Tests detailed raycasting functionality including getIntersects() UUID filtering,
 * checkIntersects() Z-order processing, and checkTarget() hierarchy search behavior.
 *
 * **Test Coverage**:
 * - getIntersects() UUID deduplication for multi-face geometry
 * - ViewPortUtil integration for coordinate transformation
 * - checkIntersects() distance-based ordering for Z-depth handling
 * - checkTarget() hierarchy traversal until Scene boundary
 *
 * **Test Environment**: Uses MouseEventManagerScene helper class with
 * complex geometry and hierarchy setups to test raycasting edge cases
 * and core raycasting behaviors.
 */

import {
  BoxGeometry,
  Group,
  type Intersection,
  Mesh,
  MeshBasicMaterial,
  Object3D,
} from "three";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
} from "vitest";
import { ClickableMesh, type ClickableState } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

/**
 * Test environment interface for raycasting tests
 *
 * @description
 * Defines the test environment structure for MouseEventManager raycasting tests,
 * including multi-face geometry and complex hierarchy setups.
 */
interface RaycastingTestEnvironment {
  /** MouseEventManager test scene with camera, canvas, and event dispatching */
  managerScene: MouseEventManagerScene;
  /** ClickableMesh with BoxGeometry for UUID filtering tests */
  multiFaceMesh: ClickableMesh;
  /** Canvas center X coordinate for consistent event positioning */
  halfW: number;
  /** Canvas center Y coordinate for consistent event positioning */
  halfH: number;
}

/**
 * MouseEventManager raycasting and intersection processing tests
 *
 * @description
 * Comprehensive test suite for MouseEventManager's raycasting functionality,
 * including UUID filtering, Z-order processing, and hierarchy traversal.
 *
 * **Isolation Strategy**:
 * Each test creates its own isolated environment to ensure no shared state
 * between test executions, following the pattern established in other
 * MouseEventManager test files.
 */
describe("MouseEventManager Raycasting & Intersection Processing", () => {
  const testEnvironments: MouseEventManagerScene[] = [];

  afterAll(() => {
    // Clean up all MouseEventManager instances and canvas elements
    testEnvironments.forEach((env) => {
      env.dispose();
    });
    testEnvironments.length = 0;
  });

  /**
   * Helper function to check ClickableMesh material state
   *
   * @param mesh - ClickableMesh to check
   * @param expectedState - Expected ClickableState
   * @param message - Custom error message for assertion
   *
   * @description
   * Verifies that the mesh's current material matches the expected state
   * material from its material set, considering the enabled/disabled state.
   */
  const checkMeshMaterialState = (
    mesh: ClickableMesh,
    expectedState: ClickableState,
    message: string = "",
  ): void => {
    const materialSet = mesh.interactionHandler.materialSet;
    if (!materialSet) {
      throw new Error("materialSet is undefined");
    }

    // biome-ignore lint/suspicious/noExplicitAny: Testing internal _enable flag for state consistency validation
    const isEnabled = (mesh.interactionHandler as any)._enable as boolean;

    const expectedMaterial = materialSet.getMaterial(
      expectedState,
      isEnabled,
    ).material;
    expect(mesh.material, message).toBe(expectedMaterial);
  };

  /**
   * Creates an isolated test environment for raycasting tests
   *
   * @returns Complete test environment with multi-face geometry and hierarchy
   *
   * @description
   * Generates a test environment containing:
   * - Multi-face BoxGeometry ClickableMesh for UUID filtering tests
   * - Parent-child hierarchy for traversal tests
   * - Canvas center coordinates for consistent positioning
   */
  const createRaycastingTestEnvironment = (): RaycastingTestEnvironment => {
    const managerScene = new MouseEventManagerScene();
    testEnvironments.push(managerScene);

    // Create multi-face geometry for UUID filtering tests
    const multiFaceMesh = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: getMeshMaterialSet(),
    });
    multiFaceMesh.position.set(0, 0, 0);
    managerScene.scene.add(multiFaceMesh);

    const halfW = MouseEventManagerScene.W / 2;
    const halfH = MouseEventManagerScene.H / 2;

    return {
      managerScene,
      multiFaceMesh,
      halfW,
      halfH,
    };
  };

  /**
   * getIntersects() UUID Filtering Tests
   *
   * @description
   * Tests the UUID-based deduplication functionality in getIntersects()
   * that eliminates duplicate intersections when a ray hits multiple faces
   * of the same geometry.
   */
  describe("getIntersects() UUID Filtering", () => {
    test("should filter duplicate intersections for multi-face geometry using UUID", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createRaycastingTestEnvironment();

      // Position pointer directly over the center of the box geometry
      // This should hit multiple faces but only return one intersection per object
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Verify the multi-face mesh receives interaction (confirming intersection occurred)
      checkMeshMaterialState(
        multiFaceMesh,
        "over",
        "Multi-face mesh should receive interaction when ray intersects multiple faces",
      );
    });

    test("should handle empty intersections array gracefully", () => {
      const { managerScene, multiFaceMesh } = createRaycastingTestEnvironment();

      // Ensure clean initial state
      checkMeshMaterialState(
        multiFaceMesh,
        "normal",
        "Initial state should be normal before testing empty intersections",
      );

      // Dispatch event far outside any object bounds
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", 10, 10);

      // Verify no interactions occurred (confirming empty intersections handling)
      checkMeshMaterialState(
        multiFaceMesh,
        "normal",
        "Empty intersections should be handled without errors",
      );

      // Verify system remains stable after empty intersections
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", 20, 20);
      checkMeshMaterialState(
        multiFaceMesh,
        "normal",
        "System should remain stable after processing empty intersections",
      );
    });
  });

  /**
   * checkIntersects() Z-order Processing Tests
   *
   * @description
   * Tests the distance-based ordering in checkIntersects() method
   * for proper Z-depth handling and occlusion behavior.
   */
  describe("checkIntersects() Z-order Processing", () => {
    test("should process intersections in distance order for proper Z-depth handling", () => {
      const { managerScene, halfW, halfH, multiFaceMesh } =
        createRaycastingTestEnvironment();

      // Create two meshes at different Z positions
      const frontMesh = new ClickableMesh({
        geo: new BoxGeometry(100, 100, 20),
        material: getMeshMaterialSet(),
      });
      frontMesh.position.set(0, 0, 10); // Closer to camera

      const backMesh = new ClickableMesh({
        geo: new BoxGeometry(100, 100, 20),
        material: getMeshMaterialSet(),
      });
      backMesh.position.set(0, 0, -10); // Further from camera

      managerScene.scene.add(frontMesh);
      managerScene.scene.add(backMesh);

      // Dispatch event that would hit both meshes
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // The front mesh should receive interaction (processed first due to Z-order)
      checkMeshMaterialState(
        frontMesh,
        "over",
        "Nearest objects should be processed first in intersection handling",
      );

      // Back mesh should not receive interaction due to Z-depth occlusion
      checkMeshMaterialState(
        backMesh,
        "normal",
        "Objects behind nearer objects should not receive interaction",
      );

      // Pre-existing small mesh should also be occluded by the front mesh
      checkMeshMaterialState(
        multiFaceMesh,
        "normal",
        "Pre-existing mesh behind the front mesh should remain non-interactive due to occlusion",
      );
    });
  });

  /**
   * checkTarget() Hierarchy Search Tests
   *
   * @description
   * Tests the object hierarchy traversal functionality in checkTarget()
   * including Scene boundary detection and hasTarget flag management.
   */
  describe("checkTarget() Hierarchy Search", () => {
    test("should traverse object hierarchy upward until reaching Scene", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createRaycastingTestEnvironment();

      // Create a hierarchy by wrapping existing multiFaceMesh in groups
      // Scene -> Group -> Object3D -> multiFaceMesh
      const intermediateObject = new Object3D();
      const parentGroup = new Group();

      // Remove multiFaceMesh from scene and rewrap it in hierarchy
      managerScene.scene.remove(multiFaceMesh);
      intermediateObject.add(multiFaceMesh);
      parentGroup.add(intermediateObject);
      managerScene.scene.add(parentGroup);

      // Dispatch event over the mesh through the hierarchy
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Verify the mesh receives interaction through hierarchy traversal
      checkMeshMaterialState(
        multiFaceMesh,
        "over",
        "Hierarchy traversal should detect interactive objects through parent chain",
      );
    });

    test("should handle null parent references without errors", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createRaycastingTestEnvironment();

      // Use existing multiFaceMesh which is directly added to Scene
      // This creates the scenario: Scene -> multiFaceMesh (parent will be Scene, then null)

      // Dispatch event over the mesh
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      // Verify the mesh receives interaction without errors
      checkMeshMaterialState(
        multiFaceMesh,
        "over",
        "Null parent references should be handled gracefully during hierarchy search",
      );

      // Move away to test system stability
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", 10, 10);
      checkMeshMaterialState(
        multiFaceMesh,
        "normal",
        "System should remain stable after processing null parent references",
      );
    });
  });

  /**
   * ViewPortUtil Integration Tests
   *
   * @description
   * Tests the integration between getIntersects() and ViewPortUtil
   * for coordinate transformation accuracy.
   */
  describe("ViewPortUtil Integration", () => {
    test("should convert pointer coordinates using ViewPortUtil before raycasting", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createRaycastingTestEnvironment();

      // Test coordinate conversion by verifying interaction at canvas center
      // Canvas center should map to world coordinates correctly
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW, halfH);

      checkMeshMaterialState(
        multiFaceMesh,
        "over",
        "Pointer coordinates should be properly converted through ViewPortUtil",
      );

      // Test small delta from center to validate coordinate conversion continuity
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW + 1, halfH);
      checkMeshMaterialState(
        multiFaceMesh,
        "over",
        "Near-center coordinates should be properly converted for intersection detection",
      );
    });
  });

  /**
   * Internal Implementation Testing (Encapsulation Breaking)
   *
   * @description
   * ⚠️ WARNING: This test suite breaks encapsulation by accessing internal
   * MouseEventManager implementation details. These tests are necessary to
   * verify critical UUID filtering functionality that cannot be validated
   * through public APIs alone.
   *
   * **Justification for Encapsulation Breaking:**
   * - UUID filtering is an internal optimization with no public API exposure
   * - Multi-face intersections occur when Three.js raycaster hits multiple faces of BoxGeometry
   * - Public API testing cannot verify UUID deduplication effectiveness
   * - This functionality is critical for preventing duplicate event processing and performance
   *
   * **Isolation Strategy:**
   * These tests are isolated in a separate describe block to clearly mark
   * them as implementation-dependent and potentially brittle.
   */
  describe("Internal Implementation Testing (Encapsulation Breaking)", () => {
    let managerScene: MouseEventManagerScene;
    let plainMesh: Mesh;

    const halfW = MouseEventManagerScene.W / 2;
    const halfH = MouseEventManagerScene.H / 2;

    beforeEach(() => {
      managerScene = new MouseEventManagerScene();

      // Create plain mesh with BoxGeometry to trigger multi-face collisions
      plainMesh = new Mesh(
        new BoxGeometry(3, 3, 3),
        new MeshBasicMaterial({ color: 0x444444 }),
      );
      plainMesh.position.set(0, 0, 0);

      managerScene.scene.add(plainMesh);
      managerScene.reset();
    });

    afterEach(() => {
      managerScene.dispose();
    });

    test("should verify UUID filtering effectiveness by directly testing getIntersects", () => {
      // Create a mock PointerEvent for testing
      const mockEvent = new PointerEvent("pointermove", {
        clientX: halfW,
        clientY: halfH,
        bubbles: true,
        cancelable: true,
      });

      // Access the internal MouseEventManager instance
      // biome-ignore lint/suspicious/noExplicitAny: Breaking encapsulation for critical UUID filtering verification
      const manager = (managerScene as any).manager;

      // Temporarily disable UUID filtering to get raw intersection results
      const originalGetIntersects = manager.getIntersects.bind(manager);

      // Create modified version that returns raw intersects without UUID filtering
      const getRawIntersects = (event: PointerEvent) => {
        // Copy the getIntersects logic but skip UUID filtering
        // Convert mouse position (same logic as getIntersects)
        const mouse = manager.mouse;
        mouse.set(
          (event.clientX / manager.canvas.clientWidth) * 2 - 1,
          -(event.clientY / manager.canvas.clientHeight) * 2 + 1,
        );

        manager.raycaster.setFromCamera(mouse, manager.camera);
        const intersects = manager.raycaster.intersectObjects(
          manager.targets,
          manager.recursive,
        );

        // Return raw intersects WITHOUT UUID filtering
        return intersects;
      };

      // Get results with and without UUID filtering
      const rawIntersects = getRawIntersects(mockEvent);
      const filteredIntersects = originalGetIntersects(mockEvent);

      // Extract UUIDs for analysis
      const rawUuids = rawIntersects.map((i: Intersection) => i.object.uuid);
      const uniqueRawUuids = new Set(rawUuids);
      const filteredUuids = filteredIntersects.map(
        (i: Intersection) => i.object.uuid,
      );
      const uniqueFilteredUuids = new Set(filteredUuids);

      // CRITICAL VERIFICATION: Prove UUID duplicates exist in raw results
      expect(rawUuids.length).toBeGreaterThan(uniqueRawUuids.size);
      expect(rawUuids.length).toBeGreaterThanOrEqual(2);

      // CRITICAL VERIFICATION: Prove UUID filtering removes duplicates
      expect(filteredUuids.length).toBe(uniqueFilteredUuids.size);
      expect(filteredIntersects.length).toBeLessThan(rawIntersects.length);

      // CRITICAL VERIFICATION: Ensure same object produces multiple intersections
      expect(uniqueRawUuids.size).toBe(1);
      expect(uniqueFilteredUuids.size).toBe(1);
      expect(Array.from(uniqueRawUuids)[0]).toBe(
        Array.from(uniqueFilteredUuids)[0],
      );
    });
  });
});
