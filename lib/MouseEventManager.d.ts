import {
  Camera,
  Intersection,
  Object3D,
  Raycaster,
  Scene,
  Vector2,
  Vector4,
} from "three";
import { ClickableObject } from "./ClickableObject";
import { ThreeMouseEventType } from "./ThreeMouseEvent";
export declare class MouseEventManager {
  protected camera: Camera;
  protected scene: Scene;
  protected canvas: HTMLCanvasElement;
  protected raycaster: Raycaster;
  protected mouse: Vector2;
  protected currentOver: IClickableObject3D[] | null;
  protected hasThrottled: boolean;
  throttlingTime_ms: number;
  protected throttlingDelta: number;
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
  );
  private onTick;
  protected onDocumentMouseMove: (event: any) => void;
  /**
   * 現在マウスオーバーしている対象をなしにする。
   * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
   */
  protected clearOver(): void;
  /**
   * カンバス上でマウスダウンかマウスアップが行われた際のイベントハンドラー
   * マウス座標から対象となるObject3Dを探し出して操作を行う。
   * @param {MouseEvent} event
   */
  protected onDocumentMouseUpDown: (event: MouseEvent) => void;
  /**
   * マウスの座標にかかっているオブジェクト一覧から、操作対象を検索し
   * 指定されたタイプのハンドラー関数を実行させる。
   * 重なり合ったオブジェクトがある場合、最前面から検索を開始する。
   * 操作対象が見つかった時点で処理は中断され、背面オブジェクトは操作対象にならない。
   *
   * @param {Intersection[]} intersects
   * @param {ThreeMouseEventType} type
   */
  private checkIntersects;
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
    target: Object3D,
    type: ThreeMouseEventType,
    hasTarget?: boolean
  ): boolean;
  protected getIntersects(event: MouseEvent): Intersection[];
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
export interface IClickableObject3D {
  model: ClickableObject;
}
//# sourceMappingURL=MouseEventManager.d.ts.map
