import {
  ThreeMouseEventType,
  IRadioButtonObject3D,
  ThreeMouseEvent
} from "../src/index";
import { IClickableObject3D } from "../src/index";
import { StateMaterial } from "../src/index";
import { ClickableMesh } from "../src/index";
import { ClickableSprite } from "../src/index";
import { MouseEventManager } from "../src/index";

/**
 * 対象のボタンをクリックする
 * @param {IRadioButtonObject3D} button
 */
export function clickButton(button: IClickableObject3D) {
  button.onMouseOverHandler(
    new ThreeMouseEvent(ThreeMouseEventType.OVER, button)
  );
  button.onMouseDownHandler(
    new ThreeMouseEvent(ThreeMouseEventType.DOWN, button)
  );
  button.onMouseUpHandler(new ThreeMouseEvent(ThreeMouseEventType.UP, button));
}

/**
 * イベントタイプを指定して、IClickableObject3Dの対応するマウスイベントハンドラーを呼び出す。
 * そのあと、マテリアル状態の評価を行う
 * @param {ClickableMesh | ClickableSprite} target
 * @param {ThreeMouseEventType} type
 * @param {StateMaterial} mat
 */
export function changeMaterialState(
  target: ClickableMesh | ClickableSprite,
  type: ThreeMouseEventType,
  mat: StateMaterial
): void {
  MouseEventManager.onButtonHandler(target, type);
  expect(target.material).toBe(mat.material);
}
