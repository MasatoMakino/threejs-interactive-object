import { Sprite } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
export class CheckBoxSprite extends Sprite {
    constructor(material) {
        super();
        this.model = new CheckBoxObject({
            view: this,
            material: material
        });
    }
}
