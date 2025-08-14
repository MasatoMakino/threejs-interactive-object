import { getMouseEvent } from "@masatomakino/fake-mouse-event";
import { RAFTicker } from "@masatomakino/raf-ticker";
import { type Camera, PerspectiveCamera, Scene } from "three";
import { MouseEventManager } from "../src/index.js";

/**
 * Constructor options type for MouseEventManager
 *
 * @description
 * Type alias derived from actual MouseEventManager constructor signature,
 * ensuring tests always match the real constructor options.
 */
export type MouseEventManagerConstructorOptions = ConstructorParameters<
  typeof MouseEventManager
>[3];

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
   * @param options - Optional constructor options for MouseEventManager
   *
   * @description
   * Automatically sets up a complete Three.js test environment including:
   * - Scene with PerspectiveCamera positioned at (0, 0, 100)
   * - Canvas element with default dimensions (1920x1080)
   * - MouseEventManager configured for the created components with optional custom options
   */
  constructor(options?: MouseEventManagerConstructorOptions) {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      45,
      MouseEventManagerScene.W / MouseEventManagerScene.H,
      1,
      400,
    );
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    this.canvas = document.createElement("canvas");
    this.canvas.width = MouseEventManagerScene.W;
    this.canvas.height = MouseEventManagerScene.H;
    this.canvas.style.width = `${MouseEventManagerScene.W}px`;
    this.canvas.style.height = `${MouseEventManagerScene.H}px`;

    document.body.appendChild(this.canvas);
    //マウスイベントの取得開始
    this.manager = new MouseEventManager(
      this.scene,
      this.camera,
      this.canvas,
      options,
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
   * Dispatches a pointer/mouse event to the canvas element
   *
   * @param type - Event type (supports both pointer events like 'pointermove', 'pointerdown', 'pointerup' and mouse events)
   * @param x - X coordinate relative to canvas
   * @param y - Y coordinate relative to canvas
   *
   * @description
   * Creates a fake mouse event using `getMouseEvent` and dispatches it to the canvas element.
   * Although the function creates a MouseEvent, it can handle pointer event types
   * and includes clientX, clientY, offsetX, and offsetY properties set to the same values.
   */
  public dispatchMouseEvent(type: string, x: number, y: number): void {
    const e = getMouseEvent(type, {
      x,
      y,
      clientX: x,
      clientY: y,
      offsetX: x,
      offsetY: y,
    });
    this.canvas.dispatchEvent(e);
  }
}
