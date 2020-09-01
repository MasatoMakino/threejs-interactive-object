import { Group } from "three";
import { ClickableObject } from "./ClickableObject";
import { IClickableObject3D } from "./MouseEventManager";

export class ClickableGroup extends Group implements IClickableObject3D {
  public model: ClickableObject;

  constructor() {
    super();
    this.model = new ClickableObject({
      view: this,
    });
  }
}
