import { BufferGeometry, Mesh } from "three";
import {
  CheckBoxObject,
  ClickableObject,
  IClickableObject3D,
  RadioButtonObject,
  StateMaterialSet,
  TConstructor,
} from "./";

export interface InteractiveMeshParameters {
  geo?: BufferGeometry;
  material: StateMaterialSet;
}

// TODO remove : InteractiveMesh IClickableObject3Dで十分に型定義の役割を果たすため。
class InteractiveMesh<ValueType, T extends ClickableObject<ValueType>>
  extends Mesh
  implements IClickableObject3D<ValueType>
{
  public model: T;

  constructor(parameters: InteractiveMeshParameters, ctor: TConstructor<T>) {
    super(parameters.geo);
    this.model = new ctor({ view: this, material: parameters.material });
  }
}

export class ClickableMesh<ValueType = any>
  extends InteractiveMesh<ValueType, ClickableObject<ValueType>>
  implements IClickableObject3D<ValueType>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, ClickableObject<ValueType>);
  }
}

export class CheckBoxMesh<ValueType = any>
  extends InteractiveMesh<ValueType, CheckBoxObject<ValueType>>
  implements IClickableObject3D<ValueType>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, CheckBoxObject<ValueType>);
  }
}

export class RadioButtonMesh<ValueType = any>
  extends InteractiveMesh<ValueType, RadioButtonObject<ValueType>>
  implements IClickableObject3D<ValueType>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, RadioButtonObject<ValueType>);
  }
}
