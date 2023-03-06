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

class InteractiveMesh<T extends ClickableObject>
  extends Mesh
  implements IClickableObject3D
{
  public model: T;

  constructor(parameters: InteractiveMeshParameters, ctor: TConstructor<T>) {
    super(parameters.geo);
    this.model = new ctor({ view: this, material: parameters.material });
  }
}

export class ClickableMesh<ValueType = any>
  extends InteractiveMesh<ClickableObject<ValueType>>
  implements IClickableObject3D
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, ClickableObject);
  }
}

export class CheckBoxMesh<ValueType = any>
  extends InteractiveMesh<CheckBoxObject<ValueType>>
  implements IClickableObject3D
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, CheckBoxObject);
  }
}

export class RadioButtonMesh<ValueType = any>
  extends InteractiveMesh<RadioButtonObject<ValueType>>
  implements IClickableObject3D
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, RadioButtonObject);
  }
}
