import { Group } from "three";
import { ClickableObject, IClickableObject3D } from "./";

export class ClickableGroup<ValueType = any>
  extends Group
  implements IClickableObject3D<ValueType>
{
  public model: ClickableObject<ValueType>;

  constructor() {
    super();
    this.model = new ClickableObject<ValueType>({
      view: this,
    });
  }
}
