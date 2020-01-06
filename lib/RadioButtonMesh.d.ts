import { StateMaterialSet } from "./StateMaterial";
import { RadioButtonObject } from "./RadioButtonObject";
import { Mesh } from "three";
import { Geometry } from "three";
import { BufferGeometry } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";
export declare class RadioButtonMesh extends Mesh
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
