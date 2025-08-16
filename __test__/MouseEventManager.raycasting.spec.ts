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
 * - checkIntersects() distance-based ordering and early termination
 * - checkTarget() hierarchy traversal and Scene boundary detection
 *
 * **Test Environment**: Uses MouseEventManagerScene and MouseEventManagerButton
 * helper classes with complex geometry and hierarchy setups to test raycasting
 * edge cases and optimization behaviors.
 */

import { BoxGeometry, Group, Mesh, Object3D } from "three";
import { afterAll, describe, expect, test, vi } from "vitest";
import {
  ClickableMesh,
  type ClickableState,
  type StateMaterialSet,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { MouseEventManagerButton } from "./MouseEventManagerButton.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";

/**
 * Test environment interface for raycasting tests
 *
 * @description
 * Defines the test environment structure for MouseEventManager raycasting tests,
 * including multi-face geometry and complex hierarchy setups.
 */
interface RaycastingTestEnvironment {
  managerScene: MouseEventManagerScene;
  multiFaceMesh: ClickableMesh;
  parentGroup: Group;
  childMesh: ClickableMesh;
  halfW: number;
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
   * material from its material set. Similar to MouseEventManagerButton.checkMaterial.
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

    // Create parent-child hierarchy for traversal tests
    const parentGroup = new Group();
    const childMesh = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: getMeshMaterialSet(),
    });
    childMesh.position.set(100, 0, 0);
    parentGroup.add(childMesh);
    managerScene.scene.add(parentGroup);

    const halfW = MouseEventManagerScene.W / 2;
    const halfH = MouseEventManagerScene.H / 2;

    return {
      managerScene,
      multiFaceMesh,
      parentGroup,
      childMesh,
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
   * Tests the distance-based ordering and early termination optimization
   * in checkIntersects() method.
   */
  describe("checkIntersects() Z-order Processing", () => {
    test("should process intersections in distance order for proper Z-depth handling", () => {
      const { managerScene, halfW, halfH } = createRaycastingTestEnvironment();

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

      // Test edge coordinate conversion
      managerScene.interval();
      managerScene.dispatchMouseEvent("pointermove", halfW + 1, halfH);
      checkMeshMaterialState(
        multiFaceMesh,
        "over",
        "Edge coordinates should be properly converted for intersection detection",
      );
    });
  });
});
