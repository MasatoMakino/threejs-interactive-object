import { ClickableMesh } from "./ClickableMesh";
/**
 * Created by makinomasato on 2016/10/12.
 */
export declare class CheckBoxMesh extends ClickableMesh {
    protected _isSelect: boolean;
    value: any;
    /**
     * クリックイベント時の処理
     * "click"イベントはマウスイベント類の必ず最後に発生するので
     * ここでisSelect状態を一括管理する。
     * @param event
     */
    protected onMouseClick(): void;
    getSelection(): boolean;
    setSelection(bool: boolean): void;
    protected updateMaterial(): void;
}
//# sourceMappingURL=CheckBoxMesh.d.ts.map