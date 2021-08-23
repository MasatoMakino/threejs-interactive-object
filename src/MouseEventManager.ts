import { RAFTicker, RAFTickerEvent, RAFTickerEventType } from "raf-ticker";
import {
  Camera,
  EventDispatcher,
  Intersection,
  Object3D,
  Raycaster,
  Renderer,
  Scene,
  Vector2,
} from "three";
import { ClickableObject } from "./ClickableObject";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";

export class MouseEventManager {
  protected camera: Camera;
  protected renderer: Renderer;
  protected scene: Scene;

  protected canvas: HTMLCanvasElement;

  protected raycaster: Raycaster = new Raycaster();
  protected mouse: Vector2 = new Vector2();

  protected currentOver: IClickableObject3D[] | null;

  protected hasThrottled: boolean = false;
  public throttlingTime_ms: number;
  protected throttlingDelta: number = 0;

  constructor(
    scene: Scene,
    camera: Camera,
    renderer: Renderer,
    option?: { throttlingTime_ms?: number }
  ) {
    this.camera = camera;
    this.renderer = renderer;
    this.scene = scene;

    this.throttlingTime_ms = option?.throttlingTime_ms ?? 33;

    const canvas = renderer.domElement;
    this.canvas = canvas;

    canvas.addEventListener("mousemove", this.onDocumentMouseMove, false);
    canvas.addEventListener("mousedown", this.onDocumentMouseUpDown, false);
    canvas.addEventListener("mouseup", this.onDocumentMouseUpDown, false);

    RAFTicker.on(RAFTickerEventType.tick, this.onTick);
  }

  private onTick = (e: RAFTickerEvent) => {
    this.throttlingDelta += e.delta;
    if (this.throttlingDelta < this.throttlingTime_ms) {
      return;
    }
    this.hasThrottled = false;
    this.throttlingDelta %= this.throttlingTime_ms;
  };

  protected onDocumentMouseMove = (event: any) => {
    if (this.hasThrottled) return;
    this.hasThrottled = true;

    if (event.type === "mousemove") {
      event.preventDefault();
    }
    const intersects = this.getIntersects(event);

    const n: number = intersects.length;
    if (n === 0) {
      this.clearOver();
      return;
    }

    const beforeOver = this.currentOver;
    this.currentOver = [];

    for (let intersect of intersects) {
      const checked = this.checkTarget(
        intersect.object,
        ThreeMouseEventType.OVER
      );
      if (checked) break;
    }

    beforeOver?.forEach((btn) => {
      if (!this.currentOver.includes(btn)) {
        MouseEventManager.onButtonHandler(btn, ThreeMouseEventType.OUT);
      }
    });
  };

  /**
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  protected clearOver(): void {
    this.currentOver?.forEach((over) => {
      MouseEventManager.onButtonHandler(over, ThreeMouseEventType.OUT);
    });
    this.currentOver = null;
  }

  /**
   * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
   * マウス座標から対象となるObject3Dを探し出して操作を行う。
   * @param {MouseEvent} event
   */
  protected onDocumentMouseUpDown = (event: MouseEvent) => {
    let eventType: ThreeMouseEventType = ThreeMouseEventType.DOWN;
    switch (event.type) {
      case "mousedown":
        eventType = ThreeMouseEventType.DOWN;
        break;
      case "mouseup":
        eventType = ThreeMouseEventType.UP;
        break;
    }
    event.preventDefault();
    const intersects = this.getIntersects(event);
    this.checkIntersects(intersects, eventType);
  };

  /**
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * @param {Intersection[]} intersects
   * @param {ThreeMouseEventType} type
   */
  private checkIntersects(
    intersects: Intersection[],
    type: ThreeMouseEventType
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
   * ボタンの各種イベントハンドラーメソッドを、typeにしたがって実行する。
   * @param {IClickableObject3D} btn
   * @param {ThreeMouseEventType} type
   */
  public static onButtonHandler(btn: IClickableObject3D, type: ThreeMouseEventType) {
    switch (type) {
      case ThreeMouseEventType.DOWN:
        btn.model.onMouseDownHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.UP:
        btn.model.onMouseUpHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.OVER:
        if (!btn.model.isOver) {
          btn.model.onMouseOverHandler(new ThreeMouseEvent(type, btn));
        }
        return;
      case ThreeMouseEventType.OUT:
        if (btn.model.isOver) {
          btn.model.onMouseOutHandler(new ThreeMouseEvent(type, btn));
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
    arg: any
  ): arg is IClickableObject3D {
    return (
      arg !== null &&
      typeof arg === "object" &&
      arg.model !== null &&
      typeof arg.model === "object" &&
      arg.model.mouseEnabled !== null &&
      typeof arg.model.mouseEnabled === "boolean"
    );
  }

  protected checkTarget(
    target: Object3D,
    type: ThreeMouseEventType,
    hasTarget: boolean = false
  ): boolean {
    //クリッカブルインターフェースを継承しているなら判定OK
    if (
      MouseEventManager.implementsIClickableObject3D(target) &&
      target.model.mouseEnabled === true
    ) {
      if (type === ThreeMouseEventType.OVER) {
        this.currentOver.push(target);
      }
      MouseEventManager.onButtonHandler(target, type);
      return this.checkTarget(target.parent, type, true);
    }

    //継承していないならその親を探索継続。
    //ターゲットから上昇して探す。
    if (target.parent != null && target.parent.type !== "Scene") {
      return this.checkTarget(target.parent, type, hasTarget);
    }

    //親がシーンの場合は探索終了。
    return hasTarget;
  }

  protected static updateMouse(canvas:HTMLCanvasElement, event: MouseEvent, mouse: Vector2): Vector2 {
    mouse.x = (event.offsetX / canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
    return mouse;
  }

  protected getIntersects(event: MouseEvent): Intersection[] {
    this.mouse = MouseEventManager.updateMouse( this.canvas, event, this.mouse);
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects: Intersection[] = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );
    return intersects;
  }
}

/**
 * IClickable3DObjectの現在状態を表す定数セット。
 * これとselectフラグを掛け合わせることで状態を判定する。
 */
export enum ClickableState {
  //ボタンの状態を表す定数
  NORMAL = "normal",
  OVER = "normal_over",
  DOWN = "normal_down",
  DISABLE = "disable",
}

/**
 * マウス操作可能な3Dオブジェクトのインターフェース
 * マウス操作可能なクラスを実装する場合、このインターフェースを継承すること。
 */
export interface IClickableObject3D extends EventDispatcher {
  model: ClickableObject;
}
