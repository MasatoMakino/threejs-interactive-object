import { Sprite } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ClickableObject, ClickableObjectParameters } from "./ClickableObject";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export interface TConstructor<T> {
  new (param: ClickableObjectParameters): T;
}

class InteractiveSprite<ValueType, T extends ClickableObject<ValueType>>
  extends Sprite
  implements IClickableObject3D
{
  public model: T;

  constructor(material: StateMaterialSet, ctor: TConstructor<T>) {
    super();
    this.model = new ctor({ view: this, material: material });
  }
}
export class ClickableSprite<ValueType = any>
  extends InteractiveSprite<ValueType, ClickableObject<ValueType>>
  implements IClickableObject3D
{
  constructor(material: StateMaterialSet) {
    super(material, ClickableObject<ValueType>);
  }
}

export class CheckBoxSprite<ValueType = any>
  extends InteractiveSprite<ValueType, CheckBoxObject<ValueType>>
  implements IClickableObject3D
{
  constructor(material: StateMaterialSet) {
    super(material, CheckBoxObject<ValueType>);
  }
}

export class RadioButtonSprite<ValueType = any>
  extends InteractiveSprite<ValueType, RadioButtonObject<ValueType>>
  implements IClickableObject3D
{
  constructor(material: StateMaterialSet) {
    super(material, RadioButtonObject<ValueType>);
  }
}
