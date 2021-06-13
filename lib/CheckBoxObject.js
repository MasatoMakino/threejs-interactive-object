"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckBoxObject = void 0;
const ClickableObject_1 = require("./ClickableObject");
const MouseEventManager_1 = require("./MouseEventManager");
const ThreeMouseEvent_1 = require("./ThreeMouseEvent");
class CheckBoxObject extends ClickableObject_1.ClickableObject {
    constructor() {
        super(...arguments);
        this._isSelect = false;
    }
    /**
     * クリックイベント時の処理
     * "click"イベントはマウスイベント類の必ず最後に発生するので
     * ここでisSelect状態を一括管理する。
     */
    onMouseClick() {
        this._isSelect = !this._isSelect;
        const e = new ThreeMouseEvent_1.ThreeMouseEvent(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this);
        this.view.dispatchEvent(e);
        this.updateMaterial();
    }
    get selection() {
        return this._isSelect;
    }
    set selection(bool) {
        this._isSelect = bool;
        this.updateState(MouseEventManager_1.ClickableState.NORMAL);
    }
    updateMaterial() {
        this.materialSet.setOpacity(this._alpha);
        const stateMat = this.materialSet.getMaterial(this.state, this._enable, this._isSelect);
        this.view.material = stateMat.material;
    }
}
exports.CheckBoxObject = CheckBoxObject;
