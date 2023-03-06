import { RAFTicker, RAFTickerEventContext } from "@masatomakino/raf-ticker";
import {
  Camera,
  Intersection,
  Object3D,
  Raycaster,
  Scene,
  Vector2,
  Vector4,
} from "three";
import {
  ClickableObject,
  ThreeMouseEvent,
  ThreeMouseEventType,
  ThreeMouseEventUtil,
  ViewPortUtil,
} from "./";

export class MouseEventManager {
  protected camera: Camera;
  protected scene: Scene;

  protected canvas: HTMLCanvasElement;

  protected raycaster: Raycaster = new Raycaster();
  protected mouse: Vector2 = new Vector2();

  protected currentOver: IClickableObject3D[] | null;

  protected hasThrottled: boolean = false;
  public throttlingTime_ms: number;
  protected throttlingDelta: number = 0;
  protected viewport?: Vector4;
  protected recursive: boolean;
  protected targets: Object3D[];

  /**
   *
   * @param scene
   * @param camera
   * @param canvas
   * @param option
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
    }
  ) {
    this.camera = camera;
    this.scene = scene;

    this.throttlingTime_ms = option?.throttlingTime_ms ?? 33;
    this.viewport = option?.viewport;
    this.recursive = option?.recursive ?? true;
    this.targets = option?.targets ?? this.scene.children;

    this.canvas = canvas;

    canvas.addEventListener("mousemove", this.onDocumentMouseMove, false);
    canvas.addEventListener("mousedown", this.onDocumentMouseUpDown, false);
    canvas.addEventListener("mouseup", this.onDocumentMouseUpDown, false);

    RAFTicker.on("tick", this.onTick);
  }

  private onTick = (e: RAFTickerEventContext) => {
    this.throttlingDelta += e.delta;
    if (this.throttlingDelta < this.throttlingTime_ms) {
      return;
    }
    this.hasThrottled = false;
    this.throttlingDelta %= this.throttlingTime_ms;
  };

  protected onDocumentMouseMove = (event: MouseEvent) => {
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

    for (let intersect of intersects) {
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
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  protected clearOver(): void {
    this.currentOver?.forEach((over) => {
      MouseEventManager.onButtonHandler(over, "out");
    });
    this.currentOver = null;
  }

  /**
   * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
   * マウス座標から対象となるObject3Dを探し出して操作を行う。
   * @param {MouseEvent} event
   */
  protected onDocumentMouseUpDown = (event: MouseEvent) => {
    let eventType: ThreeMouseEventType = "down";
    switch (event.type) {
      case "mousedown":
        eventType = "down";
        break;
      case "mouseup":
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
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * 重なり合ったオブジェクトがある場合、最前面から検索を開始する。
   * 操作対象が見つかった時点で処理は中断され、背面オブジェクトは操作対象にならない。
   *
   * @param {Intersection[]} intersects
   * @param {ThreeMouseEventType} type
   */
  private checkIntersects(
    intersects: Intersection<Object3D>[],
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
  public static onButtonHandler(
    btn: IClickableObject3D,
    type: ThreeMouseEventType
  ) {
    switch (type) {
      case "down":
        btn.model.onMouseDownHandler(ThreeMouseEventUtil.generate(type, btn));
        return;
      case "up":
        btn.model.onMouseUpHandler(ThreeMouseEventUtil.generate(type, btn));
        return;
      case "over":
        if (!btn.model.isOver) {
          btn.model.onMouseOverHandler(ThreeMouseEventUtil.generate(type, btn));
        }
        return;
      case "out":
        if (btn.model.isOver) {
          btn.model.onMouseOutHandler(ThreeMouseEventUtil.generate(type, btn));
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
    target: Object3D | undefined,
    type: ThreeMouseEventType,
    hasTarget: boolean = false
  ): boolean {
    //クリッカブルインターフェースを継承しているなら判定OK
    if (
      MouseEventManager.implementsIClickableObject3D(target) &&
      target.model.mouseEnabled === true
    ) {
      if (type === "over") {
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

  protected getIntersects(event: MouseEvent): Intersection[] {
    ViewPortUtil.convertToMousePosition(
      this.canvas,
      event,
      this.viewport,
      this.mouse
    );
    this.raycaster.setFromCamera(this.mouse, this.camera);
    return this.raycaster.intersectObjects(this.targets, this.recursive);
  }
}

/**
 * IClickable3DObjectの現在状態を表す定数セット。
 * これとselectフラグを掛け合わせることで状態を判定する。
 */
export type ClickableState =
  //ボタンの状態を表す定数
  "normal" | "over" | "down" | "disable";

/**
 * マウス操作可能な3Dオブジェクトのインターフェース
 * マウス操作可能なクラスを実装する場合、このインターフェースを継承すること。
 */
export interface IClickableObject3D<ValueType = any> {
  model: ClickableObject<ValueType>;
}
