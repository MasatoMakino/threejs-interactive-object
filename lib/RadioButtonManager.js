"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButtonManager = void 0;
const three_1 = require("three");
const ThreeMouseEvent_1 = require("./ThreeMouseEvent");
class RadioButtonManager extends three_1.EventDispatcher {
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
        this._models = [];
        /**
         * 管理下のボタンが選択された場合の処理
         * @param {Event} e
         */
        this.onSelectedButton = (e) => {
            const evt = e;
            if (evt.isSelected) {
                this.select(evt.model);
            }
        };
    }
    /**
     * このマネージャーの管理下にボタンを追加する
     * @param {IClickableObject3D[]} buttons
     */
    addButton(...buttons) {
        buttons.forEach((btn) => {
            this.addModel(btn.model);
        });
    }
    addModel(model) {
        this._models.push(model);
        model.view.addEventListener(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this.onSelectedButton);
    }
    /**
     * ボタンを管理下から外す。
     * ボタン自体の削除は行わない。
     * @param {IClickableObject3D} button
     */
    removeButton(button) {
        this.removeModel(button.model);
    }
    removeModel(model) {
        const index = this._models.indexOf(model);
        if (index > -1) {
            this._models.splice(index, 1);
            model.view.removeEventListener(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this.onSelectedButton);
        }
        return model;
    }
    /**
     * 特定のボタンを選択する
     * @param {RadioButtonObject} model
     */
    select(model) {
        const index = this._models.indexOf(model);
        if (index === -1) {
            console.warn("管理下でないボタンが選択処理されました。");
            return;
        }
        //選択済みのボタンを再度渡されても反応しない。
        if (model === this._selected && model.isFrozen) {
            return;
        }
        this._selected = model;
        for (let mdl of this._models) {
            mdl.selection = mdl.isFrozen = mdl === model;
        }
        const evt = new ThreeMouseEvent_1.ThreeMouseEvent(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, model);
        this.dispatchEvent(evt);
    }
    get selected() {
        return this._selected;
    }
    get models() {
        return this._models;
    }
}
exports.RadioButtonManager = RadioButtonManager;
