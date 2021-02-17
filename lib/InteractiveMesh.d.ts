import { BufferGeometry, Mesh } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ClickableObject } from "./ClickableObject";
import { TConstructor } from "./InteractiveSprite";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";
interface InteractiveMeshParameters {
    geo?: BufferGeometry;
    material: StateMaterialSet;
}
declare class InteractiveMesh<T extends ClickableObject> extends Mesh implements IClickableObject3D {
    model: T;
    constructor(parameters: InteractiveMeshParameters, ctor: TConstructor<T>);
}
export declare class ClickableMesh extends InteractiveMesh<ClickableObject> implements IClickableObject3D {
    constructor(parameters: InteractiveMeshParameters);
}
export declare class CheckBoxMesh extends InteractiveMesh<CheckBoxObject> implements IClickableObject3D {
    constructor(parameters: InteractiveMeshParameters);
}
export declare class RadioButtonMesh extends InteractiveMesh<RadioButtonObject> implements IClickableObject3D {
    constructor(parameters: InteractiveMeshParameters);
}
export {};
//# sourceMappingURL=InteractiveMesh.d.ts.map