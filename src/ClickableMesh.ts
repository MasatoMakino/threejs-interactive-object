import { IClickableObject3D } from "./MouseEventManager";
import { BufferGeometry, Geometry, Mesh } from "three";
import { StateMaterialSet } from "./StateMaterial";
import { ClickableObject } from "./ClickableObject";

/**
 * クリックに反応するMesh。
 */
export class ClickableMesh extends Mesh implements IClickableObject3D {
  public model: ClickableObject;
  /**
   * コンストラクタ
   */
  constructor(parameters: {
    geo?: Geometry | BufferGeometry;
    material: StateMaterialSet;
  }) {
    super(parameters.geo);
    this.model = new ClickableObject({
      view: this,
      material: parameters.material
    });
  }
}
