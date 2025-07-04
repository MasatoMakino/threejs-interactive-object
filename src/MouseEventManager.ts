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
   * Constructor for MouseEventManager.
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
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  protected clearOver(): void {
    this.currentOver?.forEach((over) => {
      MouseEventManager.onButtonHandler(over, "out");
    });
    this.currentOver = [];
  }

  /**
   * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
   * マウス座標から対象となるObject3Dを探し出して操作を行う。
   * @param {MouseEvent} event
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
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * 重なり合ったオブジェクトがある場合、最前面から検索を開始する。
   * 操作対象が見つかった時点で処理は中断され、背面オブジェクトは操作対象にならない。
   *
   * @param {Intersection[]} intersects
   * @param {keyof ThreeMouseEventMap} type
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
   * ボタンの各種イベントハンドラーメソッドを、typeにしたがって実行する。
   * @param {IClickableObject3D} btn
   * @param {keyof ThreeMouseEventMap} type
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
export interface IClickableObject3D<Value> {
  interactionHandler: ButtonInteractionHandler<Value>;
}
