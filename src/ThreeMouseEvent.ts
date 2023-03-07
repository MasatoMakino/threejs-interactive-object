import { Event } from "three";
import { ClickableObject, IClickableObject3D } from "./";

export interface ThreeMouseEvent<ValueType> extends Event {
  type: ThreeMouseEventType;
  model?: ClickableObject<ValueType>;
  isSelected?: boolean;
}

export class ThreeMouseEventUtil {
  static generate<ValueType>(
    type: ThreeMouseEventType,
    modelOrView: ClickableObject<ValueType> | IClickableObject3D<ValueType>
  ): ThreeMouseEvent<ValueType> {
    const e: ThreeMouseEvent<ValueType> = {
      type,
      model: ThreeMouseEventUtil.getModel(modelOrView),
    };

    if (type === "select") {
      e.isSelected = ThreeMouseEventUtil.getSelection(e.model);
    }
    return e;
  }

  private static getModel<ValueType>(
    modelOrView: ClickableObject<ValueType> | IClickableObject3D<ValueType>
  ): ClickableObject<ValueType> {
    if ("model" in modelOrView) {
      return modelOrView.model;
    }
    return modelOrView;
  }

  /**
   * SELECTイベントの場合は、対象ボタンの選択状態を取得
   * @param model
   */
  static getSelection<ValueType>(model: ClickableObject<ValueType>): boolean {
    if ("selection" in model) {
      return !!model["selection"];
    } else {
      throw new Error(
        "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。"
      );
    }
  }

  static clone<ValueType>(
    e: ThreeMouseEvent<ValueType>
  ): ThreeMouseEvent<ValueType> {
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
