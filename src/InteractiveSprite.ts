import { Sprite } from "three";
import {
  CheckBoxObject,
  ButtonInteractionHandler,
  ButtonInteractionHandlerParameters,
  IClickableObject3D,
  RadioButtonObject,
  StateMaterialSet,
} from "./index.js";

export interface ModelConstructor<
  Model extends ButtonInteractionHandler<Value>,
  Value,
> {
  new (param: ButtonInteractionHandlerParameters<Value>): Model;
}

class InteractiveSprite<Value, Model extends ButtonInteractionHandler<Value>>
  extends Sprite
  implements IClickableObject3D<Value>
{
  readonly model: Model;
  constructor(
    material: StateMaterialSet,
    ctor: ModelConstructor<Model, Value>,
  ) {
    super();
    this.model = new ctor({ view: this, material: material });
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
  extends InteractiveSprite<Value, CheckBoxObject<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, CheckBoxObject<Value>);
  }
}

export class RadioButtonSprite<Value = any>
  extends InteractiveSprite<Value, RadioButtonObject<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, RadioButtonObject<Value>);
  }
}
