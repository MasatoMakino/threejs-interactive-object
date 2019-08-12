import { StateMaterialSet } from "./StateMaterial";
import { CheckBoxObject } from "./CheckBoxObject";
import { Geometry } from "three";
import { BufferGeometry } from "three";
import { Mesh } from "three";
import { ISelectableObject3D } from "./MouseEventManager";
export declare class CheckBoxMesh extends Mesh implements ISelectableObject3D {
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