import { Sprite } from "three";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  type IClickableObject3D,
  RadioButtonInteractionHandler,
  type StateMaterialSet,
} from "../index.js";
import type { InteractionHandlerConstructor } from "./InteractionHandlerConstructor.js";

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
export class ClickableSprite<Value = unknown>
  extends InteractiveSprite<Value, ButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, ButtonInteractionHandler<Value>);
  }
}

export class CheckBoxSprite<Value = unknown>
  extends InteractiveSprite<Value, CheckBoxInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, CheckBoxInteractionHandler<Value>);
  }
}

export class RadioButtonSprite<Value = unknown>
  extends InteractiveSprite<Value, RadioButtonInteractionHandler<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, RadioButtonInteractionHandler<Value>);
  }
}
