import { Event } from "three";
import { ClickableObject, IClickableObject3D } from "./";

export interface ThreeMouseEvent extends Event {
  type: ThreeMouseEventType;
  model: ClickableObject;
  isSelected?: boolean;
}

export class ThreeMouseEventUtil {
  static generate(
    type: ThreeMouseEventType,
    modelOrView: ClickableObject | IClickableObject3D
  ): ThreeMouseEvent {
    const e: ThreeMouseEvent = {
      type,
      model: ThreeMouseEventUtil.getModel(modelOrView),
    };

    if (type === "select") {
      e.isSelected = ThreeMouseEventUtil.getSelection(e.model);
    }
    return e;
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
  static getSelection(model: ClickableObject): boolean {
    if ("selection" in model) {
      return !!model["selection"];
    } else {
      throw new Error(
        "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。"
      );
    }
  }

  static clone(e: ThreeMouseEvent): ThreeMouseEvent {
    return ThreeMouseEventUtil.generate(e.type, e.model);
  }
}

export type ThreeMouseEventType =
  | "click"
  | "over"
  | "out"
  | "down"
  | "up"
  | "select";
