import { BoxBufferGeometry, Event } from "three";
import {
  CheckBoxMesh,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType,
} from "../src/index";
import { getMeshMaterialSet } from "./Materials";
import { changeMaterialState, clickButton } from "./MouseControl";

const spyWarn = jest.spyOn(console, "warn").mockImplementation((x) => x);

describe("CheckBoxMesh", () => {
  let checkbox: CheckBoxMesh;
  const matSet: StateMaterialSet = getMeshMaterialSet();

  test("初期化", () => {
    const geometry = new BoxBufferGeometry(3, 3, 3);

    checkbox = new CheckBoxMesh({
      geo: geometry,
      material: matSet,
    });

    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("set / get selection", () => {
    expect(checkbox.model.selection).toBe(false);

    checkbox.model.selection = true;
    expect(checkbox.model.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.normalSelect.material);

    checkbox.model.selection = false;
    expect(checkbox.model.selection).toBe(false);
    expect(checkbox.material).toBe(matSet.normal.material);
  });

  test("click", () => {
    const spy = jest
      .spyOn(checkbox, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    //クリックして選択
    clickButton(checkbox);
    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.CLICK, checkbox)
    );
    expect(checkbox.model.selection).toBe(true);
    expect(checkbox.material).toBe(matSet.overSelect.material);

    //クリックして選択解除
    changeMaterialState(checkbox, ThreeMouseEventType.DOWN, matSet.downSelect);
    changeMaterialState(checkbox, ThreeMouseEventType.UP, matSet.over);
    expect(checkbox.model.selection).toBe(false);
  });
});
