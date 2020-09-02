import { Mesh } from "three";
import { RadioButtonObject } from "./RadioButtonObject";

export class RadioButtonMesh extends Mesh {
  /**
   * コンストラクタ
   */
  constructor(parameters) {
    super(parameters.geo);
    this.model = new RadioButtonObject({
      view: this,
      material: parameters.material,
    });
  }
}
