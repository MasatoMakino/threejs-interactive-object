import { Sprite } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ClickableObject, ClickableObjectParameters } from "./ClickableObject";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export interface TConstructor<T> {
  new (param: ClickableObjectParameters): T;
}
declare class InteractiveSprite<T extends ClickableObject>
  extends Sprite
  implements IClickableObject3D {
  model: T;
  constructor(material: StateMaterialSet, ctor: TConstructor<T>);
}
export declare class ClickableSprite
  extends InteractiveSprite<ClickableObject>
  implements IClickableObject3D {
  constructor(material: StateMaterialSet);
}
export declare class CheckBoxSprite
  extends InteractiveSprite<CheckBoxObject>
  implements IClickableObject3D {
  constructor(material: StateMaterialSet);
}
export declare class RadioButtonSprite
  extends InteractiveSprite<RadioButtonObject>
  implements IClickableObject3D {
  constructor(material: StateMaterialSet);
}
export {};
//# sourceMappingURL=InteractiveSprite.d.ts.map
