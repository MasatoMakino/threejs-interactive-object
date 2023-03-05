import { Event } from "three";
import { ClickableObject, IClickableObject3D } from "./";

export class ThreeMouseEvent implements Event {
  type: ThreeMouseEventType;
  public model: ClickableObject;

  public readonly isSelected!: boolean;

  constructor(
    type: ThreeMouseEventType,
    modelOrView: ClickableObject | IClickableObject3D
  ) {
    const model = ThreeMouseEvent.getModel(modelOrView);

    this.type = type;
    this.model = model;

    if (type === "select") {
      this.isSelected = ThreeMouseEvent.getSelection(model);
    }
  }

  private static getModel(
    modelOrView: ClickableObject | IClickableObject3D
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
      return !!model["selection"];
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

export type ThreeMouseEventType =
  | "click"
  | "over"
  | "out"
  | "down"
  | "up"
  | "select";
