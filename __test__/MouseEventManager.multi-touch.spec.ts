import { describe, it, expect, afterAll } from "vitest";
import {
  MouseEventManagerScene,
  createRaycastingTestEnvironment,
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
      const { managerScene } = createTestEnvironment();
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
      const { managerScene } = createTestEnvironment();
      // currentOverがMapであることを確認
      expect((managerScene.manager as any).currentOver).toBeInstanceOf(Map);
    });

    it("should initialize empty currentOver Map", () => {
      const { managerScene } = createTestEnvironment();
      // 初期状態でcurrentOverが空であることを確認
      const currentOver = (managerScene.manager as any).currentOver as Map<
        number,
        any
      >;
      expect(currentOver.size).toBe(0);
    });

    it("should manage separate hover states per pointerId", () => {
      const { managerScene, multiFaceMesh } = createTestEnvironment();
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
      const { managerScene, multiFaceMesh } = createTestEnvironment();
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
      const { managerScene, multiFaceMesh } = createTestEnvironment();

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
      const { managerScene, multiFaceMesh } = createTestEnvironment();
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
        createTestEnvironment();

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
      const { managerScene } = createTestEnvironment();

      const currentOver = (managerScene.manager as any).currentOver;
      expect(currentOver).toBeInstanceOf(Map);
      expect(currentOver.size).toBe(0);
      // 現在のcurrentOverがMapであることを確認
    });

    it("should process single pointer events as before", () => {
      const { managerScene, multiFaceMesh, halfW, halfH } =
        createTestEnvironment();

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
