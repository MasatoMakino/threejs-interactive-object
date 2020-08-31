import { BoxBufferGeometry, MeshPhongMaterial } from "three";
import { ClickableMesh, ClickableState, StateMaterialSet } from "../src";
import { getMeshMaterialSet } from "./Materials";

export class MouseEventManagerButton {
  public button: ClickableMesh;
  public materialSet: StateMaterialSet;

  constructor() {
    this.materialSet = getMeshMaterialSet();
    this.button = new ClickableMesh({
      geo: new BoxBufferGeometry(3, 3, 3),
      material: this.materialSet,
    });
  }

  /**
   * マテリアルの状態を比較する
   * @param state
   * @param mouseEnabled
   */
  public checkMaterial(
    state: ClickableState,
    mouseEnabled: boolean = true
  ): void {
    const targetMat = this.button.material as MeshPhongMaterial;
    const setMat = this.materialSet.getMaterial(state, mouseEnabled)
      .material as MeshPhongMaterial;

    expect(targetMat.opacity).toBe(setMat.opacity);
    expect(targetMat.color).toBe(setMat.color);
  }
}
