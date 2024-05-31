import { Sprite } from "three";
import {
  CheckBoxInteractionHandler,
  ButtonInteractionHandler,
  ButtonInteractionHandlerParameters,
  IClickableObject3D,
  RadioButtonInteractionHandler,
  StateMaterialSet,
} from "../index.js";

export interface InteractionHandlerConstructor<
  InteractionHandler extends ButtonInteractionHandler<Value>,
  Value,
> {
  new (param: ButtonInteractionHandlerParameters<Value>): InteractionHandler;
}

class InteractiveSprite<Value, Handler extends ButtonInteractionHandler<Value>>
  extends Sprite
  implements IClickableObject3D<Value>
{
  readonly interactionHandler: Handler;

  constructor(
    material: StateMaterialSet,
    ctor: InteractionHandlerConstructor<Handler, Value>,
  ) {
    super();
    this.interactionHandler = new ctor({ view: this, material: material });
  }
}
export class ClickableSprite<Value = any>
  extends InteractiveSprite<Value, ButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, ButtonInteractionHandler<Value>);
  }
}

export class CheckBoxSprite<Value = any>
  extends InteractiveSprite<Value, CheckBoxInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, CheckBoxInteractionHandler<Value>);
  }
}

export class RadioButtonSprite<Value = any>
  extends InteractiveSprite<Value, RadioButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, RadioButtonInteractionHandler<Value>);
  }
}
