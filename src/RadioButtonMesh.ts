import { BufferGeometry, Geometry, Mesh } from "three";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export class RadioButtonMesh extends Mesh implements IClickableObject3D {
  public model: RadioButtonObject;
  /**
   * コンストラクタ
   */
  constructor(parameters: {
    geo?: Geometry | BufferGeometry;
    material: StateMaterialSet;
  }) {
    super(parameters.geo);
    this.model = new RadioButtonObject({
      view: this,
      material: parameters.material,
    });
  }
}
