import { Material, SpriteMaterial } from "three";
import { ClickableState } from "./MouseEventManager";

/**
 * IClickableObject3D用の各状態用マテリアル。
 * マテリアルと固定値のalphaプロパティで構成される。
 *
 * alphaプロパティはコンストラクタ引数のmaterial.opacityを引き継ぐ。
 * StateMaterialのopacityは、StateMaterialのalpha * StateMaterialSetのalphaで設定される。
 * これはStateMaterialSetの各状態のopacityがアニメーションで同期するため。
 * （StateMaterialSetのalphaが0になると全て非表示、1.0になるとマテリアル本来のopacityに戻る）
 */

export class StateMaterial {
  private _material!: Material | Material[];
  private alpha: number = 1.0;
  private alphaArray!: number[];

  constructor(material: Material | Material[]) {
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
    const matArray = this._material as Material[];
    const n = matArray.length;

    const array = [];
    for (let i = 0; i < n; i++) {
      array.push(matArray[i].opacity);
    }
    return array;
  }

  set material(value: Material | Material[]) {
    this._material = value;
    this.updateAlpha();
  }

  get material(): Material | Material[] {
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

export class StateMaterialSet {
  normal!: StateMaterial;
  over!: StateMaterial;
  down!: StateMaterial;
  disable!: StateMaterial;

  normalSelect!: StateMaterial;
  overSelect!: StateMaterial;
  downSelect!: StateMaterial;

  constructor(param: {
    normal: Material | Material[];
    over?: Material | Material[];
    down?: Material | Material[];
    disable?: Material | Material[];
    normalSelect?: Material | Material[];
    overSelect?: Material | Material[];
    downSelect?: Material | Material[];
  }) {
    this.normal = new StateMaterial(param.normal);
    if (param.over) this.over = new StateMaterial(param.over);
    if (param.down) this.down = new StateMaterial(param.down);
    if (param.disable) this.disable = new StateMaterial(param.disable);
    if (param.normalSelect)
      this.normalSelect = new StateMaterial(param.normalSelect);
    if (param.overSelect) this.overSelect = new StateMaterial(param.overSelect);
    if (param.downSelect) this.downSelect = new StateMaterial(param.downSelect);

    this.init();
  }

  public init(): void {
    if (this.normal == null) {
      throw new Error("通常状態のマテリアルが指定されていません。");
    }

    if (this.down == null) this.down = this.normal;
    if (this.over == null) this.over = this.normal;
    if (this.disable == null) this.disable = this.normal;

    if (this.normalSelect == null) this.normalSelect = this.normal;
    if (this.overSelect == null) this.overSelect = this.normal;
    if (this.downSelect == null) this.downSelect = this.normal;
  }

  public getMaterial(
    state: ClickableState,
    mouseEnabled: boolean,
    isSelected: boolean = false
  ): StateMaterial {
    //無効状態はstateよりも優先
    if (!mouseEnabled) {
      return this.disable;
    }

    if (!isSelected) {
      switch (state) {
        case ClickableState.NORMAL:
          return this.normal;
        case ClickableState.DOWN:
          return this.down;
        case ClickableState.OVER:
          return this.over;
      }
    } else {
      switch (state) {
        case ClickableState.NORMAL:
          return this.normalSelect;
        case ClickableState.DOWN:
          return this.downSelect;
        case ClickableState.OVER:
          return this.overSelect;
      }
    }

    return this.normal;
  }

  public setOpacity(opacity: number) {
    this.normal.setOpacity(opacity);
    this.normalSelect.setOpacity(opacity);
    this.over.setOpacity(opacity);
    this.overSelect.setOpacity(opacity);
    this.down.setOpacity(opacity);
    this.downSelect.setOpacity(opacity);
    this.disable.setOpacity(opacity);
  }
}
