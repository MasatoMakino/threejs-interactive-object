import { StateMaterialSet } from "./StateMaterial";
import { CheckBoxObject } from "./CheckBoxObject";
import { Geometry } from "three";
import { BufferGeometry } from "three";
import { Mesh } from "three";
import { ISelectableObject3D } from "./MouseEventManager";

export class CheckBoxMesh extends Mesh implements ISelectableObject3D {
  public model: CheckBoxObject;
  /**
   * コンストラクタ
   */
  constructor(parameters: {
    geo?: Geometry | BufferGeometry;
    material: StateMaterialSet;
  }) {
    super(parameters.geo);
    this.model = new CheckBoxObject({
      view: this,
      material: parameters.material
    });
  }
}
