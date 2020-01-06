import { IClickableObject3D } from "./MouseEventManager";
import { BufferGeometry, Geometry, Mesh } from "three";
import { StateMaterialSet } from "./StateMaterial";
import { ClickableObject } from "./ClickableObject";
/**
 * クリックに反応するMesh。
 */
export declare class ClickableMesh extends Mesh implements IClickableObject3D {
  model: ClickableObject;
  /**
   * コンストラクタ
   */
  constructor(parameters: {
    geo?: Geometry | BufferGeometry;
    material: StateMaterialSet;
  });
}
//# sourceMappingURL=ClickableMesh.d.ts.map
