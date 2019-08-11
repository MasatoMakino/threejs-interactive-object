import { StateMaterialSet } from "./StateMaterial";
import { RadioButtonObject } from "./RadioButtonObject";
import { Mesh } from "three";
import { Geometry } from "three";
import { BufferGeometry } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";

export class RadioButtonMesh extends Mesh implements IRadioButtonObject3D {
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
      material: parameters.material
    });
  }
}
