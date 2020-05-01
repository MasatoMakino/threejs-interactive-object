import { RadioButtonObject } from "./RadioButtonObject";
import { Mesh } from "three";

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
