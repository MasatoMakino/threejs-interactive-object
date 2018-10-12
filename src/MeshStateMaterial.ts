import { MeshMaterialType, SpriteMaterial } from "three";
import { ClickableState } from "MouseEventManager";

/**
 * ClickableMesh用の、各状態用マテリアル。
 * マテリアルと固定値のalphaプロパティで構成される。
 *
 * alphaプロパティはmaterialが設定された時にそのopacityを引き継ぐ。
 * materialのopacityは、alpha * meshのalphaで設定される。
 * これはClickableMeshの各状態のopacityがアニメーションで同期するため。
 * （meshのalphaが0になると全て非表示、1.0になるとマテリアル本来のopacityに戻る）
 */

export class MeshStateMaterial {
  private _material!: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
  private alpha: number = 1.0;
  private alphaArray!: number[];

  constructor(
    material: MeshMaterialType | MeshMaterialType[] | SpriteMaterial
  ) {
    this.material = material;
  }

  private updateAlpha(): void {
    if (this._material instanceof Array) {
      this.alphaArray = this.getAlphaArray();
    } else {
      this.alpha = this._material.opacity;
    }
  }

  private getAlphaArray(): number[] {
    const matArray = this._material as MeshMaterialType[];
    const n = matArray.length;

    const array = [];
    for (let i = 0; i < n; i++) {
      array.push(matArray[i].opacity);
    }
    return array;
  }

  set material(value: MeshMaterialType | MeshMaterialType[] | SpriteMaterial) {
    this._material = value;
    this.updateAlpha();
  }

  get material(): MeshMaterialType | MeshMaterialType[] | SpriteMaterial {
    return this._material;
  }

  public setOpacity(opacity: number): void {
    if (this._material instanceof Array) {
      const n = this._material.length;
      for (let i = 0; i < n; i++) {
        const material = this._material[i];
        material.opacity = opacity * this.alphaArray[i];
      }
    } else {
      this._material.opacity = opacity * this.alpha;
    }
  }
}

export class MeshStateMaterialSet {
  normal!: MeshStateMaterial;
  over!: MeshStateMaterial;
  down!: MeshStateMaterial;
  disable!: MeshStateMaterial;

  normalSelect!: MeshStateMaterial;
  overSelect!: MeshStateMaterial;
  downSelect!: MeshStateMaterial;

  public static init(mat: MeshStateMaterialSet): MeshStateMaterialSet {
    if (mat.normal == null) {
      throw new Error("通常状態のマテリアルが指定されていません。");
    }

    if (mat.down == null) mat.down = mat.normal;
    if (mat.over == null) mat.over = mat.normal;
    if (mat.disable == null) mat.disable = mat.normal;

    if (mat.normalSelect == null) mat.normalSelect = mat.normal;
    if (mat.overSelect == null) mat.overSelect = mat.normal;
    if (mat.downSelect == null) mat.downSelect = mat.normal;

    return mat;
  }

  public static get(
    mat: MeshStateMaterialSet,
    state: ClickableState,
    mouseEnabled: boolean,
    isSelected: boolean = false
  ): MeshStateMaterial {
    //無効状態はstateよりも優先
    if (!mouseEnabled) {
      return mat.disable;
    }

    if (!isSelected) {
      switch (state) {
        case ClickableState.NORMAL:
          return mat.normal;
        case ClickableState.DOWN:
          return mat.down;
        case ClickableState.OVER:
          return mat.over;
      }
    } else {
      switch (state) {
        case ClickableState.NORMAL:
          return mat.normalSelect;
        case ClickableState.DOWN:
          return mat.downSelect;
        case ClickableState.OVER:
          return mat.overSelect;
      }
    }

    return mat.normal;
  }

  public static setOpacity(mat: MeshStateMaterialSet, opacity: number) {
    mat.normal.setOpacity(opacity);
    mat.normalSelect.setOpacity(opacity);
    mat.over.setOpacity(opacity);
    mat.overSelect.setOpacity(opacity);
    mat.down.setOpacity(opacity);
    mat.downSelect.setOpacity(opacity);
    mat.disable.setOpacity(opacity);
  }
}
