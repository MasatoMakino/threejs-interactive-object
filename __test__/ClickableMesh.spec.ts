import { MeshBasicMaterial, BoxBufferGeometry, Event } from "three";
import {
  ClickableMesh,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType
} from "../src/index";
import { getMeshMaterialSet } from "../__test__/Materials";
import { clickButton, changeMaterialState } from "../__test__/MouseControl";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

describe("ClickableMesh", () => {
  let clickable: ClickableMesh;
  const matSet: StateMaterialSet = getMeshMaterialSet();

  test("初期化", () => {
    clickable = new ClickableMesh({
      geo: new BoxBufferGeometry(3, 3, 3),
      material: matSet
    });
    expect(clickable.material).toBe(matSet.normal.material);
  });

  test("マウスオーバー/アウト", () => {
    changeMaterialState(clickable, ThreeMouseEventType.OVER, matSet.over);
    changeMaterialState(clickable, ThreeMouseEventType.OUT, matSet.normal);
    changeMaterialState(clickable, ThreeMouseEventType.OVER, matSet.over);
    changeMaterialState(clickable, ThreeMouseEventType.OUT, matSet.normal);
  });

  test("disable", () => {
    clickable.disable();
    changeMaterialState(clickable, ThreeMouseEventType.OVER, matSet.disable);
    changeMaterialState(clickable, ThreeMouseEventType.DOWN, matSet.disable);
    changeMaterialState(clickable, ThreeMouseEventType.UP, matSet.disable);
    changeMaterialState(clickable, ThreeMouseEventType.OUT, matSet.disable);

    clickable.enable();
    changeMaterialState(clickable, ThreeMouseEventType.OVER, matSet.over);
    changeMaterialState(clickable, ThreeMouseEventType.OUT, matSet.normal);
  });

  test("switch", () => {
    clickable.switchEnable(false);
    expect(clickable.getEnable()).toBe(false);

    clickable.switchEnable(true);
    expect(clickable.getEnable()).toBe(true);
  });

  test("マウスアップ", () => {
    const spy = jest
      .spyOn(clickable, "dispatchEvent")
      .mockImplementation((e: Event) => null);
    clickable.onMouseUpHandler(
      new ThreeMouseEvent(ThreeMouseEventType.UP, clickable)
    );
    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.UP, clickable)
    );
  });

  test("マウスダウン/クリック", () => {
    const spy = jest
      .spyOn(clickable, "dispatchEvent")
      .mockImplementation((e: Event) => null);

    clickButton(clickable);
    expect(spy).toHaveBeenLastCalledWith(
      new ThreeMouseEvent(ThreeMouseEventType.CLICK, clickable)
    );
  });

  test("alpha", () => {
    clickable.alpha = 0.5;
    expect(
      (clickable.materialSet.normal.material as MeshBasicMaterial).opacity
    ).toBe(0.3);
    expect(
      (clickable.materialSet.over.material as MeshBasicMaterial).opacity
    ).toBe(0.4);
    expect(
      (clickable.materialSet.down.material as MeshBasicMaterial).opacity
    ).toBe(0.5);
  });
});
