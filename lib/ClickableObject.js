"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClickableObject = void 0;
const MouseEventManager_1 = require("./MouseEventManager");
const ThreeMouseEvent_1 = require("./ThreeMouseEvent");
/**
 * クリックに反応するObject。
 */
class ClickableObject {
    /**
     * コンストラクタ
     */
    constructor(parameters) {
        var _a;
        this._isPress = false;
        this._isOver = false;
        this._enable = true;
        this.mouseEnabled = true;
        this.frozen = false;
        this.state = MouseEventManager_1.ClickableState.NORMAL;
        this._alpha = 1.0;
        this.view = parameters.view;
        (_a = this._materialSet) !== null && _a !== void 0 ? _a : (this._materialSet = parameters.material);
        this.updateMaterial();
    }
    get materialSet() {
        return this._materialSet;
    }
    set materialSet(value) {
        const isSame = value === this._materialSet;
        this._materialSet = value;
        if (!isSame) {
            this.updateMaterial();
        }
    }
    get isOver() {
        return this._isOver;
    }
    get isPress() {
        return this._isPress;
    }
    onMouseDownHandler(event) {
        if (!this.checkActivity())
            return;
        this._isPress = true;
        this.updateState(MouseEventManager_1.ClickableState.DOWN);
        this.view.dispatchEvent(event);
    }
    onMouseUpHandler(event) {
        if (!this.checkActivity())
            return;
        const currentPress = this._isPress;
        this._isPress = false;
        const nextState = this._isOver
            ? MouseEventManager_1.ClickableState.OVER
            : MouseEventManager_1.ClickableState.NORMAL;
        this.updateState(nextState);
        this.view.dispatchEvent(event);
        if (this._isPress != currentPress) {
            this.onMouseClick();
            let e = new ThreeMouseEvent_1.ThreeMouseEvent(ThreeMouseEvent_1.ThreeMouseEventType.CLICK, this);
            this.view.dispatchEvent(e);
        }
    }
    onMouseClick() { }
    onMouseOverHandler(event) {
        this.onMouseOverOutHandler(event);
    }
    onMouseOutHandler(event) {
        this.onMouseOverOutHandler(event);
    }
    onMouseOverOutHandler(event) {
        if (!this.checkActivity())
            return;
        this._isOver = event.type === ThreeMouseEvent_1.ThreeMouseEventType.OVER;
        this.updateState(this._isOver ? MouseEventManager_1.ClickableState.OVER : MouseEventManager_1.ClickableState.NORMAL);
        this.view.dispatchEvent(event);
    }
    set alpha(number) {
        this._alpha = number;
        this.updateMaterial();
    }
    updateState(state) {
        this.state = state;
        this.updateMaterial();
    }
    /**
     * 現在のボタンの有効、無効状態を取得する
     * @return    ボタンが有効か否か
     */
    checkActivity() {
        return this._enable && !this.frozen;
    }
    enable() {
        this.switchEnable(true);
    }
    disable() {
        this.switchEnable(false);
    }
    updateMaterial() {
        var _a, _b;
        (_a = this._materialSet) === null || _a === void 0 ? void 0 : _a.setOpacity(this._alpha);
        const stateMat = (_b = this._materialSet) === null || _b === void 0 ? void 0 : _b.getMaterial(this.state, this._enable);
        if (!stateMat)
            return;
        switch (this.view.type) {
            //TODO PR Mesh.d.ts
            case "Mesh":
            case "Sprite":
                this.view.material = stateMat.material;
                break;
            case "Group":
            default:
                break;
        }
    }
    switchEnable(bool) {
        this._enable = bool;
        this.state = bool ? MouseEventManager_1.ClickableState.NORMAL : MouseEventManager_1.ClickableState.DISABLE;
        this.updateMaterial();
    }
}
exports.ClickableObject = ClickableObject;
