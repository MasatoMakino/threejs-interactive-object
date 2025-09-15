import {
  MeshBasicMaterial,
  SpriteMaterial,
  type Texture,
  TextureLoader,
} from "three";
import { StateMaterialSet } from "../src/index.js";

/**
 * Creates a new StateMaterialSet configured for Mesh testing
 *
 * @returns StateMaterialSet with MeshBasicMaterial instances for all interaction states
 *
 * @description
 * Generates a complete material set for mesh-based interactive objects including:
 * - Normal states: normal (0.6 opacity), over (0.8), down (1.0), disable (0.1)
 * - Selected states: normalSelect, overSelect, downSelect (same opacities with yellow color)
 * All materials use MeshBasicMaterial with transparency enabled.
 */
export function getMeshMaterialSet(): StateMaterialSet {
  return new StateMaterialSet({
    normal: getMeshMaterial(0.6),
    over: getMeshMaterial(0.8),
    down: getMeshMaterial(1.0),
    disable: getMeshMaterial(0.1),
    normalSelect: getMeshMaterial(0.6, 0xffff00),
    overSelect: getMeshMaterial(0.8, 0xffff00),
    downSelect: getMeshMaterial(1.0, 0xffff00),
  });
}

/**
 * Creates a MeshBasicMaterial with specified opacity and color
 *
 * @param opacity - Material opacity (0.0 to 1.0)
 * @param color - Optional color value (default: 0xffffff white)
 * @returns MeshBasicMaterial configured for interactive object testing
 */
const getMeshMaterial = (opacity: number, color?: number) => {
  if (color == null) color = 0xffffff;
  return new MeshBasicMaterial({
    color: color,
    opacity: opacity,
    transparent: true,
  });
};

/**
 * Creates a new StateMaterialSet configured for Sprite testing
 *
 * @returns StateMaterialSet with SpriteMaterial instances for all interaction states
 *
 * @description
 * Generates a complete material set for sprite-based interactive objects including:
 * - Normal states: normal (0.6 opacity), over (0.8), down (1.0), disable (0.1)
 * - Selected states: normalSelect (0.65), overSelect (0.85), downSelect (0.95)
 * All materials use SpriteMaterial with transparency enabled.
 */
export function getSpriteMaterialSet(): StateMaterialSet {
  return new StateMaterialSet({
    normal: getSpriteMaterial(0.6),
    over: getSpriteMaterial(0.8),
    down: getSpriteMaterial(1.0),
    disable: getSpriteMaterial(0.1),
    normalSelect: getSpriteMaterial(0.65),
    overSelect: getSpriteMaterial(0.85),
    downSelect: getSpriteMaterial(0.95),
  });
}

/**
 * Creates a SpriteMaterial with specified properties
 *
 * @param opacity - Material opacity (0.0 to 1.0)
 * @param imgURL - Optional image URL for texture mapping
 * @param color - Optional color value (default: 0xffffff white)
 * @returns SpriteMaterial configured for interactive sprite testing
 *
 * @description
 * Creates a SpriteMaterial with transparency enabled. If imgURL is provided,
 * loads the texture using TextureLoader and applies it as the material's map.
 */
const getSpriteMaterial = (
  opacity: number,
  imgURL?: string,
  color?: number,
) => {
  if (color == null) color = 0xffffff;
  let map: Texture | null = null;
  if (imgURL != null) {
    map = new TextureLoader().load(imgURL);
  }
  return new SpriteMaterial({
    map: map,
    color: color,
    opacity: opacity,
    transparent: true,
  });
};
