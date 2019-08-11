import { IClickableObject3D } from "./MouseEventManager";
import { Sprite } from "three";
import { StateMaterialSet } from "./StateMaterial";
import { ClickableObject } from "./ClickableObject";

/**
 * クリックに反応するSprite。
 */
export class ClickableSprite extends Sprite implements IClickableObject3D {
  public model: ClickableObject;

  constructor(material: StateMaterialSet) {
    super();
    this.model = new ClickableObject({
      view: this,
      material: material
    });
  }
}
