/**
 * @fileoverview Central event management system for pointer-interactive Three.js objects.
 *
 * This module provides the core MouseEventManager class, which serves as the central
 * event dispatcher for handling pointer interactions (mouse, touch, pen) within Three.js
 * scenes. The system uses raycasting for precise object detection and implements
 * performance optimizations including 33ms throttling and intelligent object filtering.
 *
 * **Key Features:**
 * - Unified pointer event handling across input types (mouse, touch, pen)
 * - Raycasting-based intersection detection with Z-order processing
 * - Performance-optimized with RAFTicker-based throttling (33ms default)
 * - Flexible target selection (scene-wide scanning vs. registered objects)
 * - Multi-viewport support compatible with WebGLRenderer.setViewport()
 * - Parent hierarchy traversal for nested interactive objects
 *
 * **Architecture:**
 * The MouseEventManager acts as a bridge between DOM pointer events and Three.js
 * object interactions. It identifies interactive objects through the IClickableObject3D
 * interface and delegates event processing to their associated ButtonInteractionHandler
 * instances.
 *
 * **Performance Considerations:**
 * - Throttling prevents excessive raycasting during rapid pointer movements
 * - Configurable target arrays reduce intersection testing overhead
 * - Recursive search can be disabled when using pre-registered target arrays
 * - Viewport-aware processing supports multiple rendering regions on single canvas
 *
 * @see {@link ButtonInteractionHandler} - Handles individual object interactions
 * @see {@link ThreeMouseEvent} - Event payload type system
 * @see {@link ViewPortUtil} - Coordinate transformation utilities
 * @see {@link IClickableObject3D} - Interface for interactive objects
 */

import {
  RAFTicker,
  type RAFTickerEventContext,
} from "@masatomakino/raf-ticker";
import {
  type Camera,
  type Intersection,
  type Object3D,
  Raycaster,
  type Scene,
  Vector2,
  type Vector4,
} from "three";
import {
  type ButtonInteractionHandler,
  type ThreeMouseEventMap,
  ThreeMouseEventUtil,
  ViewPortUtil,
} from "./index.js";

/**
 * Central event dispatcher for handling pointer interactions in Three.js scenes.
 *
 * @description
 * MouseEventManager serves as the core interaction management system for Three.js applications,
 * providing unified pointer event handling across mouse, touch, and pen input devices. It uses
 * raycasting to detect object intersections and manages event distribution to interactive objects
 * through a performance-optimized pipeline.
 *
 * The manager operates by:
 * 1. Listening to DOM pointer events on the canvas element
 * 2. Converting screen coordinates to normalized device coordinates
 * 3. Performing raycasting to identify intersected objects
 * 4. Traversing parent hierarchies to find IClickableObject3D implementations
 * 5. Delegating events to appropriate ButtonInteractionHandler instances
 *
 * **Performance Optimizations:**
 * - **Throttling**: Events are throttled using RAFTicker to prevent excessive raycasting (33ms default)
 * - **Target Filtering**: Configurable target arrays limit intersection testing scope
 * - **Recursive Control**: Hierarchy traversal can be disabled for pre-registered objects
 *
 * **Multi-Viewport Support:**
 * Compatible with Three.js WebGLRenderer.setViewport() for applications that render
 * multiple scenes or cameras to different regions of the same canvas element. The manager
 * determines which viewport corresponds to each pointer event and processes only relevant
 * interactive objects within that region.
 *
 * @example
 * ```typescript
 * import { MouseEventManager, ClickableMesh } from '@masatomakino/threejs-interactive-object';
 * import { Scene, PerspectiveCamera, WebGLRenderer, Vector4 } from 'three';
 *
 * // Basic setup
 * const scene = new Scene();
 * const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
 * const renderer = new WebGLRenderer();
 * const canvas = renderer.domElement;
 *
 * // Create interaction manager
 * const mouseManager = new MouseEventManager(scene, camera, canvas);
 *
 * // Advanced setup with optimizations and viewport constraint
 * const optimizedManager = new MouseEventManager(scene, camera, canvas, {
 *   throttlingTime_ms: 16, // Higher frequency for responsive interactions
 *   recursive: false, // Disable hierarchy search when using target arrays
 *   targets: [specificMesh1, specificMesh2], // Limit to known interactive objects
 *   viewport: new Vector4(0, 0, 512, 512) // Multi-viewport application support
 * });
 * ```
 *
 * @remarks
 * - The manager automatically handles both mouse and touch interactions through PointerEvent API
 * - Object intersection is processed in Z-order (front to back) with early termination
 * - Parent hierarchy traversal allows nested objects to inherit interactivity
 * - Deprecated IClickableObject3D.model interface usage triggers console warnings
 *
 * @see {@link ButtonInteractionHandler} - Individual object interaction management
 * @see {@link IClickableObject3D} - Interface contract for interactive objects
 * @see {@link ThreeMouseEvent} - Event payload structure
 * @see {@link ViewPortUtil} - Coordinate transformation utilities
 *
 * @public
 */
export class MouseEventManager {
  protected camera: Camera;
  protected scene: Scene;

  protected canvas: HTMLCanvasElement;

  protected raycaster: Raycaster = new Raycaster();
  protected mouse: Vector2 = new Vector2();

  protected currentOver: IClickableObject3D<unknown>[] = [];

  protected hasThrottled: boolean = false;
  public throttlingTime_ms: number;
  protected throttlingDelta: number = 0;
  protected viewport?: Vector4;
  protected recursive: boolean;
  protected targets: Object3D[];

  /**
   * Creates a new MouseEventManager instance.
   *
   * @param scene - The Three.js scene containing interactive objects
   * @param camera - The camera used for raycasting calculations
   * @param canvas - The HTML canvas element to attach pointer event listeners
   * @param option - Optional configuration parameters
   * @param option.throttlingTime_ms - Throttling interval in milliseconds (default: 33ms for ~30fps)
   * @param option.viewport - Viewport region for multi-viewport applications (Vector4: x, y, width, height)
   * @param option.targets - Array of specific objects to test for intersections (default: scene.children)
   * @param option.recursive - Whether to recursively search object hierarchies (default: true)
   *
   * @description
   * Initializes the interaction management system by setting up pointer event listeners
   * on the canvas element and registering with RAFTicker for throttled updates. The manager
   * immediately begins processing pointer events according to the specified configuration.
   *
   * **Configuration Guidelines:**
   * - Use shorter `throttlingTime_ms` (16ms) for responsive interactions at cost of performance
   * - Set `recursive: false` when using pre-registered `targets` array for optimization
   * - Specify `viewport` for applications using WebGLRenderer.setViewport()
   * - Limit `targets` to known interactive objects to reduce intersection testing overhead
   *
   * @example
   * ```typescript
   * // Basic setup
   * const manager = new MouseEventManager(scene, camera, canvas);
   *
   * // Performance-optimized setup
   * const fastManager = new MouseEventManager(scene, camera, canvas, {
   *   throttlingTime_ms: 16,        // 60fps for responsive UI
   *   recursive: false,              // Skip hierarchy traversal
   *   targets: [button1, button2]    // Test only specific objects
   * });
   *
   * // Multi-viewport application
   * const viewportManager = new MouseEventManager(scene, camera, canvas, {
   *   viewport: new Vector4(100, 100, 400, 300) // x, y, width, height
   * });
   * ```
   *
   * @remarks
   * - Pointer event listeners are attached using passive: false to allow preventDefault()
   * - RAFTicker integration ensures throttling works with animation frame timing
   * - The manager does not automatically remove event listeners; dispose() method needed
   * - Canvas should be properly sized before creating the manager for accurate coordinate conversion
   */
  constructor(
    scene: Scene,
    camera: Camera,
    canvas: HTMLCanvasElement,
    option?: {
      throttlingTime_ms?: number;
      viewport?: Vector4;
      targets?: Object3D[];
      recursive?: boolean;
    },
  ) {
    this.camera = camera;
    this.scene = scene;

    this.throttlingTime_ms = option?.throttlingTime_ms ?? 33;
    this.viewport = option?.viewport;
    this.recursive = option?.recursive ?? true;
    this.targets = option?.targets ?? this.scene.children;

    this.canvas = canvas;

    canvas.addEventListener("pointermove", this.onDocumentMouseMove, false);
    canvas.addEventListener("pointerdown", this.onDocumentMouseUpDown, false);
    canvas.addEventListener("pointerup", this.onDocumentMouseUpDown, false);

    RAFTicker.on("tick", this.onTick);
  }

  private onTick = (e: RAFTickerEventContext) => {
    this.throttlingDelta += Math.max(e.delta, 0); //経過時間がマイナスになることはありえないので、0未満の場合は0をセットする。
    if (this.throttlingDelta < this.throttlingTime_ms) {
      return;
    }
    this.hasThrottled = false;
    this.throttlingDelta %= this.throttlingTime_ms;
  };

  /**
   * Handles pointer move events with throttling and over/out state management.
   *
   * @param event - The pointer move event from the DOM
   *
   * @description
   * Processes pointer movement by performing raycasting to detect object intersections
   * and managing hover state transitions. The method implements throttling to prevent
   * excessive raycasting during rapid pointer movements, which significantly improves
   * performance in complex scenes.
   *
   * **Processing Flow:**
   * 1. Check throttling status to limit update frequency
   * 2. Perform raycasting to find intersected objects
   * 3. Process intersections in Z-order (front to back)
   * 4. Update current hover targets (currentOver array)
   * 5. Emit "out" events for objects no longer hovered
   * 6. Emit "over" events for newly hovered objects
   *
   * **State Management:**
   * The method maintains a currentOver array to track which objects are currently
   * being hovered. When the pointer moves, it compares the new intersection results
   * with the previous state to determine which objects need "over" or "out" events.
   *
   * @remarks
   * - Throttling is controlled by the throttlingTime_ms constructor parameter
   * - Early termination occurs when the first interactive object is found in Z-order
   * - The method calls preventDefault() to ensure consistent behavior across browsers
   * - Empty intersection results trigger clearOver() to reset all hover states
   *
   * @see {@link getIntersects} - Raycasting and intersection detection
   * @see {@link checkTarget} - Object interactivity validation and event dispatch
   * @see {@link clearOver} - Hover state cleanup
   */
  protected onDocumentMouseMove = (event: PointerEvent) => {
    if (this.hasThrottled) return;
    this.hasThrottled = true;

    event.preventDefault();
    const intersects = this.getIntersects(event);
    if (intersects.length === 0) {
      this.clearOver();
      return;
    }

    const beforeOver = this.currentOver;
    this.currentOver = [];

    for (const intersect of intersects) {
      const checked = this.checkTarget(intersect.object, "over");
      if (checked) break;
    }

    beforeOver?.forEach((btn) => {
      if (!this.currentOver.includes(btn)) {
        MouseEventManager.onButtonHandler(btn, "out");
      }
    });
  };

  /**
   * Clears all currently hovered objects and emits "out" events.
   *
   * @description
   * Resets the hover state by emitting "out" events for all objects currently
   * in the currentOver array, then clearing the array. This method is called
   * when the pointer moves outside all interactive objects or when no intersections
   * are detected during pointer movement.
   *
   * @remarks
   * This method ensures proper cleanup of hover states to prevent objects
   * from remaining in an incorrect "over" state when they should return to "normal".
   */
  protected clearOver(): void {
    this.currentOver?.forEach((over) => {
      MouseEventManager.onButtonHandler(over, "out");
    });
    this.currentOver = [];
  }

  /**
   * Handles pointer down and up events for interactive objects.
   *
   * @param event - The pointer down or up event from the DOM
   *
   * @description
   * Processes pointer press and release events by performing raycasting to identify
   * intersected objects and delegating the appropriate event type ("down" or "up")
   * to their interaction handlers. The method includes viewport boundary checking
   * for multi-viewport applications.
   *
   * **Event Type Detection:**
   * The method automatically determines the event type based on the DOM event:
   * - "pointerdown" events are mapped to "down" interaction events
   * - "pointerup" events are mapped to "up" interaction events
   *
   * **Viewport Validation:**
   * For "down" events, the method validates that the pointer position is within
   * the configured viewport boundaries (if specified). This ensures that interactions
   * only occur within the designated rendering region for multi-viewport applications.
   *
   * **Processing Flow:**
   * 1. Determine event type from DOM event
   * 2. Validate viewport boundaries for down events
   * 3. Perform raycasting to find intersected objects
   * 4. Process intersections in Z-order with early termination
   *
   * @remarks
   * - Viewport checking is only performed for "down" events to allow "up" events
   *   to complete interaction sequences even if the pointer moves outside the viewport
   * - The method calls preventDefault() to ensure consistent behavior across browsers
   * - Z-order processing ensures only the frontmost interactive object receives the event
   *
   * @see {@link getIntersects} - Raycasting and intersection detection
   * @see {@link checkIntersects} - Z-order processing and event delegation
   * @see {@link ViewPortUtil.isContain} - Viewport boundary validation
   */
  protected onDocumentMouseUpDown = (event: PointerEvent) => {
    let eventType: keyof ThreeMouseEventMap = "down";
    switch (event.type) {
      case "pointerdown":
        eventType = "down";
        break;
      case "pointerup":
        eventType = "up";
        break;
    }

    if (
      !ViewPortUtil.isContain(this.canvas, this.viewport, event) &&
      eventType === "down"
    ) {
      return;
    }

    event.preventDefault();
    const intersects = this.getIntersects(event);
    this.checkIntersects(intersects, eventType);
  };

  /**
   * Processes intersection results to find and activate interactive objects.
   *
   * @param intersects - Array of raycasting intersection results sorted by distance
   * @param type - The type of interaction event to process ("down", "up", "over", "out")
   *
   * @description
   * Iterates through the intersection results in Z-order (front to back) to find
   * the first interactive object and delegate the specified event type to its
   * interaction handler. Processing terminates immediately when an interactive
   * object is found, ensuring that only the frontmost object receives the event.
   *
   * **Z-Order Processing:**
   * The intersects array is provided by Three.js raycasting in distance order
   * (closest to farthest). This method processes objects from front to back,
   * stopping at the first interactive object to respect visual layering expectations.
   *
   * **Early Termination:**
   * When checkTarget() returns true (indicating an interactive object was found
   * and processed), the loop breaks to prevent background objects from receiving
   * the same event, maintaining intuitive interaction behavior.
   *
   * @remarks
   * - Empty intersection arrays are handled gracefully with early return
   * - The method delegates actual interactivity checking to checkTarget()
   * - Z-order processing ensures consistent user experience with overlapping objects
   *
   * @see {@link checkTarget} - Object interactivity validation and event processing
   * @see {@link getIntersects} - Source of intersection data
   */
  private checkIntersects(
    intersects: Intersection<Object3D>[],
    type: keyof ThreeMouseEventMap,
  ): void {
    const n: number = intersects.length;
    if (n === 0) return;

    for (let i = 0; i < n; i++) {
      const checked = this.checkTarget(intersects[i].object, type);
      if (checked) {
        break;
      }
    }
  }

  /**
   * Dispatches interaction events to the appropriate handler methods.
   *
   * @param btn - The interactive object to receive the event
   * @param type - The type of interaction event to dispatch
   *
   * @description
   * Static utility method that serves as the central event dispatcher for all
   * interactive objects. It creates the appropriate ThreeMouseEvent and delegates
   * to the correct handler method on the object's ButtonInteractionHandler.
   *
   * **Event Routing:**
   * - "down" events → onMouseDownHandler()
   * - "up" events → onMouseUpHandler()
   * - "over" events → onMouseOverHandler() (with duplicate prevention)
   * - "out" events → onMouseOutHandler() (with duplicate prevention)
   *
   * **State-Aware Processing:**
   * For "over" and "out" events, the method checks the current hover state
   * (isOver property) to prevent duplicate event processing when the same
   * event would be fired multiple times in rapid succession.
   *
   * **Event Object Creation:**
   * Uses ThreeMouseEventUtil.generate() to create properly formatted event
   * objects that include the event type, interaction handler reference, and
   * selection state (for checkbox/radio button objects).
   *
   * @remarks
   * - This static method allows consistent event dispatching from multiple entry points
   * - State checking for over/out events prevents unnecessary handler invocations
   * - The method serves as the bridge between intersection detection and interaction handling
   *
   * @see {@link ThreeMouseEventUtil.generate} - Event object creation
   * @see {@link ButtonInteractionHandler} - Target interaction handler methods
   * @see {@link ThreeMouseEvent} - Event payload structure
   *
   * @static
   */
  public static onButtonHandler(
    btn: IClickableObject3D<unknown>,
    type: keyof ThreeMouseEventMap,
  ) {
    switch (type) {
      case "down":
        btn.interactionHandler.onMouseDownHandler(
          ThreeMouseEventUtil.generate(type, btn),
        );
        return;
      case "up":
        btn.interactionHandler.onMouseUpHandler(
          ThreeMouseEventUtil.generate(type, btn),
        );
        return;
      case "over":
        if (!btn.interactionHandler.isOver) {
          btn.interactionHandler.onMouseOverHandler(
            ThreeMouseEventUtil.generate(type, btn),
          );
        }
        return;
      case "out":
        if (btn.interactionHandler.isOver) {
          btn.interactionHandler.onMouseOutHandler(
            ThreeMouseEventUtil.generate(type, btn),
          );
        }
        return;
    }
  }

  /**
   * IClickableObject3Dインターフェースを実装しているか否かを判定する。
   * ユーザー定義Type Guard
   * @param arg
   * @private
   */
  private static implementsIClickableObject3D(
    arg: unknown,
  ): arg is IClickableObject3D<unknown> {
    return (
      arg !== null &&
      typeof arg === "object" &&
      "interactionHandler" in arg &&
      arg.interactionHandler !== null &&
      typeof arg.interactionHandler === "object" &&
      "mouseEnabled" in arg.interactionHandler &&
      arg.interactionHandler.mouseEnabled !== null &&
      typeof arg.interactionHandler.mouseEnabled === "boolean"
    );
  }

  /**
   * 非推奨になったIClickableObject3Dインターフェースのmodelプロパティを実装しているか否かを判定する。
   * @param arg
   */
  private static implementsDepartedIClickableObject3D(arg: unknown): boolean {
    return (
      arg !== null &&
      typeof arg === "object" &&
      "model" in arg &&
      arg.model !== null &&
      typeof arg.model === "object"
    );
  }

  /**
   * 指定されたtargetオブジェクトから親方向に、クリッカブルインターフェースを継承しているオブジェクトを検索する。
   * オブジェクトを発見した場合はtrueを、発見できない場合はfalseを返す。
   *
   * @param target
   * @param type
   * @param hasTarget
   * @protected
   */
  protected checkTarget(
    target: Object3D | undefined | null,
    type: keyof ThreeMouseEventMap,
    hasTarget: boolean = false,
  ): boolean {
    if (MouseEventManager.implementsDepartedIClickableObject3D(target)) {
      console.warn(
        "Deprecated: IClickableObject3D.model is deprecated. Please use IClickableObject3D.interactionHandler.",
      );
    }

    //クリッカブルインターフェースを継承しているなら判定OK
    if (
      target != null &&
      MouseEventManager.implementsIClickableObject3D(target) &&
      target.interactionHandler.mouseEnabled
    ) {
      if (type === "over") {
        this.currentOver.push(target);
      }
      MouseEventManager.onButtonHandler(target, type);
      return this.checkTarget(target.parent, type, true);
    }

    //継承していないならその親を探索継続。
    //ターゲットから上昇して探す。
    if (
      target != null &&
      target.parent != null &&
      target.parent.type !== "Scene"
    ) {
      return this.checkTarget(target.parent, type, hasTarget);
    }

    //親がシーンの場合は探索終了。
    return hasTarget;
  }

  protected getIntersects(event: PointerEvent): Intersection[] {
    ViewPortUtil.convertToMousePosition(
      this.canvas,
      event,
      this.viewport,
      this.mouse,
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(
      this.targets,
      this.recursive,
    );

    //同一のオブジェクトが複数のFaceで交差した場合、最初に交差したものだけを取り出す。
    const uuidSet = new Set<string>();
    const filteredIntersects = intersects.filter((intersect) => {
      if (uuidSet.has(intersect.object.uuid)) {
        return false;
      }
      uuidSet.add(intersect.object.uuid);
      return true;
    });

    return filteredIntersects;
  }
}

/**
 * Union type representing the possible interaction states of interactive objects.
 *
 * @description
 * Defines the visual and behavioral states that interactive objects can have.
 * These states are used by StateMaterialSet to determine which material to display
 * and by interaction handlers to manage behavior transitions.
 *
 * **State Definitions:**
 * - `normal`: Default resting state when no interaction is occurring
 * - `over`: Pointer is hovering over the object (mouse over, touch proximity)
 * - `down`: Pointer is currently pressed down on the object
 * - `disable`: Object is disabled and non-interactive
 *
 * **Usage in Material Management:**
 * These states are combined with selection flags (for checkboxes/radio buttons)
 * to determine the final visual representation through StateMaterialSet.
 *
 * @example
 * ```typescript
 * // State transitions in ButtonInteractionHandler
 * handler.state = 'normal';  // Initial state
 * handler.state = 'over';    // On pointer enter
 * handler.state = 'down';    // On pointer press
 * handler.state = 'disable'; // When disabled
 * ```
 *
 * @see {@link StateMaterialSet} - Material management using these states
 * @see {@link ButtonInteractionHandler.state} - Current state property
 *
 * @public
 */
export type ClickableState = "normal" | "over" | "down" | "disable";

/**
 * Interface contract for objects that can respond to pointer interactions.
 *
 * @description
 * Defines the required structure for Three.js objects to become interactive
 * within the MouseEventManager system. Objects implementing this interface
 * can receive pointer events (mouse, touch, pen) and respond appropriately
 * through their associated ButtonInteractionHandler.
 *
 * **Implementation Requirements:**
 * Objects must provide an `interactionHandler` property that implements
 * ButtonInteractionHandler. This handler manages the object's interaction
 * behavior, state transitions, and event emission.
 *
 * **Detection Mechanism:**
 * MouseEventManager uses this interface to identify interactive objects
 * during raycasting. Objects are validated using a type guard that checks
 * for the presence and structure of the interactionHandler property.
 *
 * @template Value - Type of custom data associated with the interactive object.
 *                   Used for identifying specific objects in event handlers.
 *
 * @example
 * ```typescript
 * import { ButtonInteractionHandler } from '@masatomakino/threejs-interactive-object';
 * import { Mesh, BoxGeometry, MeshBasicMaterial } from 'three';
 *
 * // Creating an interactive object by implementing the interface
 * class MyInteractiveMesh extends Mesh implements IClickableObject3D<string> {
 *   public readonly interactionHandler: ButtonInteractionHandler<string>;
 *
 *   constructor() {
 *     super(new BoxGeometry(1, 1, 1), new MeshBasicMaterial());
 *     this.interactionHandler = new ButtonInteractionHandler({ view: this });
 *     this.interactionHandler.value = 'my-custom-button';
 *   }
 * }
 *
 * // Using with existing objects via composition
 * const mesh = new Mesh(geometry, material);
 * const handler = new ButtonInteractionHandler({ view: mesh });
 * (mesh as IClickableObject3D<number>).interactionHandler = handler;
 * handler.value = 42;
 * ```
 *
 * @remarks
 * - The interface is designed for composition rather than inheritance
 * - Most implementations use the provided ClickableMesh, ClickableSprite, or conversion utilities
 * - The Value type parameter enables type-safe custom data association
 * - MouseEventManager validates objects using implementsIClickableObject3D() type guard
 *
 * @see {@link ButtonInteractionHandler} - Required interaction handler implementation
 * @see {@link ClickableMesh} - Ready-to-use Mesh implementation
 * @see {@link convertToClickableMesh} - Utility for converting existing Mesh objects
 * @see {@link MouseEventManager.implementsIClickableObject3D} - Type guard for validation
 *
 * @public
 */
export interface IClickableObject3D<Value> {
  /**
   * The interaction handler that manages this object's pointer event responses.
   *
   * @description
   * This handler is responsible for processing pointer events, managing interaction
   * states, updating visual materials, and emitting appropriate events. It serves
   * as the bridge between the MouseEventManager's event detection and the object's
   * behavioral responses.
   */
  interactionHandler: ButtonInteractionHandler<Value>;
}
