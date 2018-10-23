import { IClickableObject3D } from "./MouseEventManager";
export declare class ThreeMouseEvent {
    type: ThreeMouseEventType;
    target: IClickableObject3D;
    isSelected: boolean;
    constructor(type: ThreeMouseEventType, target: IClickableObject3D);
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