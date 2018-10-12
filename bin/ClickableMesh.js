import { ClickableState } from "MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "ThreeMouseEvent";
import { Mesh } from "three";
import { MeshStateMaterialSet } from "MeshStateMaterial";
export class ClickableMesh extends Mesh {
    /**
     * コンストラクタ
     */
    constructor(parameters) {
        super(parameters.geo);
        this.isPress = false;
        this.isOver = false;
        this._enableMouse = true;
        this.state = ClickableState.NORMAL;
        this._alpha = 1.0;
        this.materialSet = MeshStateMaterialSet.init(parameters.material);
        this.updateMaterial();
    }
    onMouseDownHandler(event) {
        if (!this.checkActivity())
            return;
        this.isPress = true;
        this.updateState(ClickableState.DOWN);
        this.dispatchEvent(event);
    }
    onMouseUpHandler(event) {
        if (!this.checkActivity())
            return;
        let currentPress = this.isPress;
        this.isPress = false;
        const nextState = this.isOver ? ClickableState.OVER : ClickableState.NORMAL;
        this.updateState(nextState);
        this.dispatchEvent(event);
        if (this.isPress != currentPress) {
            this.onMouseClick();
            let e = new ThreeMouseEvent(ThreeMouseEventType.CLICK, this);
            this.dispatchEvent(e);
        }
    }
    onMouseClick() { }
    onMouseOverHandler(event) {
        if (!this.checkActivity())
            return;
        this.isOver = true;
        this.updateState(ClickableState.OVER);
        this.dispatchEvent(event);
    }
    onMouseOutHandler(event) {
        if (!this.checkActivity())
            return;
        this.isOver = false;
        this.updateState(ClickableState.NORMAL);
        this.dispatchEvent(event);
    }
    setAlpha(number) {
        this._alpha = number;
        this.updateMaterial();
    }
    updateState(state) {
        this.state = state;
        this.updateMaterial();
    }
    update() {
        this.updateState(this.state);
    }
    /**
     * 現在のボタンの有効、無効状態を取得する
     * @return    ボタンが有効か否か
     */
    checkActivity() {
        if (!this._enableMouse)
            return false;
        return true;
    }
    enable() {
        this._enableMouse = true;
        this.state = ClickableState.NORMAL;
        this.updateMaterial();
    }
    disable() {
        this._enableMouse = false;
        this.state = ClickableState.DISABLE;
        this.updateMaterial();
    }
    updateMaterial() {
        MeshStateMaterialSet.setOpacity(this.materialSet, this._alpha);
        const stateMat = MeshStateMaterialSet.get(this.materialSet, this.state, this._enableMouse);
        this.material = stateMat.material;
    }
    switchEnable(bool) {
        if (bool) {
            this.enable();
        }
        else {
            this.disable();
        }
    }
    getEnable() {
        return this._enableMouse;
    }
}
