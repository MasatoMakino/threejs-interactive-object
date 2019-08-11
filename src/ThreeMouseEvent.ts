import { ClickableObject } from "./ClickableObject";

export class ThreeMouseEvent {
  public type: ThreeMouseEventType;
  public model: ClickableObject;

  public readonly isSelected!: boolean;

  constructor(type: ThreeMouseEventType, model: ClickableObject) {
    this.type = type;
    this.model = model;

    //SELECTイベントの場合は、対象ボタンの選択状態を記録
    if (type === ThreeMouseEventType.SELECT) {
      if ((model as any).selection !== undefined) {
        this.isSelected = (model as any).selection;
      } else {
        throw new Error(
          "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。"
        );
      }
    }
  }

  public clone(): ThreeMouseEvent {
    return new ThreeMouseEvent(this.type, this.model);
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
