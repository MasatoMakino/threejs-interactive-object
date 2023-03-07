import { BufferGeometry, Mesh } from "three";
import {
  CheckBoxObject,
  ClickableObject,
  IClickableObject3D,
  RadioButtonObject,
  StateMaterialSet,
  ModelConstructor,
} from "./";

export interface InteractiveMeshParameters {
  geo?: BufferGeometry;
  material: StateMaterialSet;
}

class InteractiveMesh<Value, Model extends ClickableObject<Value>>
  extends Mesh
  implements IClickableObject3D<Value>
{
  public model: Model;

  constructor(
    parameters: InteractiveMeshParameters,
    ctor: ModelConstructor<Model, Value>
  ) {
    super(parameters.geo);
    this.model = new ctor({ view: this, material: parameters.material });
  }
}

export class ClickableMesh<Value = any>
  extends InteractiveMesh<Value, ClickableObject<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, ClickableObject<Value>);
  }
}

export class CheckBoxMesh<Value = any>
  extends InteractiveMesh<Value, CheckBoxObject<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, CheckBoxObject<Value>);
  }
}

export class RadioButtonMesh<Value = any>
  extends InteractiveMesh<Value, RadioButtonObject<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, RadioButtonObject<Value>);
  }
}
