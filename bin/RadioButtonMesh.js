import { CheckBoxMesh } from "./CheckBoxMesh";
export class RadioButtonMesh extends CheckBoxMesh {
    constructor() {
        super(...arguments);
        this._isFrozen = false;
    }
    /**
     * 現在のボタンの有効、無効状態を取得する
     * ラジオボタンは選択中は自身の状態を変更できない。
     * @return    ボタンが有効か否か
     */
    checkActivity() {
        return this._enableMouse && !this._isFrozen;
    }
    get isFrozen() {
        return this._isFrozen;
    }
    set isFrozen(bool) {
        this._isFrozen = bool;
    }
}
