import { StateMaterialSet } from "./StateMaterial";
import { RadioButtonObject } from "./RadioButtonObject";
import { Sprite } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";
export declare class RadioButtonSprite extends Sprite
  implements IRadioButtonObject3D {
  model: RadioButtonObject;
  constructor(material: StateMaterialSet);
}
//# sourceMappingURL=RadioButtonSprite.d.ts.map
