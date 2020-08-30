import { Sprite } from "three";
import { ClickableObject } from "./ClickableObject";
import { IClickableObject3D } from "./MouseEventManager";
import { StateMaterialSet } from "./StateMaterial";

/**
 * クリックに反応するSprite。
 */
export declare class ClickableSprite
  extends Sprite
  implements IClickableObject3D {
  model: ClickableObject;
  constructor(material: StateMaterialSet);
}
//# sourceMappingURL=ClickableSptire.d.ts.map
