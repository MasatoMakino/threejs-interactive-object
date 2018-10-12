import { IClickable3DObject, ClickableState } from "MouseEventManager";
import { ThreeMouseEvent } from "ThreeMouseEvent";
import { BufferGeometry, Geometry, Mesh } from "three";
import { MeshStateMaterialSet } from "MeshStateMaterial";
export declare class ClickableMesh extends Mesh implements IClickable3DObject {
    isPress: boolean;
    protected isOver: boolean;
    protected _enableMouse: boolean;
    state: ClickableState;
    materialSet: MeshStateMaterialSet;
    protected _alpha: number;
    /**
     * コンストラクタ
     */
    constructor(parameters: {
        geo?: Geometry | BufferGeometry;
        material: MeshStateMaterialSet;
    });
    onMouseDownHandler(event: ThreeMouseEvent): void;
    onMouseUpHandler(event: ThreeMouseEvent): void;
    protected onMouseClick(): void;
    onMouseOverHandler(event: ThreeMouseEvent): void;
    onMouseOutHandler(event: ThreeMouseEvent): void;
    setAlpha(number: number): void;
    protected updateState(state: ClickableState): void;
    update(): void;
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