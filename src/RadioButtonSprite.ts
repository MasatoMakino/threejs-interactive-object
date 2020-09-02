import { Sprite } from "three";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

export class RadioButtonSprite extends Sprite implements IClickableObject3D {
  public model: RadioButtonObject;

  constructor(material: StateMaterialSet) {
    super();
    this.model = new RadioButtonObject({
      view: this,
      material: material,
    });
  }
}
