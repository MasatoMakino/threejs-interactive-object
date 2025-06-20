import type { IClickableObject3D } from "./index.js";
import type { ButtonInteractionHandler } from "./interactionHandler";
import type { ThreeMouseEvent, ThreeMouseEventMap } from "./ThreeMouseEvent.js";

/**
 * Gets the interaction handler from either a handler or a view
 */
function getInteractionHandler<Value>(
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
export function getSelection<Value>(
  interactionHandler: ButtonInteractionHandler<Value> | undefined,
): boolean {
  if (interactionHandler != null && "selection" in interactionHandler) {
    return !!interactionHandler.selection;
  } else {
    throw new Error(
      "選択可能なボタン以外を引数にして、SELECTイベントをインスタンス化しました。SELECTイベントはISelectableObject3Dを実装したクラスとともにインスタンス化してください。",
    );
  }
}

/**
 * Generate a ThreeMouseEvent
 */
export function generate<Value>(
  type: keyof ThreeMouseEventMap<Value>,
  handlerOrView:
    | ButtonInteractionHandler<Value>
    | IClickableObject3D<Value>
    | undefined,
): ThreeMouseEvent<Value> {
  const interactionHandler = getInteractionHandler(handlerOrView);
  const getSelectionValue = () => {
    if (type === "select") {
      return getSelection(interactionHandler);
    }
    return undefined;
  };

  return {
    type,
    interactionHandler,
    isSelected: getSelectionValue(),
  };
}

/**
 * Clone a ThreeMouseEvent
 */
export function clone<Value>(
  e: ThreeMouseEvent<Value>,
): ThreeMouseEvent<Value> {
  return generate(e.type, e.interactionHandler);
}
