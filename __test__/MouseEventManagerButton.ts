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
   */
  public checkMaterial(state: ClickableState): void {
    const targetMat = this.button.material as MeshPhongMaterial;
    const setMat = this.materialSet.getMaterial(
      state,
      state !== ClickableState.DISABLE
    ).material as MeshPhongMaterial;

    expect(targetMat.opacity).toBe(setMat.opacity);
    expect(targetMat.color).toBe(setMat.color);
  }
}
