import { Sprite } from "three";
import { RadioButtonObject } from "./RadioButtonObject";

export class RadioButtonSprite extends Sprite {
  constructor(material) {
    super();
    this.model = new RadioButtonObject({
      view: this,
      material: material,
    });
  }
}
