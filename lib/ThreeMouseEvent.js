"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThreeMouseEventType = exports.ThreeMouseEvent = void 0;
var ThreeMouseEvent = /** @class */ (function () {
    function ThreeMouseEvent(type, modelOrView) {
        var model = ThreeMouseEvent.getModel(modelOrView);
        this.type = type;
        this.model = model;
        if (type === ThreeMouseEventType.SELECT) {
            this.isSelected = ThreeMouseEvent.getSelection(model);
        }
    }
    ThreeMouseEvent.getModel = function (modelOrView) {
        if ("model" in modelOrView) {
            return modelOrView.model;
        }
        return modelOrView;
    };
    /**
     * SELECTイベントの場合は、対象ボタンの選択状態を取得
     * @param model
     */
    ThreeMouseEvent.getSelection = function (model) {
        if ("selection" in model) {
            return model["selection"];
        }
        else {
            throw new Error("選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。");
        }
    };
    ThreeMouseEvent.prototype.clone = function () {
        return new ThreeMouseEvent(this.type, this.model);
    };
    return ThreeMouseEvent;
}());
exports.ThreeMouseEvent = ThreeMouseEvent;
var ThreeMouseEventType;
(function (ThreeMouseEventType) {
    ThreeMouseEventType["CLICK"] = "THREE_MOUSE_EVENT_CLICK";
    ThreeMouseEventType["OVER"] = "THREE_MOUSE_EVENT_OVER";
    ThreeMouseEventType["OUT"] = "THREE_MOUSE_EVENT_OUT";
    ThreeMouseEventType["DOWN"] = "THREE_MOUSE_EVENT_DOWN";
    ThreeMouseEventType["UP"] = "THREE_MOUSE_EVENT_UP";
    ThreeMouseEventType["SELECT"] = "THREE_MOUSE_EVENT_SELECT";
})(ThreeMouseEventType = exports.ThreeMouseEventType || (exports.ThreeMouseEventType = {}));
