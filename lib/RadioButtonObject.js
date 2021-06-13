"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButtonObject = void 0;
const CheckBoxObject_1 = require("./CheckBoxObject");
class RadioButtonObject extends CheckBoxObject_1.CheckBoxObject {
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
        return this._enable && !this._isFrozen;
    }
    get isFrozen() {
        return this._isFrozen;
    }
    set isFrozen(bool) {
        this._isFrozen = bool;
    }
}
exports.RadioButtonObject = RadioButtonObject;
