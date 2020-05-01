import { CheckBoxObject } from "./CheckBoxObject";
import { Mesh } from "three";

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
