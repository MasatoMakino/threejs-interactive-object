import { ClickableState } from "./MouseEventManager";
export class StateMaterial {
  constructor(material) {
    this.alpha = 1.0;
    this.material = material;
  }
  updateAlpha() {
    if (this._material instanceof Array) {
      this.alphaArray = this.getAlphaArray();
    } else {
      this.alpha = this._material.opacity;
    }
  }
  getAlphaArray() {
    const matArray = this._material;
    const n = matArray.length;
    const array = [];
    for (let i = 0; i < n; i++) {
      array.push(matArray[i].opacity);
    }
    return array;
  }
  set material(value) {
    this._material = value;
    this.updateAlpha();
  }
  get material() {
    return this._material;
  }
  setOpacity(opacity) {
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
  constructor(param) {
    this.normal = new StateMaterial(param.normal);
    this.over = StateMaterialSet.initMaterial(param.over, this.normal);
    this.down = StateMaterialSet.initMaterial(param.down, this.normal);
    this.disable = StateMaterialSet.initMaterial(param.disable, this.normal);
    this.normalSelect = StateMaterialSet.initMaterial(
      param.normalSelect,
      this.normal
    );
    this.overSelect = StateMaterialSet.initMaterial(
      param.overSelect,
      this.normal
    );
    this.downSelect = StateMaterialSet.initMaterial(
      param.downSelect,
      this.normal
    );
    this.init();
  }
  static initMaterial(value, defaultMaterial) {
    if (value == null) return defaultMaterial;
    return new StateMaterial(value);
  }
  init() {
    if (this.normal == null) {
      throw new Error("通常状態のマテリアルが指定されていません。");
    }
    this.materials = [
      this.normal,
      this.normalSelect,
      this.over,
      this.overSelect,
      this.down,
      this.downSelect,
      this.disable,
    ];
  }
  getMaterial(state, mouseEnabled, isSelected = false) {
    //無効状態はstateよりも優先
    if (!mouseEnabled) {
      return this.disable;
    }
    switch (state) {
      case ClickableState.NORMAL:
        return isSelected ? this.normalSelect : this.normal;
      case ClickableState.DOWN:
        return isSelected ? this.downSelect : this.down;
      case ClickableState.OVER:
        return isSelected ? this.overSelect : this.over;
    }
    return this.normal;
  }
  setOpacity(opacity) {
    this.materials.forEach((mat) => {
      mat.setOpacity(opacity);
    });
  }
}
