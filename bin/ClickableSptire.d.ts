import { IClickableObject3D, ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent } from "./ThreeMouseEvent";
import { Sprite } from "three";
import { StateMaterialSet } from "./StateMaterial";
/**
 * Created by makinomasato on 2016/05/02.
 * クリック可能なSpriteです。
 * ビルボードボタンとして使用することを想定しています。
 */
export declare class ClickableSprite extends Sprite implements IClickableObject3D {
    isPress: boolean;
    protected isOver: boolean;
    protected _enableMouse: boolean;
    state: ClickableState;
    materialSet: StateMaterialSet;
    private _alpha;
    constructor(material: StateMaterialSet);
    onMouseDownHandler(event: ThreeMouseEvent): void;
    onMouseUpHandler(event: ThreeMouseEvent): void;
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
//# sourceMappingURL=ClickableSptire.d.ts.map