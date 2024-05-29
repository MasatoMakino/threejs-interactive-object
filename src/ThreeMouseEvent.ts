import { ButtonInteractionHandler, IClickableObject3D } from "./index.js";

export interface ThreeMouseEventMap<T = any> {
  click: (e: ThreeMouseEvent<T>) => void;
  over: (e: ThreeMouseEvent<T>) => void;
  out: (e: ThreeMouseEvent<T>) => void;
  down: (e: ThreeMouseEvent<T>) => void;
  up: (e: ThreeMouseEvent<T>) => void;
  select: (e: ThreeMouseEvent<T>) => void;
}
export interface ThreeMouseEvent<Value> {
  readonly type: keyof ThreeMouseEventMap<Value>;
  readonly interactionHandler?: ButtonInteractionHandler<Value>;
  readonly isSelected?: boolean;
}

export class ThreeMouseEventUtil {
  static generate<Value>(
    type: keyof ThreeMouseEventMap<Value>,
    handlerOrView:
      | ButtonInteractionHandler<Value>
      | IClickableObject3D<Value>
      | undefined,
  ): ThreeMouseEvent<Value> {
    const interactionHandler =
      ThreeMouseEventUtil.getInteractionHandler(handlerOrView);
    const getSelection = () => {
      if (type === "select") {
        return ThreeMouseEventUtil.getSelection(interactionHandler);
      }
      return undefined;
    };

    return {
      type,
      interactionHandler,
      isSelected: getSelection(),
    };
  }

  private static getInteractionHandler<Value>(
    handlerOrView:
      | ButtonInteractionHandler<Value>
      | IClickableObject3D<Value>
      | undefined,
  ): ButtonInteractionHandler<Value> | undefined {
    if (handlerOrView != null && "interactionHandler" in handlerOrView) {
      return handlerOrView.interactionHandler;
    }
    return handlerOrView;
  }

  /**
   * SELECTイベントの場合は、対象ボタンの選択状態を取得
   * @param interactionHandler
   */
  static getSelection<Value>(
    interactionHandler: ButtonInteractionHandler<Value> | undefined,
  ): boolean {
    if (interactionHandler != null && "selection" in interactionHandler) {
      return !!interactionHandler["selection"];
    } else {
      throw new Error(
        "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。",
      );
    }
  }

  static clone<Value>(e: ThreeMouseEvent<Value>): ThreeMouseEvent<Value> {
    return ThreeMouseEventUtil.generate(e.type, e.interactionHandler);
  }
}
