import { ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent } from "./ThreeMouseEvent";
import { StateMaterialSet } from "./StateMaterial";
import { ClickableMesh } from "./ClickableMesh";
import { ClickableSprite } from "./ClickableSptire";
/**
 * クリックに反応するMesh。
 */
export declare class ClickableObject {
    materialSet: StateMaterialSet;
    view: ClickableMesh | ClickableSprite;
    isPress: boolean;
    protected isOver: boolean;
    protected _enableMouse: boolean;
    frozen: boolean;
    state: ClickableState;
    protected _materialSet: StateMaterialSet;
    protected _alpha: number;
    /**
     * コンストラクタ
     */
    constructor(parameters: {
        view: ClickableMesh | ClickableSprite;
        material: StateMaterialSet;
    });
    onMouseDownHandler(event: ThreeMouseEvent): void;
    onMouseUpHandler(event: ThreeMouseEvent): void;
    onMouseClick(): void;
    onMouseOverHandler(event: ThreeMouseEvent): void;
    onMouseOutHandler(event: ThreeMouseEvent): void;
    private onMouseOverOutHandler;
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
//# sourceMappingURL=ClickableObject.d.ts.map