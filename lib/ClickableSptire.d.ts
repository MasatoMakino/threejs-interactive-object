import { IClickableObject3D } from "./MouseEventManager";
import { Sprite } from "three";
import { StateMaterialSet } from "./StateMaterial";
import { ClickableObject } from "./ClickableObject";
/**
 * クリックに反応するSprite。
 */
export declare class ClickableSprite extends Sprite
  implements IClickableObject3D {
  model: ClickableObject;
  constructor(material: StateMaterialSet);
}
//# sourceMappingURL=ClickableSptire.d.ts.map
