import { ClickableObject } from "./ClickableObject";
import { IClickableObject3D } from "./MouseEventManager";

export declare class ThreeMouseEvent {
  type: ThreeMouseEventType;
  model: ClickableObject;
  readonly isSelected: boolean;
  constructor(
    type: ThreeMouseEventType,
    modelOrView: ClickableObject | IClickableObject3D
  );
  private static getModel;
  /**
   * SELECTイベントの場合は、対象ボタンの選択状態を取得
   * @param model
   */
  private static getSelection;
  clone(): ThreeMouseEvent;
}
export declare enum ThreeMouseEventType {
  CLICK = "THREE_MOUSE_EVENT_CLICK",
  OVER = "THREE_MOUSE_EVENT_OVER",
  OUT = "THREE_MOUSE_EVENT_OUT",
  DOWN = "THREE_MOUSE_EVENT_DOWN",
  UP = "THREE_MOUSE_EVENT_UP",
  SELECT = "THREE_MOUSE_EVENT_SELECT",
}
//# sourceMappingURL=ThreeMouseEvent.d.ts.map
