import { Sprite } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ClickableObject } from "./ClickableObject";
import { RadioButtonObject } from "./RadioButtonObject";
class InteractiveSprite extends Sprite {
    constructor(material, ctor) {
        super();
        this.model = new ctor({ view: this, material: material });
    }
}
export class ClickableSprite extends InteractiveSprite {
    constructor(material) {
        super(material, ClickableObject);
    }
}
export class CheckBoxSprite extends InteractiveSprite {
    constructor(material) {
        super(material, CheckBoxObject);
    }
}
export class RadioButtonSprite extends InteractiveSprite {
    constructor(material) {
        super(material, RadioButtonObject);
    }
}
