import { Event } from "three";
import {
  ClickableMesh,
  ClickableSprite,
  IClickableObject3D,
  MouseEventManager,
  StateMaterial,
  StateMaterialSet,
  ThreeMouseEventType,
  ThreeMouseEventUtil,
} from "../src/index.js";

/**
 * 対象のボタンをクリックする
 * @param {IClickableObject3D} button
 */
export function clickButton(button: IClickableObject3D<unknown>) {
  button.model.onMouseOverHandler(ThreeMouseEventUtil.generate("over", button));
  button.model.onMouseDownHandler(ThreeMouseEventUtil.generate("down", button));
  button.model.onMouseUpHandler(ThreeMouseEventUtil.generate("up", button));
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
  mat: StateMaterial,
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
  matSet: StateMaterialSet,
): void {
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
}

/**
 * disable状態での反応をテストする。
 * disable状態ではどの操作をしてもmaterialはdisableを維持する。
 * @param {ClickableMesh | ClickableSprite} target
 * @param {StateMaterialSet} matSet
 */
export function testDisable(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
) {
  target.model.disable();
  changeMaterialState(target, "over", matSet.disable);
  changeMaterialState(target, "down", matSet.disable);
  changeMaterialState(target, "up", matSet.disable);
  changeMaterialState(target, "out", matSet.disable);

  target.model.enable();
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
}

export function testFrozen(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
) {
  changeMaterialState(target, "out", matSet.normal);
  target.model.frozen = true;
  changeMaterialState(target, "over", matSet.normal);
  changeMaterialState(target, "down", matSet.normal);
  changeMaterialState(target, "up", matSet.normal);
  changeMaterialState(target, "out", matSet.normal);

  target.model.frozen = false;
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
}

/**
 * mouse enable / disableのスイッチングをテストする。
 * @param target
 * @param matSet
 */
export function testSwitch(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
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
  target.model.onMouseUpHandler(ThreeMouseEventUtil.generate("up", target));
  expect(spy).toHaveBeenLastCalledWith(
    ThreeMouseEventUtil.generate("up", target),
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
    ThreeMouseEventUtil.generate("click", target),
  );
}
