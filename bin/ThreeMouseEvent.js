export class ThreeMouseEvent {
    constructor(type, target) {
        this.type = type;
        this.target = target;
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
