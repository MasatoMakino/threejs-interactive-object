import { Material } from "three";
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
export declare type StateMaterialType = Material | Material[];
export declare class StateMaterial {
  private _material;
  private alpha;
  private alphaArray;
  constructor(material: StateMaterialType);
  private updateAlpha;
  private getAlphaArray;
  set material(value: StateMaterialType);
  get material(): StateMaterialType;
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
  materials: StateMaterial[];
  constructor(param: {
    normal: StateMaterialType;
    over?: StateMaterialType;
    down?: StateMaterialType;
    disable?: StateMaterialType;
    normalSelect?: StateMaterialType;
    overSelect?: StateMaterialType;
    downSelect?: StateMaterialType;
  });
  private static initMaterial;
  init(): void;
  getMaterial(
    state: ClickableState,
    mouseEnabled: boolean,
    isSelected?: boolean
  ): StateMaterial;
  setOpacity(opacity: number): void;
}
//# sourceMappingURL=StateMaterial.d.ts.map
