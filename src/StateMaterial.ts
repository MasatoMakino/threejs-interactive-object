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
 * - Preserves original opacity values at construction time for proportional scaling
 * - Final opacity = setOpacity() parameter × original material opacity
 * - Supports both single materials and material arrays for multi-material objects
 * - Controlled by StateMaterialSet for synchronized transparency across interactive states
 *
 * @example
 * ```typescript
 * import { StateMaterial } from '@masatomakino/threejs-interactive-object';
 * import { MeshBasicMaterial } from 'three';
 *
 * // Single material
 * const material = new MeshBasicMaterial({ color: 0xff0000, opacity: 0.8, transparent: true });
 * const stateMaterial = new StateMaterial(material);
 *
 * // Multi-material array (e.g., for BoxGeometry with different materials per face)
 * const materials = [
 *   new MeshBasicMaterial({ color: 0xff0000, transparent: true }), // +X face
 *   new MeshBasicMaterial({ color: 0x00ff00, transparent: true }), // -X face
 *   new MeshBasicMaterial({ color: 0x0000ff, transparent: true }), // +Y face
 *   new MeshBasicMaterial({ color: 0xffff00, transparent: true }), // -Y face
 *   new MeshBasicMaterial({ color: 0xff00ff, transparent: true }), // +Z face
 *   new MeshBasicMaterial({ color: 0x00ffff, transparent: true })  // -Z face
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
   * Automatically captures original opacity values for proportional calculations.
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
   * Uses preserved original opacity values for proportional scaling.
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

/**
 * A comprehensive material manager for interactive object states.
 *
 * @description
 * StateMaterialSet manages multiple StateMaterial instances for different interactive states
 * including normal, hover, down, disable, and their selected variants. It provides intelligent
 * state-based material selection with priority logic and unified opacity control across all
 * managed materials for coordinated visual feedback.
 *
 * @remarks
 * - Only `normal` material is required; unspecified states automatically use the normal material
 * - `disable` state has priority over interaction states (normal, over, down)
 * - Supports both regular and selected variants for each interaction state
 * - Provides unified opacity control across all managed materials
 * - Handles state transitions with appropriate material switching
 *
 * @example
 * ```typescript
 * // Minimal setup with only normal material
 * const materialSet = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x888888 })
 * });
 *
 * // Complete setup with hover, disable, and selected states
 * const fullMaterialSet = new StateMaterialSet({
 *   normal: new MeshBasicMaterial({ color: 0x888888 }),
 *   over: new MeshBasicMaterial({ color: 0xaaaaaa }),
 *   disable: new MeshBasicMaterial({ color: 0x444444 }),
 *   normalSelect: new MeshBasicMaterial({ color: 0x0088ff })
 * });
 * ```
 *
 * @see {@link StateMaterial} - Individual material manager managed by this class
 * @see {@link ClickableState} - Enumeration of available interactive states
 *
 * @public
 */
export class StateMaterialSet {
  normal!: StateMaterial;
  over!: StateMaterial;
  down!: StateMaterial;
  disable!: StateMaterial;
  normalSelect!: StateMaterial;
  overSelect!: StateMaterial;
  downSelect!: StateMaterial;
  materials: StateMaterial[] = [];

  /**
   * Creates a new StateMaterialSet with the specified materials for different states.
   *
   * @param param - Configuration object containing materials for each state
   * @param param.normal - Material for normal state (required)
   * @param param.over - Material for hover state (optional, fallback to normal)
   * @param param.down - Material for pressed state (optional, fallback to normal)
   * @param param.disable - Material for disabled state (optional, fallback to normal)
   * @param param.normalSelect - Material for normal selected state (optional, fallback to normal)
   * @param param.overSelect - Material for hover selected state (optional, fallback to normal)
   * @param param.downSelect - Material for pressed selected state (optional, fallback to normal)
   *
   * @example
   * ```typescript
   * // Basic usage
   * const materialSet = new StateMaterialSet({
   *   normal: new MeshBasicMaterial({ color: 0x888888 }),
   *   over: new MeshBasicMaterial({ color: 0xaaaaaa })
   * });
   * ```
   *
   * @throws {Error} When normal material is not provided
   */
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

  /**
   * Gets the appropriate StateMaterial for the given interaction state and conditions.
   *
   * @param state - The current interaction state (normal, over, down)
   * @param enabled - Whether the interaction handler is enabled
   * @param isSelected - Whether the object is in selected state (default: false)
   * @returns The StateMaterial instance for the specified conditions
   *
   * @remarks
   * State selection priority:
   * 1. If enabled is false, always returns disable material
   * 2. Otherwise, returns the appropriate material based on state and selection:
   *    - normal + selected = normalSelect
   *    - over + selected = overSelect
   *    - down + selected = downSelect
   *    - normal = normal
   *    - over = over
   *    - down = down
   *
   * @example
   * ```typescript
   * const materialSet = new StateMaterialSet({
   *   normal: normalMat,
   *   over: hoverMat,
   *   disable: disabledMat
   * });
   *
   * // Get normal material
   * const normal = materialSet.getMaterial("normal", true, false);
   *
   * // Get hover material for selected object
   * const hoverSelected = materialSet.getMaterial("over", true, true);
   *
   * // Get disabled material (ignores state and selection)
   * const disabled = materialSet.getMaterial("over", false, true);
   * ```
   */
  public getMaterial(
    state: ClickableState,
    enabled: boolean,
    isSelected: boolean = false,
  ): StateMaterial {
    if (!enabled) {
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

  /**
   * Sets the opacity for all managed materials simultaneously.
   *
   * @param opacity - The opacity multiplier to apply (0.0 to 1.0)
   *
   * @remarks
   * Applies the opacity multiplier to all managed StateMaterial instances simultaneously.
   *
   * @example
   * ```typescript
   * // Set all materials to 50% of their original opacity
   * materialSet.setOpacity(0.5);
   *
   * // Make invisible or restore original opacity
   * materialSet.setOpacity(0.0); // invisible
   * materialSet.setOpacity(1.0); // original
   * ```
   */
  public setOpacity(opacity: number) {
    this.materials.forEach((mat) => {
      mat.setOpacity(opacity);
    });
  }
}
