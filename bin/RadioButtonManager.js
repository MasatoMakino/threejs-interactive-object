import { EventDispatcher } from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";
export class RadioButtonManager extends EventDispatcher {
    /**
     * コンストラクタ
     */
    constructor() {
        super();
        /**
         * このマネージャーの管理下のボタン
         * @type {any[]}
         * @private
         */
        this._buttons = [];
        /**
         * 管理下のボタンが選択された場合の処理
         * @param {Event} e
         */
        this.onSelectedButton = (e) => {
            const evt = e;
            if (evt.isSelected) {
                this.select(evt.button);
            }
        };
    }
    /**
     * このマネージャーの管理下にボタンを追加する
     * @param {IRadioButtonObject3D} button
     */
    addButton(button) {
        this._buttons.push(button);
        button.addEventListener(ThreeMouseEventType.SELECT, this.onSelectedButton);
    }
    /**
     * ボタンを管理下から外す。
     * ボタン自体の削除は行わない。
     * @param {IRadioButtonObject3D} button
     */
    removeButton(button) {
        const index = this._buttons.indexOf(button);
        if (index > -1) {
            this._buttons.splice(index, 1);
            button.removeEventListener(ThreeMouseEventType.SELECT, this.onSelectedButton);
        }
        return button;
    }
    /**
     * 特定のボタンを選択する
     * @param {IRadioButtonObject3D} button
     */
    select(button) {
        const index = this._buttons.indexOf(button);
        if (index === -1) {
            console.warn("管理下でないボタンが選択処理されました。");
            return;
        }
        //選択済みのボタンを再度渡されても反応しない。
        if (button === this._selected && button.isFrozen) {
            return;
        }
        this._selected = button;
        for (let btn of this._buttons) {
            btn.selection = btn.isFrozen = btn === button;
        }
        const evt = new ThreeMouseEvent(ThreeMouseEventType.SELECT, button);
        this.dispatchEvent(evt);
    }
    get selected() {
        return this._selected;
    }
    get buttons() {
        return this._buttons;
    }
}
