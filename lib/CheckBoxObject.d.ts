import { ClickableObject } from "./ClickableObject";
import { CheckBoxMesh } from "./InteractiveMesh";
import { CheckBoxSprite } from "./InteractiveSprite";
export declare class CheckBoxObject extends ClickableObject {
    view: CheckBoxMesh | CheckBoxSprite;
    protected _isSelect: boolean;
    value: any;
    /**
     * クリックイベント時の処理
     * "click"イベントはマウスイベント類の必ず最後に発生するので
     * ここでisSelect状態を一括管理する。
     */
    onMouseClick(): void;
    get selection(): boolean;
    set selection(bool: boolean);
    protected updateMaterial(): void;
}
//# sourceMappingURL=CheckBoxObject.d.ts.map