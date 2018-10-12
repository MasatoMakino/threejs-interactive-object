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
export declare class MeshStateMaterial {
    private _material;
    private alpha;
    private alphaArray;
    constructor(material: MeshMaterialType | MeshMaterialType[] | SpriteMaterial);
    private updateAlpha;
    private getAlphaArray;
    material: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
    setOpacity(opacity: number): void;
}
export declare class MeshStateMaterialSet {
    normal: MeshStateMaterial;
    over: MeshStateMaterial;
    down: MeshStateMaterial;
    disable: MeshStateMaterial;
    normalSelect: MeshStateMaterial;
    overSelect: MeshStateMaterial;
    downSelect: MeshStateMaterial;
    static init(mat: MeshStateMaterialSet): MeshStateMaterialSet;
    static get(mat: MeshStateMaterialSet, state: ClickableState, mouseEnabled: boolean, isSelected?: boolean): MeshStateMaterial;
    static setOpacity(mat: MeshStateMaterialSet, opacity: number): void;
}
//# sourceMappingURL=MeshStateMaterial.d.ts.map