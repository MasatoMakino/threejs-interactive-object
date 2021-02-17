import { Mesh } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ClickableObject } from "./ClickableObject";
import { RadioButtonObject } from "./RadioButtonObject";
class InteractiveMesh extends Mesh {
    constructor(parameters, ctor) {
        super(parameters.geo);
        this.model = new ctor({ view: this, material: parameters.material });
    }
}
export class ClickableMesh extends InteractiveMesh {
    constructor(parameters) {
        super(parameters, ClickableObject);
    }
}
export class CheckBoxMesh extends InteractiveMesh {
    constructor(parameters) {
        super(parameters, CheckBoxObject);
    }
}
export class RadioButtonMesh extends InteractiveMesh {
    constructor(parameters) {
        super(parameters, RadioButtonObject);
    }
}
