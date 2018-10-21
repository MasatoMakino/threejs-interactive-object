import { StateMaterial, StateMaterialSet } from "../src/index";
import { MeshBasicMaterial, MeshMaterialType, Event } from "three";


describe("StateMaterial", () => {
  let mat: StateMaterial;
  let matArray: MeshMaterialType[];

  test("constructor : Material array", () => {
    matArray = [
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.6,
        transparent: true
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.4,
        transparent: true
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.3,
        transparent: true
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.2,
        transparent: true
      }),
      new MeshBasicMaterial({
        color: 0xffffff,
        opacity: 0.1,
        transparent: true
      })
    ];
    mat = new StateMaterial(matArray);

    expect((mat.material as MeshMaterialType[])[0].opacity).toBe(0.6);
  });

  test("updateAlpha : Material array", () => {
    mat.setOpacity(0.5);
    const array = mat.material as MeshMaterialType[];
    expect(array[0].opacity).toBe(0.3);
    expect(array[1].opacity).toBe(0.25);
    expect(array[2].opacity).toBe(0.2);
    expect(array[3].opacity).toBe(0.15);
    expect(array[4].opacity).toBe(0.1);
    expect(array[5].opacity).toBe(0.05);
  });
});

describe("StateMaterialSet", () => {
  let matSet: StateMaterialSet;

  test("constructor : normalマテリアルのみ", ()=>{

    matSet = new StateMaterialSet({
        normal: new MeshBasicMaterial({
            color: 0xffffff,
            opacity: 0.6,
            transparent: true
        })
    });

    expect(matSet.down).toBe(matSet.normal);

  })


});
