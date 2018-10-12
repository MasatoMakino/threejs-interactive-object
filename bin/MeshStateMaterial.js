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
    constructor(material) {
        this.alpha = 1.0;
        this.material = material;
    }
    updateAlpha() {
        if (this._material instanceof Array) {
            this.alphaArray = this.getAlphaArray();
        }
        else {
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
        }
        else {
            this._material.opacity = opacity * this.alpha;
        }
    }
}
export class MeshStateMaterialSet {
    static init(mat) {
        if (mat.normal == null) {
            throw new Error("通常状態のマテリアルが指定されていません。");
        }
        if (mat.down == null)
            mat.down = mat.normal;
        if (mat.over == null)
            mat.over = mat.normal;
        if (mat.disable == null)
            mat.disable = mat.normal;
        if (mat.normalSelect == null)
            mat.normalSelect = mat.normal;
        if (mat.overSelect == null)
            mat.overSelect = mat.normal;
        if (mat.downSelect == null)
            mat.downSelect = mat.normal;
        return mat;
    }
    static get(mat, state, mouseEnabled, isSelected = false) {
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
        }
        else {
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
    static setOpacity(mat, opacity) {
        mat.normal.setOpacity(opacity);
        mat.normalSelect.setOpacity(opacity);
        mat.over.setOpacity(opacity);
        mat.overSelect.setOpacity(opacity);
        mat.down.setOpacity(opacity);
        mat.downSelect.setOpacity(opacity);
        mat.disable.setOpacity(opacity);
    }
}
