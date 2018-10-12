import { IClickable3DObject } from "./MouseEventManager";
export declare class ThreeMouseEvent {
    type: ThreeMouseEventType;
    target: IClickable3DObject;
    isSelected: boolean;
    constructor(type: ThreeMouseEventType, target: IClickable3DObject);
}
export declare enum ThreeMouseEventType {
    CLICK = "THREE_MOUSE_EVENT_CLICK",
    OVER = "THREE_MOUSE_EVENT_OVER",
    OUT = "THREE_MOUSE_EVENT_OUT",
    DOWN = "THREE_MOUSE_EVENT_DOWN",
    UP = "THREE_MOUSE_EVENT_UP",
    SELECT = "THREE_MOUSE_EVENT_SELECT"
}
//# sourceMappingURL=ThreeMouseEvent.d.ts.map