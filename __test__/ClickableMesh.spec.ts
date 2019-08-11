import { BoxBufferGeometry, MeshBasicMaterial } from "three";
import { ClickableMesh, StateMaterialSet } from "../src/index";
import { getMeshMaterialSet } from "../__test__/Materials";
import {
  testMouseOver,
  testDisable,
  testSwitch,
  testMouseUP,
  testClick
} from "../__test__/MouseControl";

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
    testMouseOver(clickable, matSet);
  });

  test("disable", () => {
    testDisable(clickable, matSet);
  });

  test("switch", () => {
    testSwitch(clickable, matSet);
  });

  test("マウスアップ", () => {
    testMouseUP(clickable);
  });

  test("マウスダウン/クリック", () => {
    testClick(clickable);
  });

  test("alpha", () => {
    clickable.model.alpha = 0.5;
    expect(
      (clickable.model.materialSet.normal.material as MeshBasicMaterial).opacity
    ).toBe(0.3);
    expect(
      (clickable.model.materialSet.over.material as MeshBasicMaterial).opacity
    ).toBe(0.4);
    expect(
      (clickable.model.materialSet.down.material as MeshBasicMaterial).opacity
    ).toBe(0.5);
  });
});
