import { RadioButtonObject } from "./RadioButtonObject";
import { Sprite } from "three";

export class RadioButtonSprite extends Sprite {
  constructor(material) {
    super();
    this.model = new RadioButtonObject({
      view: this,
      material: material,
    });
  }
}
