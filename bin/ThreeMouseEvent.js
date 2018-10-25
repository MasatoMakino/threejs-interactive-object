export class ThreeMouseEvent {
    constructor(type, button) {
        this.type = type;
        this.button = button;
        //SELECTイベントの場合は、対象ボタンの選択状態を記録
        if (type === ThreeMouseEventType.SELECT) {
            if (button.selection !== undefined) {
                this.isSelected = button.selection;
            }
            else {
                throw new Error("選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。");
            }
        }
    }
    clone() {
        return new ThreeMouseEvent(this.type, this.button);
    }
}
export var ThreeMouseEventType;
(function (ThreeMouseEventType) {
    ThreeMouseEventType["CLICK"] = "THREE_MOUSE_EVENT_CLICK";
    ThreeMouseEventType["OVER"] = "THREE_MOUSE_EVENT_OVER";
    ThreeMouseEventType["OUT"] = "THREE_MOUSE_EVENT_OUT";
    ThreeMouseEventType["DOWN"] = "THREE_MOUSE_EVENT_DOWN";
    ThreeMouseEventType["UP"] = "THREE_MOUSE_EVENT_UP";
    ThreeMouseEventType["SELECT"] = "THREE_MOUSE_EVENT_SELECT";
})(ThreeMouseEventType || (ThreeMouseEventType = {}));
