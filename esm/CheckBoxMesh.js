import { Mesh } from "three";
import { CheckBoxObject } from "./CheckBoxObject";

export class CheckBoxMesh extends Mesh {
  /**
   * コンストラクタ
   */
  constructor(parameters) {
    super(parameters.geo);
    this.model = new CheckBoxObject({
      view: this,
      material: parameters.material,
    });
  }
}
