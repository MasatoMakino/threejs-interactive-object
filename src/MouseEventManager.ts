import {
  Camera,
  EventDispatcher,
  Intersection,
  Object3D,
  Raycaster,
  Renderer,
  Scene,
  Vector2
} from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { ClickableObject } from "./ClickableObject";
import { CheckBoxObject } from "./CheckBoxObject";
import { RadioButtonObject } from "./RadioButtonObject";

export class MouseEventManager {
  protected static camera: Camera;
  protected static renderer: Renderer;
  protected static scene: Scene;

  protected static canvas: HTMLCanvasElement;

  protected static raycaster: Raycaster = new Raycaster();
  protected static mouse: Vector2 = new Vector2();

  protected static currentOver: IClickableObject3D | null;

  public static isInit: boolean = false;
  protected static hasThrottled: boolean = false;
  public static throttlingTime_ms: number;
  protected static throttlingDelta: number = 0;
  protected static lastRAFTime: number;

  public static init(
    scene: Scene,
    camera: Camera,
    renderer: Renderer,
    option?: { throttlingTime_ms?: number }
  ): void {
    MouseEventManager.isInit = true;
    MouseEventManager.camera = camera;
    MouseEventManager.renderer = renderer;
    MouseEventManager.scene = scene;

    MouseEventManager.throttlingTime_ms = option?.throttlingTime_ms ?? 33;

    const canvas = renderer.domElement;
    MouseEventManager.canvas = canvas;

    canvas.addEventListener(
      "mousemove",
      MouseEventManager.onDocumentMouseMove,
      false
    );
    canvas.addEventListener(
      "mousedown",
      MouseEventManager.onDocumentMouseUpDown,
      false
    );
    canvas.addEventListener(
      "mouseup",
      MouseEventManager.onDocumentMouseUpDown,
      false
    );

    const callBackRAF = timestamp => {
      if (this.lastRAFTime == null) {
        this.lastRAFTime = timestamp;
      }

      const delta = timestamp - this.lastRAFTime;
      MouseEventManager.throttlingDelta += delta;

      this.lastRAFTime = timestamp;
      requestAnimationFrame(callBackRAF);

      if (
        MouseEventManager.throttlingDelta < MouseEventManager.throttlingTime_ms
      ) {
        return;
      }
      MouseEventManager.hasThrottled = false;
      MouseEventManager.throttlingDelta %= MouseEventManager.throttlingTime_ms;
    };
    requestAnimationFrame(callBackRAF);
  }

  protected static onDocumentMouseMove = (event: any) => {
    if (MouseEventManager.hasThrottled) return;
    MouseEventManager.hasThrottled = true;

    if (event.type === "mousemove") {
      event.preventDefault();
    }
    const intersects = MouseEventManager.getIntersects(event);

    const n: number = intersects.length;
    if (n == 0) {
      MouseEventManager.clearCurrentOver();
      return;
    }

    for (let i = 0; i < n; i++) {
      let checked: IClickableObject3D = MouseEventManager.checkTarget(
        intersects[i].object
      );
      if (checked) {
        if (checked != MouseEventManager.currentOver) {
          MouseEventManager.clearCurrentOver();
          MouseEventManager.currentOver = checked;
          MouseEventManager.onButtonHandler(checked, ThreeMouseEventType.OVER);
        }
        return;
      }
    }

    MouseEventManager.clearCurrentOver();
    return;
  };

  /**
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  protected static clearCurrentOver(): void {
    if (MouseEventManager.currentOver) {
      MouseEventManager.onButtonHandler(
        MouseEventManager.currentOver,
        ThreeMouseEventType.OUT
      );
    }
    MouseEventManager.currentOver = null;
  }

  /**
   * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
   * マウス座標から対象となるObject3Dを探し出して操作を行う。
   * @param {MouseEvent} event
   */
  protected static onDocumentMouseUpDown = (event: MouseEvent) => {
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
    let intersects = MouseEventManager.getIntersects(event);
    MouseEventManager.checkIntersects(intersects, eventType);
  };

  /**
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * @param {Intersection[]} intersects
   * @param {ThreeMouseEventType} type
   */
  private static checkIntersects(
    intersects: Intersection[],
    type: ThreeMouseEventType
  ): void {
    const n: number = intersects.length;
    if (n === 0) return;

    for (let i = 0; i < n; i++) {
      const checked: IClickableObject3D = MouseEventManager.checkTarget(
        intersects[i].object
      );
      if (checked) {
        MouseEventManager.onButtonHandler(checked, type);
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
      case ThreeMouseEventType.DOWN:
        btn.model.onMouseDownHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.UP:
        btn.model.onMouseUpHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.OVER:
        btn.model.onMouseOverHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.OUT:
        btn.model.onMouseOutHandler(new ThreeMouseEvent(type, btn));
        return;
    }
  }

  protected static checkTarget(target: Object3D): any {
    // ユーザ定義タイプガード
    function implementsIClickableObject3D(arg: any): arg is IClickableObject3D {
      return (
        arg !== null &&
        typeof arg === "object" &&
        arg.model !== null &&
        typeof arg.model === "object" &&
        arg.model.getEnable !== null &&
        typeof arg.model.getEnable === "function"
      );
    }

    //EdgeHelper / WireframeHelperは無視。
    if (target.type === "LineSegments") {
      return null;
    }
    //クリッカブルインターフェースを継承しているなら判定OK
    const targetAny = <any>target;
    if (
      implementsIClickableObject3D(targetAny) &&
      targetAny.model.getEnable() === true
    ) {
      return target;
    }

    //継承していないならその親を探索継続。
    //ターゲットから上昇して探す。
    if (target.parent != null && target.parent.type !== "Scene") {
      return MouseEventManager.checkTarget(target.parent);
    }

    //親がシーンの場合は探索終了。nullを返す。
    return null;
  }

  protected static updateMouse(event: MouseEvent, mouse: Vector2): Vector2 {
    mouse.x = (event.offsetX / MouseEventManager.canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.offsetY / MouseEventManager.canvas.clientHeight) * 2 + 1;
    return mouse;
  }

  protected static getIntersects(event: MouseEvent): Intersection[] {
    MouseEventManager.mouse = MouseEventManager.updateMouse(
      event,
      MouseEventManager.mouse
    );
    MouseEventManager.raycaster.setFromCamera(
      MouseEventManager.mouse,
      MouseEventManager.camera
    );
    const intersects: Intersection[] = MouseEventManager.raycaster.intersectObjects(
      MouseEventManager.scene.children,
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
  DISABLE = "disable"
}

/**
 * マウス操作可能な3Dオブジェクトのインターフェース
 * マウス操作可能なクラスを実装する場合、このインターフェースを継承すること。
 */
export interface IClickableObject3D extends EventDispatcher {
  model: ClickableObject;
}

/**
 * チェックボックス用インターフェース
 */
export interface ISelectableObject3D extends IClickableObject3D {
  model: CheckBoxObject;
}

/**
 * ラジオボタン用インターフェース
 */
export interface IRadioButtonObject3D extends ISelectableObject3D {
  model: RadioButtonObject;
}
