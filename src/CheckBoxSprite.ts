import { Sprite } from "three";
import { StateMaterialSet } from "./StateMaterial";
import { CheckBoxObject } from "./CheckBoxObject";
import { ISelectableObject3D } from "./MouseEventManager";

export class CheckBoxSprite extends Sprite implements ISelectableObject3D {
  public model: CheckBoxObject;

  constructor(material: StateMaterialSet) {
    super();
    this.model = new CheckBoxObject({
      view: this,
      material: material
    });
  }
}
