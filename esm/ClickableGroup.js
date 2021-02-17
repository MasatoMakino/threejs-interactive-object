import { Group } from "three";
import { ClickableObject } from "./ClickableObject";
export class ClickableGroup extends Group {
    constructor() {
        super();
        this.model = new ClickableObject({
            view: this,
        });
    }
}
