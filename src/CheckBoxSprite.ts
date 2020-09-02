import { Sprite } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { IClickableObject3D } from "./MouseEventManager";
import { StateMaterialSet } from "./StateMaterial";

export class CheckBoxSprite extends Sprite implements IClickableObject3D {
  public model: CheckBoxObject;

  constructor(material: StateMaterialSet) {
    super();
    this.model = new CheckBoxObject({
      view: this,
      material: material,
    });
  }
}
