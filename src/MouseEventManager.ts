import {
  Object3D,
  Raycaster,
  Vector2,
  Camera,
  Renderer,
  Scene,
  Intersection
} from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";

export class MouseEventManager {
  protected static camera: Camera;
  protected static renderer: Renderer;
  protected static scene: Scene;

  protected static canvas: HTMLCanvasElement;

  protected static raycaster: Raycaster = new Raycaster();
  protected static mouse: Vector2 = new Vector2();

  protected static currentOver: IClickable3DObject | null;

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
      MouseEventManager.onDocumentMouseDown,
      false
    );
    canvas.addEventListener(
      "mouseup",
      MouseEventManager.onDocumentMouseUp,
      false
    );
  }

  protected static onDocumentMouseMove = (event: any) => {
    if (event.type === "mousemove") {
      event.preventDefault();
    }
    let intersects = MouseEventManager.getIntersects(event);

    let nonTargetFunction = () => {
      if (MouseEventManager.currentOver) {
        MouseEventManager.currentOver.onMouseOutHandler(
          new ThreeMouseEvent(
            ThreeMouseEventType.OUT,
            MouseEventManager.currentOver
          )
        );
      }
      MouseEventManager.currentOver = null;
    };

    let n: number = intersects.length;
    if (n == 0) {
      nonTargetFunction();
      return;
    }

    for (let i = 0; i < n; i++) {
      let checked: IClickable3DObject = MouseEventManager.checkTarget(
        intersects[i].object
      );
      if (checked) {
        if (checked != MouseEventManager.currentOver) {
          if (MouseEventManager.currentOver) {
            MouseEventManager.currentOver.onMouseOutHandler(
              new ThreeMouseEvent(
                ThreeMouseEventType.OUT,
                MouseEventManager.currentOver
              )
            );
          }
          MouseEventManager.currentOver = checked;
          checked.onMouseOverHandler(
            new ThreeMouseEvent(ThreeMouseEventType.OVER, checked)
          );
        }
        return;
      }
    }

    nonTargetFunction();
    return;
  };

  protected static onDocumentMouseDown = (event: MouseEvent) => {
    event.preventDefault();
    const intersects = MouseEventManager.getIntersects(event);

    const n: number = intersects.length;
    if (n == 0) return;

    for (let i = 0; i < n; i++) {
      let checked: IClickable3DObject = MouseEventManager.checkTarget(
        intersects[i].object
      );
      if (checked) {
        checked.onMouseDownHandler(
          new ThreeMouseEvent(ThreeMouseEventType.DOWN, checked)
        );
        break;
      }
    }
  };

  protected static onDocumentMouseUp = (event: MouseEvent) => {
    event.preventDefault();
    let intersects = MouseEventManager.getIntersects(event);

    let n: number = intersects.length;
    if (n == 0) return;

    for (let i = 0; i < n; i++) {
      let checked: IClickable3DObject = MouseEventManager.checkTarget(
        intersects[i].object
      );
      if (checked) {
        checked.onMouseUpHandler(
          new ThreeMouseEvent(ThreeMouseEventType.UP, checked)
        );
        break;
      }
    }
  };

  protected static checkTarget(target: Object3D): any {
    //EdgeHelper / WireframeHelperは無視。
    if (target.type === "LineSegments") {
      return null;
    }
    //クリッカブルインターフェースを継承しているなら判定
    if (
      typeof (<any>target).onMouseDownHandler !== "undefined" &&
      (<any>target).getEnable() === true
    ) {
      return target;
    } else {
      //継承していないならその親を探索。
      //ターゲットから上昇して探す。
      if (
        target.parent !== undefined &&
        target.parent !== null &&
        target.parent.type !== "Scene"
      ) {
        return MouseEventManager.checkTarget(
          target.parent /*, event, functionKey*/
        );
      }
    }
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
    let intersects: Intersection[] = MouseEventManager.raycaster.intersectObjects(
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
export interface IClickable3DObject {
  isPress: boolean;
  state: ClickableState;

  onMouseDownHandler(event: ThreeMouseEvent): void;
  onMouseUpHandler(event: ThreeMouseEvent): void;
  onMouseOverHandler(event: ThreeMouseEvent): void;
  onMouseOutHandler(event: ThreeMouseEvent): void;

  enable(): void;
  disable(): void;
  switchEnable(bool: boolean): void;
  getEnable(): boolean;
}
