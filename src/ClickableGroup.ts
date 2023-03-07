import { Group } from "three";
import { ClickableObject, IClickableObject3D } from "./";

export class ClickableGroup<Value = any>
  extends Group
  implements IClickableObject3D<Value>
{
  public model: ClickableObject<Value>;

  constructor() {
    super();
    this.model = new ClickableObject<Value>({
      view: this,
    });
  }
}
