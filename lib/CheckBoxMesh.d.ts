import { BufferGeometry, Geometry, Mesh } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { IClickableObject3D } from "./MouseEventManager";
import { StateMaterialSet } from "./StateMaterial";

export declare class CheckBoxMesh extends Mesh implements IClickableObject3D {
  model: CheckBoxObject;
  /**
   * コンストラクタ
   */
  constructor(parameters: {
    geo?: Geometry | BufferGeometry;
    material: StateMaterialSet;
  });
}
//# sourceMappingURL=CheckBoxMesh.d.ts.map
