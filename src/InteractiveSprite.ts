import { Sprite } from "three";
import {
  CheckBoxObject,
  ClickableObject,
  ClickableObjectParameters,
  IClickableObject3D,
  RadioButtonObject,
  StateMaterialSet,
} from "./";

export interface ModelConstructor<Model extends ClickableObject<Value>, Value> {
  new (param: ClickableObjectParameters<Value>): Model;
}

class InteractiveSprite<Value, Model extends ClickableObject<Value>>
  extends Sprite
  implements IClickableObject3D<Value>
{
  public model: Model;

  constructor(
    material: StateMaterialSet,
    ctor: ModelConstructor<Model, Value>
  ) {
    super();
    this.model = new ctor({ view: this, material: material });
  }
}
export class ClickableSprite<Value = any>
  extends InteractiveSprite<Value, ClickableObject<Value>>
  implements IClickableObject3D<Value>
{
  constructor(material: StateMaterialSet) {
    super(material, ClickableObject<Value>);
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
