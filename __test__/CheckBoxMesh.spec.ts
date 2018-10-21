import {
  Scene,
  PerspectiveCamera,
  MeshBasicMaterial,
  BoxBufferGeometry
} from "three";
import {
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
  CheckBoxMesh
} from "../src/index";
import { Event } from "three";

const W = 1920;
const H = 1080;

describe("CheckBoxMesh", () => {
  // シーンを作成
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, W / H, 1, 400);
  camera.position.set(0, 0, 100);
  scene.add(camera);

  let checkbox: CheckBoxMesh;
  let matSet: StateMaterialSet;

  test("初期化", () => {
    const geometry = new BoxBufferGeometry(3, 3, 3);
    matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true
      }),
      over: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.8,
        transparent: true
      }),
      down: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 1.0,
        transparent: true
      }),
      normalSelect: new MeshBasicMaterial({
        color: 0xff00ff,
        opacity: 0.65,
        transparent: true
      }),
      overSelect: new MeshBasicMaterial({
        color: 0xff00ff,
        opacity: 0.85,
        transparent: true
      }),
      downSelect: new MeshBasicMaterial({
        color: 0xff00ff,
        opacity: 0.95,
        transparent: true
      })
    });

    checkbox = new CheckBoxMesh({
      geo: geometry,
      material: matSet
    });
    scene.add(checkbox);

    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("set / get selection", () => {
    expect(checkbox.getSelection()).toBe(false);

    checkbox.setSelection(true);
    expect(checkbox.getSelection()).toBe(true);
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    checkbox.setSelection(false);
    expect(checkbox.getSelection()).toBe(false);
    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("click", () => {
    const spy = jest
      .spyOn(checkbox, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    checkbox.onMouseOverHandler(
      new ThreeMouseEvent(ThreeMouseEventType.OVER, checkbox)
    );
    checkbox.onMouseDownHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, checkbox)
    );
    checkbox.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, checkbox)
    );

    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.CLICK, checkbox)
    );
    expect(checkbox.getSelection()).toBe(true);
    expect(checkbox.material).toBe(matSet.overSelect.material);
  });
});
