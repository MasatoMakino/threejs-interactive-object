import { Event } from "three";
import { ClickableObject, IClickableObject3D } from "./";

export interface ThreeMouseEvent<Value> extends Event {
  type: ThreeMouseEventType;
  model?: ClickableObject<Value>;
  isSelected?: boolean;
}

export class ThreeMouseEventUtil {
  static generate<Value>(
    type: ThreeMouseEventType,
    modelOrView: ClickableObject<Value> | IClickableObject3D<Value> | undefined
  ): ThreeMouseEvent<Value> {
    const e: ThreeMouseEvent<Value> = {
      type,
      model: ThreeMouseEventUtil.getModel(modelOrView),
    };

    if (type === "select") {
      e.isSelected = ThreeMouseEventUtil.getSelection(e.model);
    }
    return e;
  }

  private static getModel<Value>(
    modelOrView: ClickableObject<Value> | IClickableObject3D<Value> | undefined
  ): ClickableObject<Value> | undefined {
    if (modelOrView != null && "model" in modelOrView) {
      return modelOrView.model;
    }
    return modelOrView;
  }

  /**
   * SELECTイベントの場合は、対象ボタンの選択状態を取得
   * @param model
   */
  static getSelection<Value>(
    model: ClickableObject<Value> | undefined
  ): boolean {
    if (model != null && "selection" in model) {
      return !!model["selection"];
    } else {
      throw new Error(
        "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。"
      );
    }
  }

  static clone<Value>(e: ThreeMouseEvent<Value>): ThreeMouseEvent<Value> {
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
