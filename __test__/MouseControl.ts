import { Event } from "three";
import {
  ClickableMesh,
  ClickableSprite,
  IClickableObject3D,
  MouseEventManager,
  StateMaterial,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
} from "../src/index";

/**
 * 対象のボタンをクリックする
 * @param {IRadioButtonObject3D} button
 */
export function clickButton(button: IClickableObject3D) {
  button.model.onMouseOverHandler(
    new ThreeMouseEvent(ThreeMouseEventType.OVER, button)
  );
  button.model.onMouseDownHandler(
    new ThreeMouseEvent(ThreeMouseEventType.DOWN, button)
  );
  button.model.onMouseUpHandler(
    new ThreeMouseEvent(ThreeMouseEventType.UP, button)
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

export function testFrozen(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet
) {
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.normal);
  target.model.frozen = true;
  changeMaterialState(target, ThreeMouseEventType.OVER, matSet.normal);
  changeMaterialState(target, ThreeMouseEventType.DOWN, matSet.normal);
  changeMaterialState(target, ThreeMouseEventType.UP, matSet.normal);
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.normal);

  target.model.frozen = false;
  changeMaterialState(target, ThreeMouseEventType.OVER, matSet.over);
  changeMaterialState(target, ThreeMouseEventType.OUT, matSet.normal);
}

/**
 * mouse enable / disableのスイッチングをテストする。
 * @param target
 * @param matSet
 */
export function testSwitch(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet
) {
  target.model.switchEnable(false);
  expect(target.material).toBe(matSet.disable.material);

  target.model.switchEnable(true);
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
    new ThreeMouseEvent(ThreeMouseEventType.UP, target)
  );
  expect(spy).toHaveBeenLastCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.UP, target)
  );
}

/**
 * マウスイベントハンドラーを順に呼び出してクリックを行う。
 * クリックイベントが正常にdispatchされることをテストする。
 * @param target
 */
export function testClick(target: ClickableMesh | ClickableSprite) {
  const spy = jest
    .spyOn(target, "dispatchEvent")
    .mockImplementation((e: Event) => null);

  clickButton(target);
  expect(spy).toHaveBeenLastCalledWith(
    new ThreeMouseEvent(ThreeMouseEventType.CLICK, target)
  );
}
