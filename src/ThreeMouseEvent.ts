import { Event } from "three";
import { ClickableObject, IClickableObject3D } from "./";
export interface ThreeMouseEvent<T = any> extends Event {
  type: ThreeMouseEventType;
  model?: ClickableObject<T>;
  isSelected?: boolean;
}

export class ThreeMouseEventUtil {
  static generate<T>(
    type: ThreeMouseEventType,
    modelOrView: ClickableObject<T> | IClickableObject3D<T>
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

  private static getModel<T>(
    modelOrView: ClickableObject<T> | IClickableObject3D<T>
  ): ClickableObject<T> {
    if ("model" in modelOrView) {
      return modelOrView.model;
    }
    return modelOrView;
  }

  /**
   * SELECTイベントの場合は、対象ボタンの選択状態を取得
   * @param model
   */
  static getSelection<T>(model: ClickableObject<T>): boolean {
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
