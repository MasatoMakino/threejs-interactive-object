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
import { StateMaterialSet } from "../src/index";

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

/**
 * マウスオーバー状態での反応をテストする。
 * @param {ClickableMesh | ClickableSprite} target
 * @param {StateMaterialSet} matSet
 */
export function testMouseOver(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet
): void {
  changeMaterialState(target, ThreeMouseEventType.OVER, matSet.over);
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.normal);
  changeMaterialState(target, ThreeMouseEventType.OVER, matSet.over);
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.normal);
}

/**
 * disable状態での反応をテストする。
 * disable状態ではどの操作をしてもmaterialはdisableを維持する。
 * @param {ClickableMesh | ClickableSprite} target
 * @param {StateMaterialSet} matSet
 */
export function testDisable(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet
) {
  target.disable();
  changeMaterialState(target, ThreeMouseEventType.OVER, matSet.disable);
  changeMaterialState(target, ThreeMouseEventType.DOWN, matSet.disable);
  changeMaterialState(target, ThreeMouseEventType.UP, matSet.disable);
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.disable);

  target.enable();
  changeMaterialState(target, ThreeMouseEventType.OVER, matSet.over);
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.normal);
}

/**
 * mouse enable / disableのスイッチングをテストする。
 * @param {ClickableMesh | ClickableSprite} target
 */
export function testSwitch(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet
) {
  target.switchEnable(false);
  expect(target.getEnable()).toBe(false);
  expect(target.material).toBe(matSet.disable.material);

  target.switchEnable(true);
  expect(target.getEnable()).toBe(true);
  expect(target.material).toBe(matSet.normal.material);
}
