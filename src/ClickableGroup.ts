import { Group } from "three";
import { ButtonInteractionHandler, IClickableObject3D } from "./index.js";

export class ClickableGroup<Value = any>
  extends Group
  implements IClickableObject3D<Value>
{
  public interactionHandler: ButtonInteractionHandler<Value>;

  constructor() {
    super();
    this.interactionHandler = new ButtonInteractionHandler<Value>({
      view: this,
    });
  }
}
