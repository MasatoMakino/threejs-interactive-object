import { ClickableState } from "./MouseEventManager";
import { ClickableSprite } from "./ClickableSptire";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
export class CheckBoxSprite extends ClickableSprite {
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
        this.dispatchEvent(e);
        this.updateMaterial();
    }
    get selection() {
        return this._isSelect;
    }
    set selection(bool) {
        this._isSelect = bool;
        this.updateState(ClickableState.NORMAL);
    }
    updateMaterial() {
        this.materialSet.setOpacity(this._alpha);
        const stateMat = this.materialSet.getMaterial(this.state, this._enableMouse, this._isSelect);
        this.material = stateMat.material;
    }
}
