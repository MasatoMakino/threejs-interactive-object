import { describe, it, expect, afterAll } from "vitest";
import { BoxGeometry } from "three";
import { ClickableMesh } from "../src/index.js";
import { MouseEventManagerScene } from "./MouseEventManagerScene.js";
import { getMeshMaterialSet } from "./Materials.js";

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
    const managerScene = new MouseEventManagerScene({
      canvasWidth: 800,
      canvasHeight: 600,
      throttlingTime_ms: 0,
    });
    testEnvironments.push(managerScene);

    // Create multi-face geometry for UUID filtering tests
    const multiFaceMesh = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: getMeshMaterialSet(),
    });
    multiFaceMesh.position.set(0, 0, 0);
    managerScene.scene.add(multiFaceMesh);

    const halfW = managerScene.canvas.width / 2;
    const halfH = managerScene.canvas.height / 2;

    return {
      managerScene,
      multiFaceMesh,
      halfW,
      halfH,
    };
  };

  describe("PointerID Infrastructure", () => {
    it("should handle different pointerId values", () => {
      const { managerScene } = createRaycastingTestEnvironment();
      // 異なるpointerIdでイベント生成テスト
      const pointerIds = [1, 2, -560913604, -560913605]; // Chrome mouse + iPad touch風

      pointerIds.forEach((pointerId) => {
        managerScene.dispatchMouseEvent("pointermove", 400, 300, pointerId);
      });

      const currentOver = (managerScene.manager as any).currentOver;
      expect(currentOver.size).toBe(pointerIds.length);
      pointerIds.forEach((pointerId) => {
        expect(currentOver.has(pointerId)).toBe(true);
      });
    });
  });

  describe("currentOver Map Infrastructure", () => {
    it("should have currentOver as Map property", () => {
      const { managerScene } = createRaycastingTestEnvironment();
      // currentOverがMapであることを確認
      expect((managerScene.manager as any).currentOver).toBeInstanceOf(Map);
    });

    it("should initialize empty currentOver Map", () => {
      const { managerScene } = createRaycastingTestEnvironment();
      // 初期状態でcurrentOverが空であることを確認
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        any
      >;
      expect(currentOver.size).toBe(0);
    });

    it("should manage separate hover states per pointerId", () => {
      const { managerScene, multiFaceMesh } = createRaycastingTestEnvironment();
      // 異なるpointerIdで異なる状態管理をテスト
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        any[]
      >;

      // pointerId 1の状態設定
      currentOver.set(1, [multiFaceMesh]);
      // pointerId 2の状態設定
      currentOver.set(2, []);

      expect(currentOver.get(1)).toHaveLength(1);
      expect(currentOver.get(2)).toHaveLength(0);
      expect(currentOver.size).toBe(2);
    });

    it("should handle multiple pointers on same object", () => {
      const { managerScene, multiFaceMesh } = createRaycastingTestEnvironment();
      // 同一オブジェクトに複数pointerIdが hover している状態をテスト
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        any[]
      >;

      // 複数のpointerIdで同じターゲットをhover
      currentOver.set(1, [multiFaceMesh]);
      currentOver.set(2, [multiFaceMesh]);
      currentOver.set(-560913604, [multiFaceMesh]); // iPad風ID

      expect(currentOver.get(1)).toContain(multiFaceMesh);
      expect(currentOver.get(2)).toContain(multiFaceMesh);
      expect(currentOver.get(-560913604)).toContain(multiFaceMesh);
      expect(currentOver.size).toBe(3);
    });
  });

  describe("Multi-touch Event Processing", () => {
    it("should handle clearOver with specific pointerId", () => {
      const { managerScene, multiFaceMesh } = createRaycastingTestEnvironment();

      // 特定pointerIdのclearOver動作をテスト
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        any[]
      >;

      // 複数pointerIdの状態を設定
      currentOver.set(1, [multiFaceMesh]);
      currentOver.set(2, [multiFaceMesh]);

      // pointerId 1のみクリア
      (managerScene.manager as any).clearOver(1);

      expect(currentOver.has(1)).toBe(false);
      expect(currentOver.has(2)).toBe(true);
      expect(currentOver.get(2)).toContain(multiFaceMesh);
    });

    it("should handle clearOver without pointerId (clear all)", () => {
      const { managerScene, multiFaceMesh } = createRaycastingTestEnvironment();
      // 全pointerIdクリアのテスト
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        any[]
      >;

      // 複数pointerIdの状態を設定
      currentOver.set(1, [multiFaceMesh]);
      currentOver.set(2, [multiFaceMesh]);
      currentOver.set(-560913604, [multiFaceMesh]);

      // 全てクリア
      (managerScene.manager as any).clearOver();

      expect(currentOver.size).toBe(0);
    });

    it("should pass pointerId through event processing chain", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createRaycastingTestEnvironment();

      // pointerIdがイベント処理チェーンを通って伝播することをテスト
      const events: Array<{ type: string; pointerId: number }> = [];
      multiFaceMesh.interactionHandler.on("over", (e) => {
        events.push({ type: "over", pointerId: e.pointerId });
      });

      multiFaceMesh.interactionHandler.on("down", (e) => {
        events.push({ type: "down", pointerId: e.pointerId });
      });

      // 固定座標を使用（レイキャスティングのためにcanvas中央付近）
      const centerX = halfW;
      const centerY = halfH;

      managerScene.dispatchMouseEvent("pointermove", centerX, centerY, 123);
      managerScene.dispatchMouseEvent("pointerdown", centerX, centerY, 123);

      // pointerIdが正しく伝播していることを確認
      expect(events.some((e) => e.type === "over" && e.pointerId === 123)).toBe(
        true,
      );
      expect(events.some((e) => e.type === "down" && e.pointerId === 123)).toBe(
        true,
      );
    });
  });

  describe("Backward Compatibility", () => {
    it("should maintain Map-based currentOver behavior", () => {
      const { managerScene } = createRaycastingTestEnvironment();

      const currentOver = (managerScene.manager as any).currentOver;
      expect(currentOver).toBeInstanceOf(Map);
      expect(currentOver.size).toBe(0);
      // 現在のcurrentOverがMapであることを確認
    });

    it("should process single pointer events as before", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createRaycastingTestEnvironment();

      // 単一ポインターイベントが従来通り処理されることを確認
      const events: string[] = [];
      multiFaceMesh.interactionHandler.on("over", () => events.push("over"));
      multiFaceMesh.interactionHandler.on("out", () => events.push("out"));

      managerScene.dispatchMouseEvent("pointermove", halfW, halfH, 1);

      // over イベントが発生することを確認
      expect(events).toContain("over");
      expect(events).not.toContain("out");
    });
  });
});
