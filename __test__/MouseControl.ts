import {
  IRadioButtonObject3D,
  ThreeMouseEvent,
  ThreeMouseEventType,
  IClickableObject3D,
  StateMaterial,
  ClickableMesh,
  ClickableSprite,
  MouseEventManager,
  StateMaterialSet
} from "../src/index";
import { Event } from "three";

/**
 * 対象のボタンをクリックする
 * @param {IRadioButtonObject3D} button
 */
export function clickButton(button: IClickableObject3D) {
  button.model.onMouseOverHandler(
    new ThreeMouseEvent(ThreeMouseEventType.OVER, button.model)
  );
  button.model.onMouseDownHandler(
    new ThreeMouseEvent(ThreeMouseEventType.DOWN, button.model)
  );
  button.model.onMouseUpHandler(
    new ThreeMouseEvent(ThreeMouseEventType.UP, button.model)
  );
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
  target.model.disable();
  changeMaterialState(target, ThreeMouseEventType.OVER, matSet.disable);
  changeMaterialState(target, ThreeMouseEventType.DOWN, matSet.disable);
  changeMaterialState(target, ThreeMouseEventType.UP, matSet.disable);
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.disable);

  target.model.enable();
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
  target.model.switchEnable(false);
  expect(target.model.getEnable()).toBe(false);
  expect(target.material).toBe(matSet.disable.material);

  target.model.switchEnable(true);
  expect(target.model.getEnable()).toBe(true);
  expect(target.material).toBe(matSet.normal.material);
}

/**
 * マウスアップを行う。
 * マウスアップのみではClickイベントが実行されないことをテストする。
 * @param {ClickableMesh | ClickableSprite} target
 */
export function testMouseUP(target: ClickableMesh | ClickableSprite) {
  const spy = jest
    .spyOn(target, "dispatchEvent")
    .mockImplementation((e: Event) => null);
  target.model.onMouseUpHandler(
    new ThreeMouseEvent(ThreeMouseEventType.UP, target.model)
  );
  expect(spy).toHaveBeenLastCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.UP, target.model)
  );
}

/**
 * マウスイベントハンドラーを順に呼び出してクリックを行う。
 * クリックイベントが正常にdispatchされることをテストする。
 * @param {ClickableMesh | ClickableSprite} target
 */
export function testClick(target: ClickableMesh | ClickableSprite) {
  const spy = jest
    .spyOn(target, "dispatchEvent")
    .mockImplementation((e: Event) => null);

  clickButton(target);
  expect(spy).toHaveBeenLastCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.CLICK, target.model)
  );
}
