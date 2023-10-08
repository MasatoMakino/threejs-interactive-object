import {
  CheckBoxMesh,
  CheckBoxSprite,
  ClickableMesh,
  ClickableSprite,
  MouseEventManager,
  RadioButtonManager,
  RadioButtonMesh,
  StateMaterialSet,
} from "../esm/index.js";
import {
  AmbientLight,
  BoxGeometry,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SpriteMaterial,
  TextureLoader,
  Vector4,
  WebGLRenderer,
} from "three";

const W = 1280;
const H = 900;

class SceneSet {
  bg;
  viewport;
  scene;
  camera;
  manager;
  constructor(x, y, w, h, canvas, bg) {
    this.viewport = new Vector4(x, y, w, h);
    this.bg = bg;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, w / h, 1, 400);
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    //平行光源オブジェクト(light)の設定
    const ambientLight = new AmbientLight(0xffffff, 1.0);
    this.scene.add(ambientLight);

    this.manager = new MouseEventManager(this.scene, this.camera, canvas, {
      viewport: this.viewport,
    });

    testButton(this.scene);
    testCheckbox(this.scene);
    testSprite(this.scene);
    testSelectableSprite(this.scene);
    testRadio(this.scene);
  }

  render(renderer) {
    renderer.setClearColor(this.bg);
    renderer.clearDepth(); // important!
    renderer.setScissorTest(true);

    renderer.setScissor(this.viewport);
    renderer.setViewport(this.viewport);
    renderer.clear();

    renderer.render(this.scene, this.camera);
    renderer.setScissorTest(false);
  }
}

const onDomContentsLoaded = () => {
  // シーンを作成
  const canvas = document.getElementById("webgl-canvas");
  const renderOption = {
    canvas,
  };
  const renderer = new WebGLRenderer(renderOption);
  renderer.autoClear = false;
  renderer.setSize(W, H);
  renderer.setPixelRatio(window.devicePixelRatio);

  const scene1 = new SceneSet(20, 20, 480, 360, canvas, 0x222222);
  const scene2 = new SceneSet(480, 360, 520, 480, canvas, 0x444444);

  const render = () => {
    renderer.setClearColor(0x000000);
    renderer.clear();

    scene1.render(renderer);
    scene2.render(renderer);
    requestAnimationFrame(render);
  };
  render();
};

/**
 * Mesh用のマテリアルセットを新規に取得する。
 * @returns {StateMaterialSet}
 */
const getMaterialSet = () => {
  return new StateMaterialSet({
    normal: getMeshMaterial(0.6),
    over: getMeshMaterial(0.8),
    down: getMeshMaterial(1.0),
    normalSelect: getMeshMaterial(0.6, 0xffff00),
    overSelect: getMeshMaterial(0.8, 0xffff00),
    downSelect: getMeshMaterial(1.0, 0xffff00),
  });
};

const getMeshMaterial = (opacity, color) => {
  if (color == null) color = 0xffffff;
  return new MeshBasicMaterial({
    color: color,
    opacity: opacity,
    transparent: true,
  });
};

/**
 * スプライト用のマテリアルセットを新規に生成する。
 */
const getSpriteMaterialSet = () => {
  return new StateMaterialSet({
    normal: getSpriteMaterial("./btn045_01.png", 1.0),
    over: getSpriteMaterial("./btn045_02.png", 1.0),
    down: getSpriteMaterial("./btn045_03.png", 1.0),
    normalSelect: getSpriteMaterial("./btn045_01.png", 0.5),
    overSelect: getSpriteMaterial("./btn045_02.png", 0.5),
    downSelect: getSpriteMaterial("./btn045_03.png", 0.5),
  });
};

/**
 * スプライト用マテリアルを生成する
 * @param img マップ画像URL
 * @param opacity 透過度
 * @param color カラー
 * @returns {SpriteMaterial}
 */
const getSpriteMaterial = (img, opacity, color) => {
  if (color == null) color = 0xffffff;
  return new SpriteMaterial({
    map: new TextureLoader().load(img),
    color: color,
    opacity: opacity,
    transparent: true,
  });
};

const testButton = (scene) => {
  const geometry = new BoxGeometry(6, 6, 6);
  const clickable = new ClickableMesh({
    geo: geometry,
    material: getMaterialSet(),
  });

  clickable.position.set(-10, 20, 0);
  scene.add(clickable);
};

const testCheckbox = (scene) => {
  const geometry = new BoxGeometry(6, 6, 6);
  const clickable = new CheckBoxMesh({
    geo: geometry,
    material: getMaterialSet(),
  });

  clickable.position.set(0, 20, 0);
  scene.add(clickable);
};

const testSprite = (scene) => {
  const clickable = new ClickableSprite(getSpriteMaterialSet());
  alignSprite(scene, clickable, 10);
};

const testSelectableSprite = (scene) => {
  const selectable = new CheckBoxSprite(getSpriteMaterialSet());
  alignSprite(scene, selectable, 20);
};

const alignSprite = (scene, sprite, x) => {
  sprite.position.set(x, 20, 0);
  const scale = 8.0;
  sprite.scale.set(scale, scale, scale);
  scene.add(sprite);
};

const testRadio = (scene) => {
  const geometry = new BoxGeometry(6, 6, 6);

  const initButton = (x, buttonValue) => {
    const button = new RadioButtonMesh({
      geo: geometry,
      material: getMaterialSet(),
    });
    button.position.set(x, -10, 0);
    button.model.value = buttonValue;
    scene.add(button);
    return button;
  };

  const manager = new RadioButtonManager();

  manager.addButton(
    initButton(-10, "button01"),
    initButton(0, Math.PI),
    initButton(10, { value01: 1, value02: 2 }),
  );
  manager.addButton(initButton(20, undefined));

  manager.on("select", (e) => {
    console.log(e.model.value);
  });
};

/**
 * DOMContentLoaded以降に初期化処理を実行する
 */
window.onload = onDomContentsLoaded;
