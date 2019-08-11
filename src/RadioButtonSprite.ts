import { StateMaterialSet } from "./StateMaterial";
import { RadioButtonObject } from "./RadioButtonObject";
import { Sprite } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";

export class RadioButtonSprite extends Sprite implements IRadioButtonObject3D {
  public model: RadioButtonObject;

  constructor(material: StateMaterialSet) {
    super();
    this.model = new RadioButtonObject({
      view: this,
      material: material
    });
  }
}
