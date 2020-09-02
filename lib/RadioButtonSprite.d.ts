import { Sprite } from "three";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export declare class RadioButtonSprite
  extends Sprite
  implements IClickableObject3D {
  model: RadioButtonObject;
  constructor(material: StateMaterialSet);
}
//# sourceMappingURL=RadioButtonSprite.d.ts.map
