import { BoxBufferGeometry, MeshBasicMaterial } from "three";
import {
  CheckBoxMesh,
  ClickableMesh,
  StateMaterialSet,
  ThreeMouseEvent,
  ThreeMouseEventType
} from "../src/index";

const spyWarn = jest.spyOn(console, "warn").mockImplementation(x => x);

describe("ThreeMouseEvent", () => {
  test("CheckBox以外でのイベント生成", () => {
    const geometry = new BoxBufferGeometry(3, 3, 3);
    const matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true
      })
    });

    const clickable = new ClickableMesh({
      geo: geometry,
      material: matSet
    });

    expect(() => {
      new ThreeMouseEvent(ThreeMouseEventType.SELECT, clickable);
    }).toThrowError("選択可能なボタン以外を引数にして");
  });

  test("clone", () => {
    const geometry = new BoxBufferGeometry(3, 3, 3);
    const matSet = new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true
      })
    });

    const clickable = new CheckBoxMesh({
      geo: geometry,
      material: matSet
    });

    const e = new ThreeMouseEvent(ThreeMouseEventType.SELECT, clickable);

    expect(e).toEqual(e.clone());
  });
});
