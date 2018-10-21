import { IClickable3DObject, ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent } from "./ThreeMouseEvent";
import { BufferGeometry, Geometry, Mesh } from "three";
import { StateMaterialSet } from "./StateMaterial";
export declare class ClickableMesh extends Mesh implements IClickable3DObject {
    isPress: boolean;
    protected isOver: boolean;
    protected _enableMouse: boolean;
    state: ClickableState;
    materialSet: StateMaterialSet;
    protected _alpha: number;
    /**
     * コンストラクタ
     */
    constructor(parameters: {
        geo?: Geometry | BufferGeometry;
        material: StateMaterialSet;
    });
    onMouseDownHandler(event: ThreeMouseEvent): void;
    onMouseUpHandler(event: ThreeMouseEvent): void;
    protected onMouseClick(): void;
    onMouseOverHandler(event: ThreeMouseEvent): void;
    onMouseOutHandler(event: ThreeMouseEvent): void;
    alpha: number;
    protected updateState(state: ClickableState): void;
    /**
     * 現在のボタンの有効、無効状態を取得する
     * @return    ボタンが有効か否か
     */
    protected checkActivity(): Boolean;
    enable(): void;
    disable(): void;
    protected updateMaterial(): void;
    switchEnable(bool: boolean): void;
    getEnable(): boolean;
}
//# sourceMappingURL=ClickableMesh.d.ts.map