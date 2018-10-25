import { ISelectableObject3D } from "./MouseEventManager";
import { ClickableMesh } from "./ClickableMesh";
export declare class CheckBoxMesh extends ClickableMesh implements ISelectableObject3D {
    protected _isSelect: boolean;
    value: any;
    /**
     * クリックイベント時の処理
     * "click"イベントはマウスイベント類の必ず最後に発生するので
     * ここでisSelect状態を一括管理する。
     */
    onMouseClick(): void;
    selection: boolean;
    protected updateMaterial(): void;
}
//# sourceMappingURL=CheckBoxMesh.d.ts.map