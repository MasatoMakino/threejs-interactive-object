import { Sprite } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ClickableObject, ClickableObjectParameters } from "./ClickableObject";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export interface TConstructor<T> {
  new (param: ClickableObjectParameters): T;
}

class InteractiveSprite<T extends ClickableObject>
  extends Sprite
  implements IClickableObject3D {
  public model: T;

  constructor(material: StateMaterialSet, ctor: TConstructor<T>) {
    super();
    this.model = new ctor({ view: this, material: material });
  }
}
export class ClickableSprite
  extends InteractiveSprite<ClickableObject>
  implements IClickableObject3D {
  constructor(material: StateMaterialSet) {
    super(material, ClickableObject);
  }
}

export class CheckBoxSprite
  extends InteractiveSprite<CheckBoxObject>
  implements IClickableObject3D {
  constructor(material: StateMaterialSet) {
    super(material, CheckBoxObject);
  }
}

export class RadioButtonSprite
  extends InteractiveSprite<RadioButtonObject>
  implements IClickableObject3D {
  constructor(material: StateMaterialSet) {
    super(material, RadioButtonObject);
  }
}
