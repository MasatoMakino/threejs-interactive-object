import { ClickableObject } from "./ClickableObject";
import { ClickableView } from "./index";

export class ThreeMouseEvent {
  public type: ThreeMouseEventType;
  public model: ClickableObject;

  public readonly isSelected!: boolean;

  constructor(
    type: ThreeMouseEventType,
    modelOrView: ClickableObject | ClickableView
  ) {
    const model = ThreeMouseEvent.getModel(modelOrView);

    this.type = type;
    this.model = model;

    if (type === ThreeMouseEventType.SELECT) {
      this.isSelected = ThreeMouseEvent.getSelection(model);
    }
  }

  private static getModel(
    modelOrView: ClickableObject | ClickableView
  ): ClickableObject {
    if ("model" in modelOrView) {
      return modelOrView.model;
    }
    return modelOrView;
  }
  /**
   * SELECTイベントの場合は、対象ボタンの選択状態を取得
   * @param model
   */
  private static getSelection(model: ClickableObject): boolean {
    if ("selection" in model) {
      return model["selection"];
    } else {
      throw new Error(
        "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。"
      );
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
