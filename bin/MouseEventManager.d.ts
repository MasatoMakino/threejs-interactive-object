import { Camera, EventDispatcher, Intersection, Object3D, Raycaster, Renderer, Scene, Vector2 } from "three";
import { ThreeMouseEventType } from "./ThreeMouseEvent";
import { ClickableObject } from "./ClickableObject";
import { CheckBoxObject } from "./CheckBoxObject";
import { RadioButtonObject } from "./RadioButtonObject";
export declare class MouseEventManager {
    protected static camera: Camera;
    protected static renderer: Renderer;
    protected static scene: Scene;
    protected static canvas: HTMLCanvasElement;
    protected static raycaster: Raycaster;
    protected static mouse: Vector2;
    protected static currentOver: IClickableObject3D | null;
    static isInit: boolean;
    static init(scene: Scene, camera: Camera, renderer: Renderer): void;
    protected static onDocumentMouseMove: (event: any) => void;
    /**
     * 現在マウスオーバーしている対象をなしにする。
     * もし、すでにマウスオーバー対象が存在するなら、マウスアウトハンドラーを呼び出した後にクリアする。
     */
    protected static clearCurrentOver(): void;
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
    static onButtonHandler(btn: IClickableObject3D, type: ThreeMouseEventType): void;
    protected static checkTarget(target: Object3D): any;
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
//# sourceMappingURL=MouseEventManager.d.ts.map