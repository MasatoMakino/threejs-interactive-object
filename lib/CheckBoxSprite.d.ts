import { Sprite } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ISelectableObject3D } from "./MouseEventManager";
import { StateMaterialSet } from "./StateMaterial";

export declare class CheckBoxSprite
  extends Sprite
  implements ISelectableObject3D {
  model: CheckBoxObject;
  constructor(material: StateMaterialSet);
}
//# sourceMappingURL=CheckBoxSprite.d.ts.map
