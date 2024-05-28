import { BufferGeometry, Mesh } from "three";
import {
  CheckBoxInteractionHandler,
  ButtonInteractionHandler,
  IClickableObject3D,
  RadioButtonObject,
  StateMaterialSet,
  ModelConstructor,
} from "./index.js";

export interface InteractiveMeshParameters {
  geo?: BufferGeometry;
  material: StateMaterialSet;
}

class InteractiveMesh<Value, Model extends ButtonInteractionHandler<Value>>
  extends Mesh
  implements IClickableObject3D<Value>
{
  readonly model: Model;

  constructor(
    parameters: InteractiveMeshParameters,
    ctor: ModelConstructor<Model, Value>,
  ) {
    super(parameters.geo);
    this.model = new ctor({ view: this, material: parameters.material });
  }
}

export class ClickableMesh<Value = any>
  extends InteractiveMesh<Value, ButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, ButtonInteractionHandler<Value>);
  }
}

export class CheckBoxMesh<Value = any>
  extends InteractiveMesh<Value, CheckBoxInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, CheckBoxInteractionHandler<Value>);
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
