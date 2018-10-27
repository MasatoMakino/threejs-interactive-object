import { MeshBasicMaterial, TextureLoader, SpriteMaterial } from "three";
import { StateMaterialSet } from "../src/index";

/**
 * Mesh用のマテリアルセットを新規に取得する。
 * @returns {StateMaterialSet}
 */
export function getMeshMaterialSet(): StateMaterialSet {
  return new StateMaterialSet({
    normal: getMeshMaterial(0.6),
    over: getMeshMaterial(0.8),
    down: getMeshMaterial(1.0),
    normalSelect: getMeshMaterial(0.6, 0xffff00),
    overSelect: getMeshMaterial(0.8, 0xffff00),
    downSelect: getMeshMaterial(1.0, 0xffff00)
  });
}

const getMeshMaterial = (opacity: number, color?: number) => {
  if (color == null) color = 0xffffff;
  return new MeshBasicMaterial({
    color: color,
    opacity: opacity,
    transparent: true
  });
};

/**
 * スプライト用のマテリアルセットを新規に生成する。
 */
export function getSpriteMaterialSet(): StateMaterialSet {
  return new StateMaterialSet({
    normal: getSpriteMaterial(0.6),
    over: getSpriteMaterial(0.8),
    down: getSpriteMaterial(1.0),
    disable: getSpriteMaterial(0.1),
    normalSelect: getSpriteMaterial(0.65),
    overSelect: getSpriteMaterial(0.85),
    downSelect: getSpriteMaterial(0.95)
  });
}

/**
 * スプライト用マテリアルを生成する
 * @param {number} opacity
 * @param {string} imgURL
 * @param {number} color
 * @returns {SpriteMaterial}
 */
const getSpriteMaterial = (
  opacity: number,
  imgURL?: string,
  color?: number
) => {
  if (color == null) color = 0xffffff;
  let map;
  if (imgURL != null) {
    map = new TextureLoader().load(imgURL);
  }
  return new SpriteMaterial({
    map: map,
    color: color,
    opacity: opacity,
    transparent: true
  });
};
