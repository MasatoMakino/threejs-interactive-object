import type { Material } from "three";
import type { ClickableState } from "./index.js";

/**
 * Defines the material type used in StateMaterial - can be a single Material or an array of Materials.
 * @public
 */
export type StateMaterialType = Material | Material[];

/**
 * An opacity management class for Three.js materials in interactive states.
 *
 * @description
 * StateMaterial manages the opacity of Three.js Material objects for interactive states.
 * It preserves the original opacity values of materials and enables synchronized opacity control
 * across multiple materials through StateMaterialSet, allowing coordinated transparency animations
 * for all interactive states.
 *
 * @remarks
 * - The alpha property preserves the material's original opacity value at construction time
 * - Final material.opacity = setOpacity() parameter × original material.opacity
 * - Supports both single materials and material arrays for multi-material objects
 * - StateMaterialSet calls setOpacity() to control transparency across all interactive states
 * - When setOpacity(0) is called, materials become completely transparent
 * - When setOpacity(1.0) is called, materials return to their original opacity values
 *
 * @example
 * ```typescript
 * import { StateMaterial } from '@masatomakino/threejs-interactive-object';
 * import { MeshBasicMaterial } from 'three';
 *
 * // Single material
 * const material = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.8 });
 * const stateMaterial = new StateMaterial(material);
 *
 * // Multi-material array (e.g., for BoxGeometry with different materials per face)
 * const materials = [
 *   new MeshBasicMaterial({ color: 0xff0000 }), // +X face
 *   new MeshBasicMaterial({ color: 0x00ff00 }), // -X face
 *   new MeshBasicMaterial({ color: 0x0000ff }), // +Y face
 *   new MeshBasicMaterial({ color: 0xffff00 }), // -Y face
 *   new MeshBasicMaterial({ color: 0xff00ff }), // +Z face
 *   new MeshBasicMaterial({ color: 0x00ffff })  // -Z face
 * ];
 * const stateMultiMaterial = new StateMaterial(materials);
 *
 * // Control opacity
 * stateMaterial.setOpacity(0.5); // Sets to 50% of original opacity
 * ```
 *
 * @see {@link StateMaterialSet} - Container class that manages multiple StateMaterial instances
 *
 * @public
 */
export class StateMaterial {
  private _material!: StateMaterialType;
  private alpha: number = 1.0;
  private alphaArray!: number[];

  /**
   * Creates a new StateMaterial instance.
   *
   * @param material - The Three.js material or array of materials to manage
   *
   * @example
   * ```typescript
   * // Single material
   * const material = new MeshBasicMaterial({ color: 0xff0000 });
   * const stateMaterial = new StateMaterial(material);
   *
   * // Material array (for multi-face geometries like BoxGeometry)
   * const materials = [
   *   new MeshBasicMaterial({ color: 0xff0000 }), // Face 1
   *   new MeshBasicMaterial({ color: 0x00ff00 }), // Face 2
   *   new MeshBasicMaterial({ color: 0x0000ff })  // Face 3...
   * ];
   * const stateMultiMaterial = new StateMaterial(materials);
   * ```
   */
  constructor(material: StateMaterialType) {
    this.material = material;
  }

  private updateAlpha(): void {
    if (Array.isArray(this._material)) {
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

  /**
   * Sets the material and updates internal alpha values.
   *
   * @param value - The Three.js material or array of materials to set
   *
   * @remarks
   * Automatically preserves the original opacity values of the provided materials
   * for later use in opacity calculations.
   */
  set material(value: StateMaterialType) {
    this._material = value;
    this.updateAlpha();
  }

  /**
   * Gets the current material.
   *
   * @returns The managed Three.js material or array of materials
   */
  get material(): StateMaterialType {
    return this._material;
  }

  /**
   * Sets the opacity of the managed material(s).
   *
   * @param opacity - The opacity multiplier (0.0 to 1.0)
   *
   * @remarks
   * The final opacity is calculated as: setOpacity() parameter × original material opacity.
   * Original opacity values are preserved from construction time to enable proportional scaling.
   *
   * @example
   * ```typescript
   * // Set to 50% of original opacity
   * stateMaterial.setOpacity(0.5);
   *
   * // Make completely transparent
   * stateMaterial.setOpacity(0.0);
   *
   * // Restore original opacity
   * stateMaterial.setOpacity(1.0);
   * ```
   */
  public setOpacity(opacity: number): void {
    if (Array.isArray(this._material)) {
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
  materials: StateMaterial[] = [];
  constructor(param: {
    normal: StateMaterialType;
    over?: StateMaterialType;
    down?: StateMaterialType;
    disable?: StateMaterialType;
    normalSelect?: StateMaterialType;
    overSelect?: StateMaterialType;
    downSelect?: StateMaterialType;
  }) {
    this.normal = new StateMaterial(param.normal);
    this.over = StateMaterialSet.initMaterial(param.over, this.normal);
    this.down = StateMaterialSet.initMaterial(param.down, this.normal);
    this.disable = StateMaterialSet.initMaterial(param.disable, this.normal);
    this.normalSelect = StateMaterialSet.initMaterial(
      param.normalSelect,
      this.normal,
    );
    this.overSelect = StateMaterialSet.initMaterial(
      param.overSelect,
      this.normal,
    );
    this.downSelect = StateMaterialSet.initMaterial(
      param.downSelect,
      this.normal,
    );

    this.init();
  }

  private static initMaterial(
    value: StateMaterialType | undefined,
    defaultMaterial: StateMaterial,
  ): StateMaterial {
    if (value == null) return defaultMaterial;
    return new StateMaterial(value);
  }

  public init(): void {
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

  public getMaterial(
    state: ClickableState,
    mouseEnabled: boolean,
    isSelected: boolean = false,
  ): StateMaterial {
    //無効状態はstateよりも優先
    if (!mouseEnabled) {
      return this.disable;
    }

    switch (state) {
      case "normal":
        return isSelected ? this.normalSelect : this.normal;
      case "down":
        return isSelected ? this.downSelect : this.down;
      case "over":
        return isSelected ? this.overSelect : this.over;
    }

    return this.normal;
  }

  public setOpacity(opacity: number) {
    this.materials.forEach((mat) => {
      mat.setOpacity(opacity);
    });
  }
}
