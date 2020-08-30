import { BufferGeometry, Geometry, Mesh } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export declare class RadioButtonMesh
  extends Mesh
  implements IRadioButtonObject3D {
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
