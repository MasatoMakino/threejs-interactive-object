import { Group } from "three";
import { ClickableObject } from "./ClickableObject";
import { IClickableObject3D } from "./MouseEventManager";

export class ClickableGroup<ValueType = any>
  extends Group
  implements IClickableObject3D
{
  public model: ClickableObject<ValueType>;

  constructor() {
    super();
    this.model = new ClickableObject<ValueType>({
      view: this,
    });
  }
}
