import { BufferGeometry, Geometry, Mesh } from "three";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export declare class RadioButtonMesh
  extends Mesh
  implements IClickableObject3D {
  model: RadioButtonObject;
  /**
   * コンストラクタ
   */
  constructor(parameters: {
    geo?: Geometry | BufferGeometry;
    material: StateMaterialSet;
  });
}
//# sourceMappingURL=RadioButtonMesh.d.ts.map
