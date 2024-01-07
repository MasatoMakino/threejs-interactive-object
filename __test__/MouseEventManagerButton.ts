import { BoxGeometry } from "three";
import { expect } from "vitest";
import {
  ClickableMesh,
  ClickableState,
  StateMaterialSet,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

export class MouseEventManagerButton {
  public button: ClickableMesh;
  public materialSet: StateMaterialSet;

  constructor() {
    this.materialSet = getMeshMaterialSet();
    this.button = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: this.materialSet,
    });
  }

  /**
   * マテリアルの状態を比較する
   * @param state
   */
  public checkMaterial(state: ClickableState): void {
    const setMat = this.materialSet.getMaterial(
      state,
      state !== "disable",
    ).material;

    expect(this.button.material).toBe(setMat);
  }
}
