import { BufferGeometry, Mesh } from "three";
import {
  CheckBoxInteractionHandler,
  ButtonInteractionHandler,
  IClickableObject3D,
  RadioButtonInteractionHandler,
  StateMaterialSet,
  InteractionHandlerConstructor,
} from "./index.js";

export interface InteractiveMeshParameters {
  geo?: BufferGeometry;
  material: StateMaterialSet;
}

class InteractiveMesh<
    Value,
    InteractionHandler extends ButtonInteractionHandler<Value>,
  >
  extends Mesh
  implements IClickableObject3D<Value>
{
  readonly interactionHandler: InteractionHandler;

  constructor(
    parameters: InteractiveMeshParameters,
    ctor: InteractionHandlerConstructor<InteractionHandler, Value>,
  ) {
    super(parameters.geo);
    this.interactionHandler = new ctor({
      view: this,
      material: parameters.material,
    });
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
  extends InteractiveMesh<Value, RadioButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, RadioButtonInteractionHandler<Value>);
  }
}
