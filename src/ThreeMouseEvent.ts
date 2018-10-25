import { IClickableObject3D, ISelectableObject3D } from "./MouseEventManager";

export class ThreeMouseEvent {
  public type: ThreeMouseEventType;
  public button: IClickableObject3D;
  public readonly isSelected!: boolean;

  constructor(type: ThreeMouseEventType, button: IClickableObject3D) {
    this.type = type;
    this.button = button;

    //SELECTイベントの場合は、対象ボタンの選択状態を記録
    if (type === ThreeMouseEventType.SELECT) {
      if ((button as any).selection !== undefined) {
        this.isSelected = (button as ISelectableObject3D).selection;
      } else {
        throw new Error(
          "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。"
        );
      }
    }
  }

  public clone(): ThreeMouseEvent {
    return new ThreeMouseEvent(this.type, this.button);
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
