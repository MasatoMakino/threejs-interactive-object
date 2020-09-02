import { BufferGeometry, Geometry, Mesh } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { IClickableObject3D } from "./MouseEventManager";
import { StateMaterialSet } from "./StateMaterial";

export class CheckBoxMesh extends Mesh implements IClickableObject3D {
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
      material: parameters.material,
    });
  }
}
