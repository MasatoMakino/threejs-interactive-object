"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RadioButtonManager = void 0;
var three_1 = require("three");
var ThreeMouseEvent_1 = require("./ThreeMouseEvent");
var RadioButtonManager = /** @class */ (function (_super) {
    __extends(RadioButtonManager, _super);
    /**
     * コンストラクタ
     */
    function RadioButtonManager() {
        var _this = _super.call(this) || this;
        /**
         * このマネージャーの管理下のボタン
         * @type {any[]}
         * @private
         */
        _this._models = [];
        /**
         * 管理下のボタンが選択された場合の処理
         * @param {Event} e
         */
        _this.onSelectedButton = function (e) {
            var evt = e;
            if (evt.isSelected) {
                _this.select(evt.model);
            }
        };
        return _this;
    }
    /**
     * このマネージャーの管理下にボタンを追加する
     * @param {IRadioButtonObject3D[]} buttons
     */
    RadioButtonManager.prototype.addButton = function () {
        var _this = this;
        var buttons = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            buttons[_i] = arguments[_i];
        }
        buttons.forEach(function (btn) {
            _this.addModel(btn.model);
        });
    };
    RadioButtonManager.prototype.addModel = function (model) {
        this._models.push(model);
        model.view.addEventListener(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this.onSelectedButton);
    };
    /**
     * ボタンを管理下から外す。
     * ボタン自体の削除は行わない。
     * @param {IRadioButtonObject3D} button
     */
    RadioButtonManager.prototype.removeButton = function (button) {
        this.removeModel(button.model);
    };
    RadioButtonManager.prototype.removeModel = function (model) {
        var index = this._models.indexOf(model);
        if (index > -1) {
            this._models.splice(index, 1);
            model.view.removeEventListener(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, this.onSelectedButton);
        }
        return model;
    };
    /**
     * 特定のボタンを選択する
     * @param {RadioButtonObject} model
     */
    RadioButtonManager.prototype.select = function (model) {
        var index = this._models.indexOf(model);
        if (index === -1) {
            console.warn("管理下でないボタンが選択処理されました。");
            return;
        }
        //選択済みのボタンを再度渡されても反応しない。
        if (model === this._selected && model.isFrozen) {
            return;
        }
        this._selected = model;
        for (var _i = 0, _a = this._models; _i < _a.length; _i++) {
            var mdl = _a[_i];
            mdl.selection = mdl.isFrozen = mdl === model;
        }
        var evt = new ThreeMouseEvent_1.ThreeMouseEvent(ThreeMouseEvent_1.ThreeMouseEventType.SELECT, model);
        this.dispatchEvent(evt);
    };
    Object.defineProperty(RadioButtonManager.prototype, "selected", {
        get: function () {
            return this._selected;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RadioButtonManager.prototype, "models", {
        get: function () {
            return this._models;
        },
        enumerable: false,
        configurable: true
    });
    return RadioButtonManager;
}(three_1.EventDispatcher));
exports.RadioButtonManager = RadioButtonManager;
