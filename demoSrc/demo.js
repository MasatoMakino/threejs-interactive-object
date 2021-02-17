import {
  CheckBoxMesh,
  CheckBoxSprite,
  ClickableMesh,
  ClickableSprite,
  MouseEventManager,
  RadioButtonManager,
  RadioButtonMesh,
  StateMaterialSet,
  ThreeMouseEventType,
} from "..";
import {
  AmbientLight,
  BoxBufferGeometry,
  Color,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SpriteMaterial,
  TextureLoader,
  WebGLRenderer,
} from "three";

const W = 1280;
const H = 900;
let renderer;
let scene;
let camera;

const onDomContentsLoaded = () => {
  // シーンを作成
  scene = new Scene();
  camera = new PerspectiveCamera(45, W / H, 1, 400);
  camera.position.set(0, 0, 100);
  scene.add(camera);

  const renderOption = {
    canvas: document.getElementById("webgl-canvas"),
    antialias: true,
  };
  renderer = new WebGLRenderer(renderOption);
  renderer.setClearColor(new Color(0x000000));
  renderer.setSize(W, H);
  renderer.setPixelRatio(window.devicePixelRatio);

  //平行光源オブジェクト(light)の設定
  const ambientLight = new AmbientLight(0xffffff, 1.0);
  scene.add(ambientLight);

  //マウスイベントの取得開始
  MouseEventManager.init(scene, camera, renderer);

  testButton();
  testCheckbox();
  testSprite();
  testSelectableSprite();
  testRadio();

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

const testButton = () => {
  const geometry = new BoxBufferGeometry(3, 3, 3);
  const clickable = new ClickableMesh({
    geo: geometry,
    material: getMaterialSet(),
  });

  clickable.position.set(-10, 20, 0);
  scene.add(clickable);
};

const testCheckbox = () => {
  const geometry = new BoxBufferGeometry(3, 3, 3);
  const clickable = new CheckBoxMesh({
    geo: geometry,
    material: getMaterialSet(),
  });

  clickable.position.set(0, 20, 0);
  scene.add(clickable);
};

const testSprite = () => {
  const clickable = new ClickableSprite(getSpriteMaterialSet());
  alignSprite(clickable, 10);
};

const testSelectableSprite = () => {
  const selectable = new CheckBoxSprite(getSpriteMaterialSet());
  alignSprite(selectable, 20);
};

const alignSprite = (sprite, x) => {
  sprite.position.set(x, 20, 0);
  const scale = 4.0;
  sprite.scale.set(scale, scale, scale);
  scene.add(sprite);
};

const testRadio = () => {
  const geometry = new BoxBufferGeometry(3, 3, 3);

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
    initButton(10, { value01: 1, value02: 2 })
  );
  manager.addButton(initButton(20, undefined));

  manager.addEventListener(ThreeMouseEventType.SELECT, (e) => {
    console.log(e.model.value);
  });
};

const render = () => {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

/**
 * DOMContentLoaded以降に初期化処理を実行する
 */
window.onload = onDomContentsLoaded;
