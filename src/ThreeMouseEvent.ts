import { IClickableObject3D } from "./MouseEventManager";

export class ThreeMouseEvent {
  public type: ThreeMouseEventType;
  public target: IClickableObject3D;
  public isSelected!: boolean;

  constructor(type: ThreeMouseEventType, target: IClickableObject3D) {
    this.type = type;
    this.target = target;
  }
}

export enum ThreeMouseEventType {
  CLICK = "THREE_MOUSE_EVENT_CLICK",
  OVER = "THREE_MOUSE_EVENT_OVER",
  OUT = "THREE_MOUSE_EVENT_OUT",
  DOWN = "THREE_MOUSE_EVENT_DOWN",
  UP = "THREE_MOUSE_EVENT_UP",
  SELECT = "THREE_MOUSE_EVENT_SELECT"
}
