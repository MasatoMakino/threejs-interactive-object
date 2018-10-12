import { MeshMaterialType, SpriteMaterial } from "three";
import { ClickableState } from "./MouseEventManager";
/**
 * ClickableMesh用の、各状態用マテリアル。
 * マテリアルと固定値のalphaプロパティで構成される。
 *
 * alphaプロパティはmaterialが設定された時にそのopacityを引き継ぐ。
 * materialのopacityは、alpha * meshのalphaで設定される。
 * これはClickableMeshの各状態のopacityがアニメーションで同期するため。
 * （meshのalphaが0になると全て非表示、1.0になるとマテリアル本来のopacityに戻る）
 */
export declare class StateMaterial {
    private _material;
    private alpha;
    private alphaArray;
    constructor(material: MeshMaterialType | MeshMaterialType[] | SpriteMaterial);
    private updateAlpha;
    private getAlphaArray;
    material: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
    setOpacity(opacity: number): void;
}
export declare class StateMaterialSet {
    normal: StateMaterial;
    over: StateMaterial;
    down: StateMaterial;
    disable: StateMaterial;
    normalSelect: StateMaterial;
    overSelect: StateMaterial;
    downSelect: StateMaterial;
    constructor(param: {
        normal: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
        over?: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
        down?: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
        disable?: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
        normalSelect?: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
        overSelect?: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
        downSelect?: MeshMaterialType | MeshMaterialType[] | SpriteMaterial;
    });
    init(): void;
    getMaterial(state: ClickableState, mouseEnabled: boolean, isSelected?: boolean): StateMaterial;
    setOpacity(opacity: number): void;
}
//# sourceMappingURL=StateMaterial.d.ts.map