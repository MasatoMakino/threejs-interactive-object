import { ClickableState } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
import { ClickableMesh } from "./ClickableMesh";
/**
 * Created by makinomasato on 2016/10/12.
 */
export class CheckBoxMesh extends ClickableMesh {
    constructor() {
        super(...arguments);
        this._isSelect = false;
    }
    /**
     * クリックイベント時の処理
     * "click"イベントはマウスイベント類の必ず最後に発生するので
     * ここでisSelect状態を一括管理する。
     * @param event
     */
    onMouseClick() {
        this._isSelect = !this._isSelect;
        const e = new ThreeMouseEvent(ThreeMouseEventType.SELECT, this);
        e.isSelected = this._isSelect;
        this.dispatchEvent(e);
        this.updateMaterial();
    }
    getSelection() {
        return this._isSelect;
    }
    setSelection(bool) {
        this._isSelect = bool;
        this.updateState(ClickableState.NORMAL);
    }
    updateMaterial() {
        this.materialSet.setOpacity(this._alpha);
        const stateMat = this.materialSet.getMaterial(this.state, this._enableMouse, this._isSelect);
        this.material = stateMat.material;
    }
}
