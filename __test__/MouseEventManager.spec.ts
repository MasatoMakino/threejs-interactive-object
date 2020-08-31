import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import {
  ClickableMesh,
  ClickableState,
  MouseEventManager,
  StateMaterialSet,
} from "../src";
import { getMeshMaterialSet } from "./Materials";
import { MouseEventManagerScene } from "./MouseEventManagerScene";

describe("MouseEventManager", () => {
  const managerScene = new MouseEventManagerScene();
  const mat = getMeshMaterialSet();
  const btn = new ClickableMesh({
    geo: new BoxBufferGeometry(3, 3, 3),
    material: mat,
  });
  managerScene.scene.add(btn);
  const halfW = managerScene.canvas.width / 2;
  const halfH = managerScene.canvas.height / 2;

  test("Init", () => {
    expect(MouseEventManager.isInit).toBe(true);
    managerScene.reset();
  });

  test("mouse move", () => {
    checkMaterial(mat, ClickableState.NORMAL, btn);
    managerScene.render();

    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    managerScene.render();
    //スロットリングされるのでnormalのまま
    checkMaterial(mat, ClickableState.NORMAL, btn);

    //スロットリングされるのでnormalのまま
    managerScene.interval(0.1);
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    checkMaterial(mat, ClickableState.NORMAL, btn);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", halfW, halfH);
    checkMaterial(mat, ClickableState.OVER, btn);

    managerScene.interval();
    managerScene.dispatchMouseEvent("mousemove", 0, 0);
    checkMaterial(mat, ClickableState.NORMAL, btn);

    managerScene.reset();
  });

  test("mouse down", () => {
    checkMaterial(mat, ClickableState.NORMAL, btn);
    managerScene.render();

    managerScene.dispatchMouseEvent("mousedown", halfW, halfH);
    checkMaterial(mat, ClickableState.DOWN, btn);

    managerScene.dispatchMouseEvent("mouseup", halfW, halfH);
    checkMaterial(mat, ClickableState.NORMAL, btn);
  });
});

/**
 * マテリアルの状態を比較する
 * @param materialSet
 * @param state
 * @param target
 * @param mouseEnabled
 */
const checkMaterial = (
  materialSet: StateMaterialSet,
  state: ClickableState,
  target: Mesh,
  mouseEnabled: boolean = true
) => {
  const targetMat = target.material as MeshPhongMaterial;
  const setMat = materialSet.getMaterial(state, mouseEnabled)
    .material as MeshPhongMaterial;

  expect(targetMat.opacity).toBe(setMat.opacity);
  expect(targetMat.color).toBe(setMat.color);
};
