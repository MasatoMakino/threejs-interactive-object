import { ClickableState, MouseEventManager } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
/**
 * クリックに反応するMesh。
 */
export class ClickableObject {
    /**
     * コンストラクタ
     */
    constructor(parameters) {
        this.isPress = false;
        this.isOver = false;
        this._enableMouse = true;
        this.frozen = false;
        this.state = ClickableState.NORMAL;
        this._alpha = 1.0;
        this.view = parameters.view;
        if (!MouseEventManager.isInit) {
            console.warn("MouseEventManager の初期化前にインタラクティブメッシュを生成しています。MouseEventManager.initをインタラクティブオブジェクトの生成前に実行してください。");
        }
        this._materialSet = parameters.material;
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
    onMouseDownHandler(event) {
        if (!this.checkActivity())
            return;
        this.isPress = true;
        this.updateState(ClickableState.DOWN);
        this.view.dispatchEvent(event);
    }
    onMouseUpHandler(event) {
        if (!this.checkActivity())
            return;
        const currentPress = this.isPress;
        this.isPress = false;
        const nextState = this.isOver ? ClickableState.OVER : ClickableState.NORMAL;
        this.updateState(nextState);
        this.view.dispatchEvent(event);
        if (this.isPress != currentPress) {
            this.onMouseClick();
            let e = new ThreeMouseEvent(ThreeMouseEventType.CLICK, this);
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
        this.isOver = event.type === ThreeMouseEventType.OVER;
        this.updateState(this.isOver ? ClickableState.OVER : ClickableState.NORMAL);
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
        return this._enableMouse && !this.frozen;
    }
    enable() {
        this.switchEnable(true);
    }
    disable() {
        this.switchEnable(false);
    }
    updateMaterial() {
        this._materialSet.setOpacity(this._alpha);
        const stateMat = this._materialSet.getMaterial(this.state, this._enableMouse);
        this.view.material = stateMat.material;
    }
    switchEnable(bool) {
        this._enableMouse = bool;
        this.state = bool ? ClickableState.NORMAL : ClickableState.DISABLE;
        this.updateMaterial();
    }
    getEnable() {
        return this._enableMouse;
    }
}
