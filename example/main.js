import * as THREE from "three";
import {
  ClickableMesh,
  CheckBoxMesh,
  StateMaterialSet,
  StateMaterial
} from "../bin/index.js";
import { BoxBufferGeometry } from "three";
import { MeshBasicMaterial } from "three";
import { MouseEventManager } from "../bin/MouseEventManager";

const W = 1920;
const H = 1080;
let renderer;
let scene;
let camera;

const onDomContentsLoaded = () => {
  // シーンを作成
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, W / H, 1, 400);
  camera.position.set(0, 0, 100);
  scene.add(camera);

  const renderOption = {
    canvas: document.getElementById("webgl-canvas"),
    antialias: true
  };
  renderer = new THREE.WebGLRenderer(renderOption);
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize(W, H);
  renderer.setPixelRatio(window.devicePixelRatio);

  //平行光源オブジェクト(light)の設定
  const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  //マウスイベントの取得開始
  MouseEventManager.init(scene, camera, renderer);

  testButton();
  testCheckbox();
  testSprite();

  render();
};

const testButton = () => {
  const geometry = new BoxBufferGeometry(3, 3, 3);

  const matSet = new StateMaterialSet({
    normal: new MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.6,
      transparent: true
    }),
    over: new MeshBasicMaterial({
      color: 0xffffff,
      opacity: 0.8,
      transparent: true
    }),
    down: new MeshBasicMaterial({
      color: 0xffffff,
      opacity: 1.0,
      transparent: true
    }),
    normalSelect: new MeshBasicMaterial({
      color: 0xffff00,
      opacity: 0.4,
      transparent: true
    }),
    overSelect: new MeshBasicMaterial({
      color: 0xffff00,
      opacity: 0.8,
      transparent: true
    })
  });

  const clickable = new CheckBoxMesh({
    geo: geometry,
    material: matSet
  });

  clickable.position.set(10, -10, 0);
  scene.add(clickable);
};

const testCheckbox = () => {};

const testSprite = () => {};

const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

/**
 * DOMContentLoaded以降に初期化処理を実行する
 */
window.onload = onDomContentsLoaded;
