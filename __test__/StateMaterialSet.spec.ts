import { type Material, MeshBasicMaterial } from "three";
import { describe, expect, test, vi } from "vitest";
import { StateMaterial, StateMaterialSet } from "../src/index.js";

const _spyWarn = vi.spyOn(console, "warn").mockImplementation((x) => x);

describe("StateMaterial", () => {
  let mat: StateMaterial;
  let matArray: Material[];

  test("constructor : Material array", () => {
    matArray = [
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.4,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.2,
        transparent: true,
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.1,
        transparent: true,
      }),
    ];
    mat = new StateMaterial(matArray);

    expect((mat.material as Material[])[0].opacity).toBe(0.6);
  });

  test("updateAlpha : Material array", () => {
    mat.setOpacity(0.5);
    const array = mat.material as Material[];
    expect(array[0].opacity).toBe(0.3);
    expect(array[1].opacity).toBe(0.25);
    expect(array[2].opacity).toBe(0.2);
    expect(array[3].opacity).toBe(0.15);
    expect(array[4].opacity).toBe(0.1);
    expect(array[5].opacity).toBe(0.05);
  });
});

describe("StateMaterialSet", () => {
  const getMatSet = () => {
    return new StateMaterialSet({
      normal: new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true,
      }),
    });
  };
  test("constructor : normalマテリアルのみ", () => {
    const matSet = getMatSet();
    expect(matSet.down).toBe(matSet.normal);
  });

  test("constructor : 任意のマテリアルの取得", () => {
    const matSet = getMatSet();
    matSet.overSelect = new StateMaterial(
      new MeshBasicMaterial({
        color: 0xff66ff,
        opacity: 0.6,
        transparent: true,
      }),
    );

    const mat = matSet.getMaterial("over", true, true);

    expect(mat).toBe(matSet.overSelect);
    expect(mat).not.toBe(matSet.over);
    expect(mat).not.toBe(matSet.normal);
  });
});
