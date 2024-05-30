import { expect, vi } from "vitest";
import {
  ClickableMesh,
  ClickableSprite,
  IClickableObject3D,
  MouseEventManager,
  StateMaterial,
  StateMaterialSet,
  ThreeMouseEventMap,
  ThreeMouseEventUtil,
} from "../src/index.js";

/**
 * 対象のボタンをクリックする
 * @param {IClickableObject3D} button
 */
export function clickButton(button: IClickableObject3D<unknown>) {
  button.interactionHandler.onMouseOverHandler(
    ThreeMouseEventUtil.generate("over", button),
  );
  button.interactionHandler.onMouseDownHandler(
    ThreeMouseEventUtil.generate("down", button),
  );
  button.interactionHandler.onMouseUpHandler(
    ThreeMouseEventUtil.generate("up", button),
  );
}

/**
 * イベントタイプを指定して、IClickableObject3Dの対応するマウスイベントハンドラーを呼び出す。
 * そのあと、マテリアル状態の評価を行う
 * @param {ClickableMesh | ClickableSprite} target
 * @param {keyof ThreeMouseEventMap} type
 * @param {StateMaterial} mat
 */
export function changeMaterialState(
  target: ClickableMesh | ClickableSprite,
  type: keyof ThreeMouseEventMap,
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
  target.interactionHandler.disable();
  changeMaterialState(target, "over", matSet.disable);
  changeMaterialState(target, "down", matSet.disable);
  changeMaterialState(target, "up", matSet.disable);
  changeMaterialState(target, "out", matSet.disable);

  target.interactionHandler.enable();
  changeMaterialState(target, "over", matSet.over);
  changeMaterialState(target, "out", matSet.normal);
}

export function testFrozen(
  target: ClickableMesh | ClickableSprite,
  matSet: StateMaterialSet,
) {
  changeMaterialState(target, "out", matSet.normal);
  target.interactionHandler.frozen = true;
  changeMaterialState(target, "over", matSet.normal);
  changeMaterialState(target, "down", matSet.normal);
  changeMaterialState(target, "up", matSet.normal);
  changeMaterialState(target, "out", matSet.normal);

  target.interactionHandler.frozen = false;
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
  target.interactionHandler.switchEnable(false);
  expect(target.material).toBe(matSet.disable.material);

  target.interactionHandler.switchEnable(true);
  expect(target.material).toBe(matSet.normal.material);
}

/**
 * マウスアップを行う。
 * マウスアップのみではClickイベントが実行されないことをテストする。
 * @param {ClickableMesh | ClickableSprite} target
 */
export function testMouseUP(target: ClickableMesh | ClickableSprite) {
  const spyUp = vi.fn((e) => {});
  const spyClick = vi.fn((e) => {});
  target.interactionHandler.on("click", spyClick);
  target.interactionHandler.on("up", spyUp);

  target.interactionHandler.onMouseUpHandler(
    ThreeMouseEventUtil.generate("up", target),
  );
  expect(spyUp).toBeCalled();
  expect(spyClick).not.toBeCalled();
}

/**
 * マウスイベントハンドラーを順に呼び出してクリックを行う。
 * クリックイベントが正常にdispatchされることをテストする。
 * @param target
 */
export function testClick(target: ClickableMesh | ClickableSprite) {
  const spyClick = vi.fn((e) => {});
  target.interactionHandler.on("click", spyClick);
  clickButton(target);
  expect(spyClick).toBeCalled();
}
