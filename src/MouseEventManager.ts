import {
  Object3D,
  Raycaster,
  Vector2,
  Camera,
  Renderer,
  Scene,
  Intersection,
  EventDispatcher
} from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { StateMaterialSet } from "./StateMaterial";

export class MouseEventManager {
  protected static camera: Camera;
  protected static renderer: Renderer;
  protected static scene: Scene;

  protected static canvas: HTMLCanvasElement;

  protected static raycaster: Raycaster = new Raycaster();
  protected static mouse: Vector2 = new Vector2();

  protected static currentOver: IClickableObject3D | null;

  public static isInit: boolean = false;

  public static init(scene: Scene, camera: Camera, renderer: Renderer): void {
    MouseEventManager.isInit = true;
    MouseEventManager.camera = camera;
    MouseEventManager.renderer = renderer;
    MouseEventManager.scene = scene;

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
  }

  protected static onDocumentMouseMove = (event: any) => {
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
        btn.onMouseDownHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.UP:
        btn.onMouseUpHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.OVER:
        btn.onMouseOverHandler(new ThreeMouseEvent(type, btn));
        return;
      case ThreeMouseEventType.OUT:
        btn.onMouseOutHandler(new ThreeMouseEvent(type, btn));
        return;
    }
  }

  protected static checkTarget(target: Object3D): any {
    //EdgeHelper / WireframeHelperは無視。
    if (target.type === "LineSegments") {
      return null;
    }
    //クリッカブルインターフェースを継承しているなら判定OK
    const targetAny = <any>target;
    if (
      targetAny.onMouseDownHandler !== undefined &&
      targetAny.getEnable() === true
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
    mouse.x = (event.layerX / MouseEventManager.canvas.clientWidth) * 2 - 1;
    mouse.y = -(event.layerY / MouseEventManager.canvas.clientHeight) * 2 + 1;
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
  readonly isPress: boolean;
  readonly state: ClickableState;
  materialSet: StateMaterialSet;

  onMouseDownHandler(event: ThreeMouseEvent): void;
  onMouseUpHandler(event: ThreeMouseEvent): void;
  onMouseOverHandler(event: ThreeMouseEvent): void;
  onMouseOutHandler(event: ThreeMouseEvent): void;
  onMouseClick(): void;

  enable(): void;
  disable(): void;
  switchEnable(bool: boolean): void;
  getEnable(): boolean;
}

/**
 * チェックボックス用インターフェース
 */
export interface ISelectableObject3D extends IClickableObject3D {
  selection: boolean;
  value: any;
}

/**
 * ラジオボタン用インターフェース
 * 選択済みのボタンは再選択して解除できないよう
 * 動作を停止するisFrozenフラグを持つ
 */
export interface IRadioButtonObject3D extends ISelectableObject3D {
  isFrozen: boolean;
}
