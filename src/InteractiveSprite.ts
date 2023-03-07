import { Sprite } from "three";
import {
  CheckBoxObject,
  ClickableObject,
  ClickableObjectParameters,
  IClickableObject3D,
  RadioButtonObject,
  StateMaterialSet,
} from "./";

export interface TConstructor<T, ValueType> {
  new (param: ClickableObjectParameters<ValueType>): T;
}

class InteractiveSprite<ValueType, T extends ClickableObject<ValueType>>
  extends Sprite
  implements IClickableObject3D<ValueType>
{
  public model: T;

  constructor(material: StateMaterialSet, ctor: TConstructor<T, ValueType>) {
    super();
    this.model = new ctor({ view: this, material: material });
  }
}
export class ClickableSprite<ValueType = any>
  extends InteractiveSprite<ValueType, ClickableObject<ValueType>>
  implements IClickableObject3D<ValueType>
{
  constructor(material: StateMaterialSet) {
    super(material, ClickableObject<ValueType>);
  }
}

export class CheckBoxSprite<ValueType = any>
  extends InteractiveSprite<ValueType, CheckBoxObject<ValueType>>
  implements IClickableObject3D<ValueType>
{
  constructor(material: StateMaterialSet) {
    super(material, CheckBoxObject<ValueType>);
  }
}

export class RadioButtonSprite<ValueType = any>
  extends InteractiveSprite<ValueType, RadioButtonObject<ValueType>>
  implements IClickableObject3D<ValueType>
{
  constructor(material: StateMaterialSet) {
    super(material, RadioButtonObject<ValueType>);
  }
}
