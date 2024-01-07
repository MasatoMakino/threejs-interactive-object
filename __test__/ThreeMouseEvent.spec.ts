import { describe, expect, test, vi } from "vitest";
import { BoxGeometry, MeshBasicMaterial } from "three";
import {
  CheckBoxMesh,
  ClickableMesh,
  StateMaterialSet,
  ThreeMouseEventUtil,
} from "../src/index.js";

const spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

describe("ThreeMouseEvent", () => {
  test("CheckBox以外でのイベント生成", () => {
    const geometry = new BoxGeometry(3, 3, 3);
    const matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
    });

    const clickable = new ClickableMesh({
      geo: geometry,
      material: matSet,
    });

    expect(() => {
      ThreeMouseEventUtil.generate("select", clickable);
    }).toThrowError("選択可能なボタン以外を引数にして");
  });

  test("clone", () => {
    const geometry = new BoxGeometry(3, 3, 3);
    const matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
    });

    const clickable = new CheckBoxMesh({
      geo: geometry,
      material: matSet,
    });

    const e = ThreeMouseEventUtil.generate("select", clickable);

    expect(e).toEqual(ThreeMouseEventUtil.clone(e));
  });
});
