import { RAFTicker, RAFTickerEventType } from "raf-ticker";
import { BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import {
  ClickableMesh,
  ClickableState,
  MouseEventManager,
  StateMaterialSet,
} from "../src";
import { getMeshMaterialSet } from "./Materials";
import { generateScene } from "./MouseEventManagerGenerator";

describe("MouseEventManager", () => {
  const { scene, canvas, renderer, camera } = generateScene();

  test("Init", () => {
    expect(MouseEventManager.isInit).toBe(true);
    resetManager(canvas);
  });

  test("mouse move", () => {
    const mat = getMeshMaterialSet();
    const btn = new ClickableMesh({
      geo: new BoxBufferGeometry(3, 3, 3),
      material: mat,
    });
    scene.add(btn);
    checkMaterial(mat, ClickableState.NORMAL, btn);
    renderer.render(scene, camera);

    const margin = getOffset(canvas);

    const e1 = new MouseEvent("mousemove", { clientX: 0, clientY: 0 });
    canvas.dispatchEvent(e1);
    const e2 = new MouseEvent("mousemove", {
      clientX: canvas.width / 2 + margin.x,
      clientY: canvas.height / 2 + margin.y,
    });
    canvas.dispatchEvent(e2);

    //スロットリングされるのでnormalのまま
    checkMaterial(mat, ClickableState.NORMAL, btn);

    RAFTicker.emit(RAFTickerEventType.tick, {
      timestamp: 0,
      delta: MouseEventManager.throttlingTime_ms * 3,
    });
    renderer.render(scene, camera);
    const e3 = new MouseEvent("mousemove", {
      clientX: canvas.width / 2 + margin.x,
      clientY: canvas.height / 2 + margin.y,
    });
    canvas.dispatchEvent(e3);
    checkMaterial(mat, ClickableState.OVER, btn);

    resetManager(canvas);
  });
});

/**
 * MouseEventManagerの状態を初期化する。
 * @param canvas
 */
const resetManager = (canvas: HTMLCanvasElement) => {
  const e = new MouseEvent("mouseup", { clientX: 0, clientY: 0 });
  canvas.dispatchEvent(e);
};

const getOffset = (canvas: HTMLCanvasElement) => {
  const spyClick = jest.fn((e) => e);
  canvas.addEventListener("mouseleave", spyClick);
  canvas.dispatchEvent(new MouseEvent("mouseleave"));
  const result = spyClick.mock.results[0].value;
  canvas.removeEventListener("mouseleave", spyClick);
  return {
    x: -result.offsetX,
    y: -result.offsetY,
  };
};

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
