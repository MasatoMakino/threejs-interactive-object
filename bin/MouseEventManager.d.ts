import { Object3D, Raycaster, Vector2, Camera, Renderer, Scene, Intersection } from "three";
import { ThreeMouseEvent } from "./ThreeMouseEvent";
import { StateMaterialSet } from "StateMaterial";
import { EventDispatcher } from "three";
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
    protected static onDocumentMouseDown: (event: MouseEvent) => void;
    protected static onDocumentMouseUp: (event: MouseEvent) => void;
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
//# sourceMappingURL=MouseEventManager.d.ts.map