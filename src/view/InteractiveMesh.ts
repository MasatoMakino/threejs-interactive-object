import { type BufferGeometry, Mesh } from "three";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  type IClickableObject3D,
  type InteractionHandlerConstructor,
  RadioButtonInteractionHandler,
  type StateMaterialSet,
} from "../index.js";

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

export class ClickableMesh<Value = unknown>
  extends InteractiveMesh<Value, ButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, ButtonInteractionHandler<Value>);
  }
}

export class CheckBoxMesh<Value = unknown>
  extends InteractiveMesh<Value, CheckBoxInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, CheckBoxInteractionHandler<Value>);
  }
}

export class RadioButtonMesh<Value = unknown>
  extends InteractiveMesh<Value, RadioButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, RadioButtonInteractionHandler<Value>);
  }
}
