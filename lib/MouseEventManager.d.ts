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
import { ThreeMouseEventType } from "./ThreeMouseEvent";
export declare class MouseEventManager {
  protected static camera: Camera;
  protected static renderer: Renderer;
  protected static scene: Scene;
  protected static canvas: HTMLCanvasElement;
  protected static raycaster: Raycaster;
  protected static mouse: Vector2;
  protected static currentOver: IClickableObject3D[] | null;
  static isInit: boolean;
  protected static hasThrottled: boolean;
  static throttlingTime_ms: number;
  protected static throttlingDelta: number;
  static init(
    scene: Scene,
    camera: Camera,
    renderer: Renderer,
    option?: {
      throttlingTime_ms?: number;
    }
  ): void;
  private static onTick;
  protected static onDocumentMouseMove: (event: any) => void;
  /**
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  protected static clearOver(): void;
  /**
   * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
   * マウス座標から対象となるObject3Dを探し出して操作を行う。
   * @param {MouseEvent} event
   */
  protected static onDocumentMouseUpDown: (event: MouseEvent) => void;
  /**
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * @param {Intersection[]} intersects
   * @param {ThreeMouseEventType} type
   */
  private static checkIntersects;
  /**
   * ボタンの各種イベントハンドラーメソッドを、typeにしたがって実行する。
   * @param {IClickableObject3D} btn
   * @param {ThreeMouseEventType} type
   */
  static onButtonHandler(
    btn: IClickableObject3D,
    type: ThreeMouseEventType
  ): void;
  /**
   * IClickableObject3Dインターフェースを実装しているか否かを判定する。
   * ユーザー定義Type Guard
   * @param arg
   * @private
   */
  private static implementsIClickableObject3D;
  protected static checkTarget(
    target: Object3D,
    type: ThreeMouseEventType,
    hasTarget?: boolean
  ): boolean;
  protected static updateMouse(event: MouseEvent, mouse: Vector2): Vector2;
  protected static getIntersects(event: MouseEvent): Intersection[];
}
/**
 * IClickable3DObjectの現在状態を表す定数セット。
 * これとselectフラグを掛け合わせることで状態を判定する。
 */
export declare enum ClickableState {
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
//# sourceMappingURL=MouseEventManager.d.ts.map
