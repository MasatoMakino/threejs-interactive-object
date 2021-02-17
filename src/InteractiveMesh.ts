import { BufferGeometry, Mesh } from "three";
import { CheckBoxObject } from "./CheckBoxObject";
import { ClickableObject } from "./ClickableObject";
import { TConstructor } from "./InteractiveSprite";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { StateMaterialSet } from "./StateMaterial";

interface InteractiveMeshParameters {
  geo?: BufferGeometry;
  material: StateMaterialSet;
}

class InteractiveMesh<T extends ClickableObject>
  extends Mesh
  implements IClickableObject3D {
  public model: T;

  constructor(parameters: InteractiveMeshParameters, ctor: TConstructor<T>) {
    super(parameters.geo);
    this.model = new ctor({ view: this, material: parameters.material });
  }
}

export class ClickableMesh
  extends InteractiveMesh<ClickableObject>
  implements IClickableObject3D {
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, ClickableObject);
  }
}

export class CheckBoxMesh
  extends InteractiveMesh<CheckBoxObject>
  implements IClickableObject3D {
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, CheckBoxObject);
  }
}

export class RadioButtonMesh
  extends InteractiveMesh<RadioButtonObject>
  implements IClickableObject3D {
  constructor(parameters: InteractiveMeshParameters) {
    super(parameters, RadioButtonObject);
  }
}
