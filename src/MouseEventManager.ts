/**
 * @fileoverview Central event management system for pointer-interactive Three.js objects.
 *
 * This module provides the core MouseEventManager class, the central event dispatcher
 * for handling pointer interactions (mouse, touch, pen) within Three.js scenes.
 * The system uses raycasting for precise object detection with performance optimizations
 * including 33ms throttling and intelligent object filtering.
 *
 * **Key Features:**
 * - Unified pointer interaction handling (mouse, touch, pen)
 * - Raycasting-based intersection detection with Z-order processing
 * - Performance-optimized with RAFTicker-based throttling (33ms default)
 * - Flexible target selection (scene-wide scanning vs. registered objects)
 * - Multi-viewport support compatible with WebGLRenderer.setViewport()
 * - Parent hierarchy traversal for nested interactive objects
 * - Robust touch handling with pointercancel/pointerleave cleanup for real-device compatibility
 *
 * **Architecture:**
 * The MouseEventManager acts as a bridge between DOM pointer events and Three.js
 * object interactions. It identifies interactive objects through the IClickableObject3D
 * interface and delegates event processing to their associated ButtonInteractionHandler
 * instances.
 *
 * **Performance Considerations:**
 * Performance-optimized with configurable throttling and target filtering.
 *
 * @see {@link MouseEventManager} - Detailed performance optimization information
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
 * providing unified pointer interaction handling across mouse, touch, and pen input devices. It uses
 * raycasting to detect object intersections and manages event distribution to interactive objects
 * through a performance-optimized pipeline.
 *
 * The manager listens to DOM pointer events, performs raycasting to identify intersected objects,
 * traverses parent hierarchies to find IClickableObject3D implementations, and delegates events
 * to appropriate ButtonInteractionHandler instances.
 *
 * **Performance Optimizations:**
 * - **Throttling**: RAFTicker-based throttling prevents excessive raycasting (33ms default)
 * - **Target Filtering**: Configurable target arrays limit intersection testing scope
 * - **Recursive Control**: Hierarchy traversal can be disabled for pre-registered objects
 *
 * **Multi-Viewport Support:**
 * Compatible with Three.js WebGLRenderer.setViewport() for applications rendering
 * multiple scenes or cameras to different canvas regions. The manager determines
 * the corresponding viewport for each pointer event and processes only relevant objects.
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
 * - Parent hierarchy traversal allows nested objects to inherit interactivity
 * - Deprecated IClickableObject3D.model interface usage triggers console warnings
 *
 * @see {@link ButtonInteractionHandler} - Individual object interaction management
 * @see {@link IClickableObject3D} - Interface contract for interactive objects
 * @see {@link ThreeMouseEvent} - Event payload structure
 * @see {@link ViewPortUtil} - Coordinate transformation utilities
 * @see {@link checkIntersects} - Z-order intersection processing and early termination
 *
 * @public
 */
export class MouseEventManager {
  protected camera: Camera;
  protected scene: Scene;

  protected canvas: HTMLCanvasElement;

  protected raycaster: Raycaster = new Raycaster();
  protected mouse: Vector2 = new Vector2();

  protected currentOver: Map<number, IClickableObject3D<unknown>[]> = new Map();

  protected hasThrottled: Set<number> = new Set();
  public throttlingTime_ms: number;
  protected throttlingDelta: number = 0;
  protected viewport?: Vector4;
  protected recursive: boolean;
  protected targets: Object3D[];
  private _disposed: boolean = false;

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
   * @param option.recursive - Whether to recursively search object hierarchies during raycasting (default: true)
   *
   * @description
   * Initializes the interaction management system by setting up pointer event listeners
   * and registering with RAFTicker for throttled updates. The manager immediately begins
   * processing pointer interactions according to the specified configuration.
   *
   * **Configuration Guidelines:**
   * - Use shorter `throttlingTime_ms` (16ms) for responsive interactions at cost of performance
   * - Set `recursive: false` when using pre-registered `targets` array for optimization
   * - Specify `viewport` for applications using WebGLRenderer.setViewport()
   * - Limit `targets` to known interactive objects to reduce intersection testing overhead
   *
   * **Recursive Flag Behavior:**
   * The `recursive` parameter is passed directly to Three.js Raycaster.intersectObjects() and only
   * affects raycasting intersection detection. It does NOT affect the parent hierarchy traversal
   * performed by checkTarget(). This means:
   *
   * - `recursive: true` (default): Raycaster tests all descendants of target objects
   * - `recursive: false`: Raycaster tests only the direct target objects specified
   * - **Important**: Even with `recursive: false`, if a child object is hit during raycasting,
   *   checkTarget() will still traverse upward to find parent ClickableGroup objects
   * - **Limitation**: When using a custom `targets` array with `recursive: false`, child objects
   *   not in the targets array will not be detected by raycasting, preventing parent ClickableGroups
   *   from receiving events even if they would be found during hierarchy traversal
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
   * - The manager does not automatically remove event listeners; call dispose() when no longer needed
   * - Canvas should be properly sized before creating the manager for accurate coordinate conversion
   *
   * @see {@link dispose} - Cleanup method to prevent memory leaks
   * @see {@link onDocumentMouseUpDown} - Viewport boundary validation implementation
   * @see {@link ViewPortUtil.isContain} - Viewport containment checking logic
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
    canvas.addEventListener(
      "pointercancel",
      this.onDocumentPointerCancel,
      false,
    );
    canvas.addEventListener("pointerleave", this.onDocumentPointerLeave, false);

    RAFTicker.on("tick", this.onTick);
  }

  /**
   * RAF ticker callback that manages throttling state for pointer interaction processing.
   *
   * @param e - RAF ticker event context containing frame timing information
   *
   * @description
   * This method is called on every animation frame to manage the throttling mechanism
   * that prevents excessive raycasting during rapid pointer movements. It implements
   * early-exit rules for disabled throttling and abnormal delta values, then accumulates
   * frame delta time and resets the throttling flag when enough time has passed.
   *
   * **Throttling Logic:**
   * 1. **Throttling disabled**: When throttlingTime_ms <= 0, hasThrottled is reset each frame and throttlingDelta cleared
   * 2. **Non-finite delta**: If delta is NaN/±Infinity, throttle state is reset and the frame is ignored
   * 3. Accumulate delta time from animation frames using Math.max protection
   * 4. Reset hasThrottled flag when throttling interval expires
   * 5. Use modulo operation to maintain accurate timing across intervals
   *
   * **Delta Time Safety:**
   * The method implements multi-layered protection against invalid delta values:
   * - Non-finite values (NaN, ±Infinity) trigger immediate state reset and early return
   * - Finite negative values are clamped to 0 using Math.max(e.delta, 0)
   * - This ensures robust operation even with abnormal timing data from RAF ticker
   *
   * @remarks
   * - This callback is registered with RAFTicker during constructor initialization
   * - The throttling interval is configurable via throttlingTime_ms (default: 33ms)
   * - Early-exit optimizations improve performance when throttling is disabled
   * - Non-finite value sanitization prevents NaN propagation and state corruption
   * - Modulo operation prevents accumulated timing drift over long sessions
   *
   * @see {@link throttlingTime_ms} - Configurable throttling interval
   * @see {@link hasThrottled} - Flag controlling event processing
   *
   * @private
   */
  private onTick = (e: RAFTickerEventContext) => {
    // When throttling is disabled, always reset throttling state immediately
    if (this.throttlingTime_ms <= 0) {
      this.hasThrottled.clear();
      this.throttlingDelta = 0;
      return;
    }

    // Sanitize non-finite input deltas immediately
    if (!Number.isFinite(e.delta)) {
      this.hasThrottled.clear();
      this.throttlingDelta = 0;
      return;
    }

    this.throttlingDelta += Math.max(e.delta, 0); // Ensure delta time is never negative by setting 0 for values below 0

    if (this.throttlingDelta < this.throttlingTime_ms) {
      return;
    }

    this.hasThrottled.clear();
    this.throttlingDelta %= this.throttlingTime_ms;
  };

  /**
   * Handles pointer move events with throttling and over/out state management.
   *
   * @param event - The pointer move event from the DOM
   *
   * @description
   * Processes pointer movement by performing raycasting to detect object intersections
   * and managing hover state transitions. The method implements conditional throttling
   * to prevent excessive raycasting during rapid pointer movements, which significantly
   * improves performance in complex scenes.
   *
   * **Throttling Behavior:**
   * - When throttlingTime_ms > 0: Applies throttling with hasThrottled flag management
   * - When throttlingTime_ms <= 0: Bypasses throttling entirely for immediate processing
   *
   * The method checks throttling status (if enabled), performs raycasting, processes
   * intersections in Z-order, updates hover targets, and emits "out"/"over" events as needed.
   *
   * The method maintains a currentOver array to track hovered objects and compares
   * new intersection results with the previous state to determine event needs.
   *
   * @remarks
   * - Throttling is controlled by the throttlingTime_ms constructor parameter
   * - When throttling is disabled (throttlingTime_ms <= 0), events are processed immediately
   * - Early termination occurs when the first interactive object is found in Z-order
   * - The method calls preventDefault() to ensure consistent behavior across browsers
   * - Empty intersection results trigger clearOver() to reset all hover states
   *
   * @see {@link getIntersects} - Raycasting and intersection detection
   * @see {@link checkTarget} - Object interactivity validation and event dispatch
   * @see {@link clearOver} - Hover state cleanup
   * @see {@link onTick} - RAF ticker callback that manages throttling state
   */
  protected onDocumentMouseMove = (event: PointerEvent) => {
    const pointerId = event.pointerId;

    // Skip throttling checks when throttling is disabled
    if (this.throttlingTime_ms > 0) {
      if (this.hasThrottled.has(pointerId)) return;
      this.hasThrottled.add(pointerId);
    }

    event.preventDefault();
    const intersects = this.getIntersects(event);
    if (intersects.length === 0) {
      this.clearOver(pointerId);
      return;
    }

    const beforeOver = this.currentOver.get(pointerId) || [];
    this.currentOver.set(pointerId, []);

    for (const intersect of intersects) {
      const checked = this.checkTarget(intersect.object, "over", pointerId);
      if (checked) break;
    }

    beforeOver.forEach((btn) => {
      const currentPointerOver = this.currentOver.get(pointerId) || [];
      if (!currentPointerOver.includes(btn)) {
        MouseEventManager.onButtonHandler(btn, "out", pointerId);
      }
    });
  };

  /**
   * Clears hover states for a specific pointer or all pointers.
   *
   * @param pointerId - The ID of the pointer to clear hover state for.
   *                    If undefined, clears hover states for ALL pointers.
   *
   * @description
   * Resets hover state by emitting "out" events for objects currently tracked
   * in the currentOver Map. When pointerId is specified, only that pointer's
   * hover state is cleared. When undefined, ALL pointer states are cleared
   * (useful for cleanup scenarios like dispose or scene changes).
   *
   * @remarks
   * This method ensures proper cleanup of hover states to prevent objects
   * from remaining in an incorrect "over" state when they should return to "normal".
   * The all-pointers clearing mode (undefined pointerId) maintains backward
   * compatibility with single-pointer implementations.
   */
  protected clearOver(pointerId?: number): void {
    if (pointerId !== undefined) {
      // Clear specific pointerId only
      const pointerOver = this.currentOver.get(pointerId) || [];
      pointerOver.forEach((over) => {
        MouseEventManager.onButtonHandler(over, "out", pointerId);
      });
      this.currentOver.delete(pointerId);
    } else {
      // Clear all pointers (backward compatibility)
      this.currentOver.forEach((overArray, pId) => {
        overArray.forEach((over) => {
          MouseEventManager.onButtonHandler(over, "out", pId);
        });
      });
      this.currentOver.clear();
    }
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
   * The method maps "pointerdown" to "down" and "pointerup" to "up" interaction events.
   *
   * For "down" events, validates pointer position within configured viewport boundaries
   * to ensure interactions only occur within the designated rendering region.
   *
   * The method determines event type, validates viewport boundaries for down events,
   * performs raycasting, and processes intersections in Z-order with early termination.
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
    const pointerId = event.pointerId;

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
    this.checkIntersects(intersects, eventType, pointerId);
  };

  /**
   * Cleans up pointer state by sending out events and removing internal tracking.
   *
   * @param pointerId - The pointer identifier to clean up
   *
   * @description
   * Common cleanup logic for pointer interruption events (cancel/leave).
   * Performs the following operations:
   * 1. Retrieves all objects currently tracked as "over" for the specified pointer
   * 2. Sends "out" events to each tracked object via ButtonInteractionHandler
   * 3. Removes the pointer from internal state tracking (currentOver Map)
   *
   * This ensures visual states return to "normal" and prevents stuck hover states
   * when pointers disappear without proper move/out event sequences.
   *
   * @motivation Real-device testing revealed touch pointers can disappear without
   *             standard event sequences, causing stuck visual states. This method
   *             provides reliable cleanup for browser-generated interruption events.
   *
   * @internal
   */
  private cleanupPointerState(pointerId: number): void {
    const overObjects = this.currentOver.get(pointerId);
    if (overObjects && overObjects.length > 0) {
      overObjects.forEach((obj) => {
        MouseEventManager.onButtonHandler(obj, "out", pointerId);
      });
    }
    this.currentOver.delete(pointerId);
  }

  /**
   * Handles pointer cancel events for interrupted touch interactions.
   *
   * @param event - The pointer cancel event containing the interrupted pointerId
   *
   * @description
   * Processes pointercancel events by preventing default behavior and delegating
   * cleanup to the common cleanup method.
   *
   * **Browser Event Sequence**: pointercancel → pointerout → pointerleave
   * **Mutual Exclusivity**: pointercancel and pointerup never both occur
   * **Timing**: preventDefault() called to maintain consistent behavior
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/pointercancel_event
   * @see {@link cleanupPointerState} - Common cleanup implementation
   */
  protected onDocumentPointerCancel = (event: PointerEvent) => {
    event.preventDefault();
    this.cleanupPointerState(event.pointerId);
  };

  /**
   * Handles browser-generated pointerleave events for reliable cleanup.
   *
   * @param event - The pointerleave event from browser
   *
   * @description
   * Processes pointerleave events by delegating cleanup to the common cleanup method.
   *
   * **Why pointerleave is optimal**:
   * - Always fires after UP events (no click interference)
   * - Indicates complete departure from element hierarchy
   * - Reliable browser-generated event with stable execution order
   * - Handles edge case: outside → move into button → up inside button
   *
   * @see {@link cleanupPointerState} - Common cleanup implementation
   */
  protected onDocumentPointerLeave = (event: PointerEvent) => {
    this.cleanupPointerState(event.pointerId);
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
   * Processes intersections in Z-order (closest to farthest) and stops at the first
   * interactive object to prevent background objects from receiving the same event.
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
    pointerId: number = 1,
  ): void {
    const n: number = intersects.length;
    if (n === 0) return;

    for (let i = 0; i < n; i++) {
      const checked = this.checkTarget(intersects[i].object, type, pointerId);
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
    pointerId: number = 1,
  ) {
    switch (type) {
      case "down":
        btn.interactionHandler.onMouseDownHandler(
          ThreeMouseEventUtil.generate(type, btn, pointerId),
        );
        return;
      case "up":
        btn.interactionHandler.onMouseUpHandler(
          ThreeMouseEventUtil.generate(type, btn, pointerId),
        );
        return;
      case "over":
        if (!btn.interactionHandler.isOver) {
          btn.interactionHandler.onMouseOverHandler(
            ThreeMouseEventUtil.generate(type, btn, pointerId),
          );
        }
        return;
      case "out":
        if (btn.interactionHandler.isOver) {
          btn.interactionHandler.onMouseOutHandler(
            ThreeMouseEventUtil.generate(type, btn, pointerId),
          );
        }
        return;
    }
  }

  /**
   * Type guard that validates whether an object implements the IClickableObject3D interface.
   *
   * @param arg - The object to test for IClickableObject3D interface compliance
   * @returns True if the object implements IClickableObject3D, false otherwise
   *
   * @description
   * Performs runtime validation to determine if an object conforms to the IClickableObject3D
   * interface structure. Validates the presence and type of required properties including
   * the interactionHandler and its mouseEnabled property.
   *
   * @remarks
   * Used internally by checkTarget() during object hierarchy traversal to identify
   * interactive objects among regular Three.js display objects.
   *
   * @see {@link IClickableObject3D} - Interface definition
   * @see {@link checkTarget} - Primary usage location
   *
   * @static
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
   * Detects objects using the deprecated IClickableObject3D.model interface.
   *
   * @param arg - The object to test for deprecated interface usage
   * @returns True if the object uses the deprecated model property, false otherwise
   *
   * @description
   * Identifies objects still using the legacy IClickableObject3D.model interface
   * to trigger deprecation warnings. Used by checkTarget() to maintain backward
   * compatibility while encouraging migration to the current interactionHandler pattern.
   *
   * @remarks
   * This detection enables graceful deprecation warnings without breaking existing code.
   *
   * @see {@link checkTarget} - Primary usage location for deprecation warnings
   *
   * @static
   * @private
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
   * Searches for interactive objects by traversing up the parent hierarchy from a target object.
   *
   * @param target - The Three.js Object3D to start searching from (may be null/undefined)
   * @param type - The type of interaction event to process ("down", "up", "over", "out")
   * @param hasTarget - Whether any interactive target has been found in the current search chain
   * @returns True if an interactive object was found and processed, false otherwise
   *
   * @description
   * Performs upward traversal through the Three.js object hierarchy to locate objects
   * implementing the IClickableObject3D interface. When an interactive object is found,
   * it processes the specified event type and may continue searching parent objects
   * for additional interactive targets.
   *
   * **Hierarchy Traversal Process:**
   * 1. Check for deprecated interface usage and emit warnings
   * 2. Validate if current object implements IClickableObject3D interface
   * 3. If interactive and enabled, process the event and continue to parent
   * 4. If not interactive, continue searching up the parent chain
   * 5. Stop when reaching Scene level or null parent
   *
   * **Independence from Raycasting Recursive Flag:**
   * This hierarchy traversal operates independently of the constructor's `recursive` flag.
   * Even when `recursive: false` is set for raycasting optimization, this method will
   * still traverse upward to find parent ClickableGroup objects once an initial
   * intersection is detected.
   *
   * **Event Processing:**
   * When an interactive object is found, the method delegates to onButtonHandler()
   * for actual event processing. For "over" events, it also maintains the currentOver
   * array to track hover state across multiple objects.
   *
   * **Recursive Search:**
   * The method can find multiple interactive objects in a single parent chain,
   * allowing nested interactive elements where both child and parent respond
   * to the same pointer event.
   *
   * @remarks
   * - Supports nested interactive objects within the same hierarchy
   * - Emits deprecation warnings for legacy interface usage
   * - Stops traversal at Scene level to prevent unnecessary searches
   * - The hasTarget parameter tracks whether any target was found across the chain
   *
   * @see {@link implementsIClickableObject3D} - Interface validation
   * @see {@link implementsDepartedIClickableObject3D} - Deprecated interface detection
   * @see {@link onButtonHandler} - Event processing delegation
   * @see {@link currentOver} - Hover state tracking array
   *
   * @protected
   */
  protected checkTarget(
    target: Object3D | undefined | null,
    type: keyof ThreeMouseEventMap,
    pointerId: number = 1,
    hasTarget: boolean = false,
  ): boolean {
    if (MouseEventManager.implementsDepartedIClickableObject3D(target)) {
      console.warn(
        "Deprecated: IClickableObject3D.model is deprecated. Please use IClickableObject3D.interactionHandler.",
      );
    }

    // If the object implements the clickable interface, validation OK
    if (
      target != null &&
      MouseEventManager.implementsIClickableObject3D(target) &&
      target.interactionHandler.mouseEnabled
    ) {
      if (type === "over") {
        const currentPointerOver = this.currentOver.get(pointerId) || [];
        currentPointerOver.push(target);
        this.currentOver.set(pointerId, currentPointerOver);
      }
      MouseEventManager.onButtonHandler(target, type, pointerId);
      return this.checkTarget(target.parent, type, pointerId, true);
    }

    // If not implementing the interface, continue searching the parent.
    // Search upward from the target.
    if (
      target != null &&
      target.parent != null &&
      target.parent.type !== "Scene"
    ) {
      return this.checkTarget(target.parent, type, pointerId, hasTarget);
    }

    // End search when parent is Scene.
    return hasTarget;
  }

  /**
   * Performs raycasting to detect object intersections and filters duplicate results.
   *
   * @param event - The pointer event containing screen coordinates
   * @returns Array of intersection results filtered by unique Object3D instances
   *
   * @description
   * Wraps Three.js raycasting functionality to detect objects intersected by the pointer.
   * Converts screen coordinates to normalized device coordinates, performs raycasting
   * against configured targets, and filters results to prevent duplicate detections
   * from multi-face geometry intersections.
   *
   * **Processing Steps:**
   * 1. Convert pointer coordinates to normalized device coordinates using ViewPortUtil
   * 2. Configure raycaster with camera and normalized coordinates
   * 3. Perform intersection testing against target objects
   * 4. Filter results by Object3D UUID to eliminate duplicate face intersections
   *
   * **Duplicate Filtering:**
   * Single Mesh objects with complex geometry can generate multiple intersection
   * results when the ray hits multiple faces. UUID-based filtering ensures each
   * Object3D appears only once in the results, using the closest intersection.
   *
   * @remarks
   * - Uses the configured targets array and recursive flag from constructor options
   * - The recursive flag is passed directly to Three.js Raycaster.intersectObjects()
   * - Filtering preserves Z-order (closest to farthest) for proper event processing
   * - ViewPortUtil handles multi-viewport coordinate transformations when applicable
   *
   * @see {@link ViewPortUtil.convertToMousePosition} - Coordinate conversion
   * @see {@link targets} - Configured objects for intersection testing
   * @see {@link recursive} - Hierarchy traversal flag
   *
   * @protected
   */
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

    // When the same object intersects multiple faces, extract only the first intersection
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

  /**
   * Cleans up DOM event listeners and RAF ticker subscriptions.
   *
   * @description
   * Removes all event listeners attached to the canvas element and unsubscribes from
   * RAFTicker to prevent memory leaks. Call this method when the MouseEventManager
   * is no longer needed, especially in long-running applications that recreate
   * managers (e.g., during scene rebuilds).
   *
   * The method performs comprehensive cleanup by:
   * - Clearing current hover state to emit proper "out" events
   * - Removing all three pointer event listeners from the canvas
   * - Unsubscribing from RAFTicker to stop throttling callbacks
   * - Resetting internal throttling state
   *
   * @remarks
   * - After calling dispose(), the manager will no longer respond to pointer events
   * - The manager cannot be reused after disposal; create a new instance if needed
   * - Failure to call dispose() may result in memory leaks in long-lived applications
   * - This method is safe to call multiple times
   *
   * @example
   * ```typescript
   * // Clean up before recreating the manager
   * manager.dispose();
   * manager = new MouseEventManager(newScene, newCamera, canvas);
   *
   * // In a React component unmount
   * useEffect(() => {
   *   const manager = new MouseEventManager(scene, camera, canvas);
   *   return () => manager.dispose(); // Cleanup on unmount
   * }, []);
   *
   * // When switching scenes
   * oldManager.dispose();
   * const newManager = new MouseEventManager(newScene, newCamera, canvas);
   * ```
   *
   * @see {@link constructor} - Initial setup of listeners and subscriptions
   * @see {@link clearOver} - Hover state cleanup method used internally
   *
   * @public
   */
  public dispose(): void {
    // Idempotent behavior: prevent multiple cleanup operations
    if (this._disposed) return;
    this._disposed = true;

    // Clear current hover state to emit proper "out" events
    this.clearOver();

    // Remove DOM event listeners
    this.canvas.removeEventListener(
      "pointermove",
      this.onDocumentMouseMove,
      false,
    );
    this.canvas.removeEventListener(
      "pointerdown",
      this.onDocumentMouseUpDown,
      false,
    );
    this.canvas.removeEventListener(
      "pointerup",
      this.onDocumentMouseUpDown,
      false,
    );
    this.canvas.removeEventListener(
      "pointercancel",
      this.onDocumentPointerCancel,
      false,
    );
    this.canvas.removeEventListener(
      "pointerleave",
      this.onDocumentPointerLeave,
      false,
    );

    // Unsubscribe from RAF ticker
    RAFTicker.off("tick", this.onTick);

    // Reset internal state
    this.hasThrottled.clear();
    this.throttlingDelta = 0;
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
