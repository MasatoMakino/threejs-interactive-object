import { Sprite } from "three";
import { ClickableObject } from "./ClickableObject";

/**
 * クリックに反応するSprite。
 */
export class ClickableSprite extends Sprite {
  constructor(material) {
    super();
    this.model = new ClickableObject({
      view: this,
      material: material,
    });
  }
}
