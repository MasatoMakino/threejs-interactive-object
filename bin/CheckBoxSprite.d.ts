import { ISelectableObject3D } from "./MouseEventManager";
import { ClickableSprite } from "./ClickableSptire";
export declare class CheckBoxSprite extends ClickableSprite implements ISelectableObject3D {
    protected _isSelect: boolean;
    value: any;
    /**
     * クリックイベント時の処理
     * "click"イベントはマウスイベント類の必ず最後に発生するので
     * ここでisSelect状態を一括管理する。
     * @param event
     */
    onMouseClick(): void;
    selection: boolean;
    protected updateMaterial(): void;
}
//# sourceMappingURL=CheckBoxSprite.d.ts.map