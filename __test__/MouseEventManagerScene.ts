import { RAFTicker } from "@masatomakino/raf-ticker";
import { BoxGeometry, type Camera, PerspectiveCamera, Scene } from "three";
import { ClickableMesh, MouseEventManager } from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { createFakePointerEventWithId } from "./PointerEventTestUtil.js";

/**
 * Constructor options type for MouseEventManager
 *
 * @description
 * Type alias derived from actual MouseEventManager constructor signature,
 * ensuring tests always match the real constructor options.
 */
export type MouseEventManagerConstructorOptions = NonNullable<
  ConstructorParameters<typeof MouseEventManager>[3]
>;

/**
 * Constructor options for MouseEventManagerScene
 *
 * @description
 * Options for customizing the test environment setup, including canvas dimensions
 * and MouseEventManager configuration. Extends MouseEventManagerConstructorOptions
 * to provide full backward compatibility with existing tests.
 */
export interface MouseEventManagerSceneOptions
  extends MouseEventManagerConstructorOptions {
  /** Canvas width in pixels (default: 1920) */
  canvasWidth?: number;
  /** Canvas height in pixels (default: 1080) */
  canvasHeight?: number;
}

/**
 * Test environment interface for raycasting tests
 *
 * @description
 * Defines the test environment structure for MouseEventManager raycasting tests,
 * including multi-face geometry and complex hierarchy setups.
 *
 * @public
 */
export interface RaycastingTestEnvironment {
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
 * Test helper class providing unified MouseEventManager environment
 *
 * @description
 * Manages Three.js scene, camera, canvas, and MouseEventManager components
 * in a unified way, providing essential setup and operations needed for testing.
 * Includes throttling control, state reset, and mouse event dispatch functionality.
 */
export class MouseEventManagerScene {
  public scene: Scene;
  public canvas: HTMLCanvasElement;
  public camera: Camera;
  public manager: MouseEventManager;
  private time: number = 0;

  /**
   * Gets the current internal time counter value
   *
   * @returns Current time value in milliseconds
   *
   * @description
   * Provides read-only access to the internal time counter used for
   * throttling simulation and RAF ticker event generation in tests.
   */
  public get currentTime(): number {
    return this.time;
  }

  /** Default canvas width for test environment */
  public static readonly W = 1920;
  /** Default canvas height for test environment */
  public static readonly H = 1080;

  /**
   * Creates a new test environment with scene, camera, canvas, and MouseEventManager
   *
   * @param options - Optional scene configuration options
   *
   * @description
   * Automatically sets up a complete Three.js test environment including:
   * - Scene with PerspectiveCamera positioned at (0, 0, 100)
   * - Canvas element with configurable dimensions (default: 1920x1080)
   * - MouseEventManager configured for the created components with optional custom options
   *
   * **Backward Compatibility**: Extends MouseEventManagerConstructorOptions to accept
   * all existing MouseEventManager options directly, while adding canvas dimension options.
   */
  constructor(options?: MouseEventManagerSceneOptions) {
    // Extract canvas dimensions from options or use defaults
    const canvasWidth = options?.canvasWidth ?? MouseEventManagerScene.W;
    const canvasHeight = options?.canvasHeight ?? MouseEventManagerScene.H;

    // Create MouseEventManager options by excluding canvas dimensions from scene options
    const {
      canvasWidth: _,
      canvasHeight: __,
      ...mouseEventManagerOptions
    } = options || {};

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, canvasWidth / canvasHeight, 1, 400);
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    this.canvas = document.createElement("canvas");
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    this.canvas.style.width = `${canvasWidth}px`;
    this.canvas.style.height = `${canvasHeight}px`;

    document.body.appendChild(this.canvas);
    //マウスイベントの取得開始
    this.manager = new MouseEventManager(
      this.scene,
      this.camera,
      this.canvas,
      mouseEventManagerOptions,
    );

    // Ensure clean initial state after MouseEventManager creation
    this.reset();
  }

  /**
   * Advances time by throttling interval and updates the scene
   *
   * @param ratio - Multiplier for throttling time (default: 2.0)
   *
   * @description
   * Simulates time progression by advancing internal time counter
   * by manager's throttling time multiplied by the given ratio.
   * Using the default ratio (2.0) ensures throttling is bypassed,
   * allowing immediate event processing in tests.
   * Emits RAF ticker event and updates scene matrix world.
   */
  public interval(ratio: number = 2.0): void {
    const delta = this.manager.throttlingTime_ms * ratio;
    this.time += delta;
    RAFTicker.emit("tick", {
      timestamp: this.time,
      delta,
    });
    this.scene.updateMatrixWorld();
  }

  /**
   * Resets the test environment to initial state
   *
   * @description
   * Performs a complete state reset by:
   * - Advancing time by one interval
   * - Dispatching neutral mouse events (move to origin, mouse up)
   * - Resetting internal time counter to 0
   *
   * Use this method between test cases to ensure clean state.
   */
  public reset() {
    this.interval();
    this.dispatchMouseEvent("pointermove", 0, 0);
    this.dispatchMouseEvent("pointerup", 0, 0);
    this.time = 0;
  }

  /**
   * Dispatches a pointer event to the canvas element
   *
   * @param type - Event type (pointer events like 'pointermove', 'pointerdown', 'pointerup')
   * @param x - X coordinate relative to canvas
   * @param y - Y coordinate relative to canvas
   * @param pointerId - Pointer identifier (defaults to 1 for primary pointer)
   *
   * @description
   * Creates a fake pointer event using `createFakePointerEventWithId` and dispatches it to the canvas element.
   * Uses PointerEvent to support multitouch scenarios with proper pointerId handling.
   */
  public dispatchMouseEvent(
    type: string,
    x: number,
    y: number,
    pointerId: number = 1,
  ): void {
    const e = createFakePointerEventWithId(
      type,
      {
        clientX: x,
        clientY: y,
        offsetX: x,
        offsetY: y,
      },
      pointerId,
    );
    this.canvas.dispatchEvent(e);
  }

  /**
   * Safely disposes of the MouseEventManager and cleans up DOM elements
   *
   * @description
   * Provides stable memory cleanup for the MouseEventManagerScene helper class.
   * Calls dispose() on the MouseEventManager to clean up RAF ticker subscriptions
   * and DOM event listeners, then removes the canvas element from the DOM if connected.
   * Safe to call multiple times.
   */
  public dispose(): void {
    // Dispose MouseEventManager to clean up RAF ticker and DOM listeners
    this.manager.dispose();

    // Remove canvas from DOM if still connected
    if (this.canvas.isConnected) {
      this.canvas.parentNode?.removeChild(this.canvas);
    }
  }
}

/**
 * Creates an isolated test environment for raycasting tests
 *
 * @param options - Optional scene configuration options
 * @param testEnvironments - Array to track created environments for cleanup
 * @returns Complete test environment with multi-face geometry and hierarchy
 *
 * @description
 * Generates a test environment containing:
 * - Multi-face BoxGeometry ClickableMesh for UUID filtering tests
 * - Parent-child hierarchy for traversal tests
 * - Canvas center coordinates for consistent positioning
 *
 * @example
 * ```typescript
 * const testEnvironments: MouseEventManagerScene[] = [];
 * const { managerScene, multiFaceMesh, halfW, halfH } = createRaycastingTestEnvironment({
 *   canvasWidth: 800,
 *   canvasHeight: 600,
 *   throttlingTime_ms: 0
 * }, testEnvironments);
 * ```
 *
 * @public
 */
export function createRaycastingTestEnvironment(
  options?: MouseEventManagerSceneOptions,
  testEnvironments?: MouseEventManagerScene[],
): RaycastingTestEnvironment {
  const managerScene = new MouseEventManagerScene(options);

  // Track for cleanup if array provided
  if (testEnvironments) {
    testEnvironments.push(managerScene);
  }

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
}
