import { ClickableObject, IClickableObject3D } from "./index.js";

export interface ThreeMouseEventMap<T = any> {
  click: (e: ThreeMouseEvent<T>) => void;
  over: (e: ThreeMouseEvent<T>) => void;
  out: (e: ThreeMouseEvent<T>) => void;
  down: (e: ThreeMouseEvent<T>) => void;
  up: (e: ThreeMouseEvent<T>) => void;
  select: (e: ThreeMouseEvent<T>) => void;
}
export interface ThreeMouseEvent<Value> {
  type: keyof ThreeMouseEventMap<Value>;
  readonly model?: ClickableObject<Value>;
  readonly isSelected?: boolean;
}

export class ThreeMouseEventUtil {
  static generate<Value>(
    type: keyof ThreeMouseEventMap<Value>,
    modelOrView: ClickableObject<Value> | IClickableObject3D<Value> | undefined,
  ): ThreeMouseEvent<Value> {
    const model = ThreeMouseEventUtil.getModel(modelOrView);
    const getSelection = () => {
      if (type === "select") {
        return ThreeMouseEventUtil.getSelection(model);
      }
      return undefined;
    };

    return {
      type,
      model,
      isSelected: getSelection(),
    };
  }

  private static getModel<Value>(
    modelOrView: ClickableObject<Value> | IClickableObject3D<Value> | undefined,
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
    model: ClickableObject<Value> | undefined,
  ): boolean {
    if (model != null && "selection" in model) {
      return !!model["selection"];
    } else {
      throw new Error(
        "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。",
      );
    }
  }

  static clone<Value>(e: ThreeMouseEvent<Value>): ThreeMouseEvent<Value> {
    return ThreeMouseEventUtil.generate(e.type, e.model);
  }
}
