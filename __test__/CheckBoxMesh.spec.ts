import { MeshBasicMaterial, BoxBufferGeometry, Event } from "three";
import {
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
  CheckBoxMesh
} from "../src/index";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

describe("CheckBoxMesh", () => {
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

    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("set / get selection", () => {
    expect(checkbox.selection).toBe(false);

    checkbox.selection = true;
    expect(checkbox.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    checkbox.selection = false;
    expect(checkbox.selection).toBe(false);
    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("click", () => {
    const spy = jest
      .spyOn(checkbox, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    //クリックして選択
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
    expect(checkbox.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.overSelect.material);

    //クリックして選択解除
    checkbox.onMouseDownHandler(
      new ThreeMouseEvent(ThreeMouseEventType.DOWN, checkbox)
    );
    expect(checkbox.material).toBe(matSet.downSelect.material);
    checkbox.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, checkbox)
    );
    expect(checkbox.selection).toBe(false);
    expect(checkbox.material).toBe(matSet.over.material);
  });
});
