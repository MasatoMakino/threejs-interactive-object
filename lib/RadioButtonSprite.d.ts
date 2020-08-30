import { Sprite } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export declare class RadioButtonSprite
  extends Sprite
  implements IRadioButtonObject3D {
  model: RadioButtonObject;
  constructor(material: StateMaterialSet);
}
//# sourceMappingURL=RadioButtonSprite.d.ts.map
