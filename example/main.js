import {
  ClickableMesh,
  CheckBoxMesh,
  StateMaterialSet,
  StateMaterial,
  ClickableSprite,
  CheckBoxSprite,
  RadioButtonMesh,
  MouseEventManager,
  RadioButtonManager,
  ThreeMouseEvent,
  ThreeMouseEventType
} from "../bin/index.js";
import {
  Scene,
  WebGLRenderer,
  AmbientLight,
  Color,
  BoxBufferGeometry,
  MeshBasicMaterial,
  PerspectiveCamera,
  SpriteMaterial,
  TextureLoader
} from "three";

const W = 1920;
const H = 1080;
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
    antialias: true
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
    })
  });

  const clickable = new ClickableMesh({
    geo: geometry,
    material: matSet
  });

  clickable.position.set(-10, 20, 0);
  scene.add(clickable);
};

const testCheckbox = () => {
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
      opacity: 0.6,
      transparent: true
    }),
    overSelect: new MeshBasicMaterial({
      color: 0xffff00,
      opacity: 0.8,
      transparent: true
    }),
    downSelect: new MeshBasicMaterial({
      color: 0xffff00,
      opacity: 1.0,
      transparent: true
    })
  });

  const clickable = new CheckBoxMesh({
    geo: geometry,
    material: matSet
  });

  clickable.position.set(0, 20, 0);
  scene.add(clickable);
};

const testSprite = () => {
  const matSet = new StateMaterialSet({
    normal: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_01.png"),
      color: 0xffffff
    }),
    over: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_02.png"),
      color: 0xffffff
    }),
    down: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_03.png"),
      color: 0xffffff
    })
  });

  const clickable = new ClickableSprite(matSet);
  clickable.position.set(10, 20, 0);
  const scale = 4.0;
  clickable.scale.set(scale, scale, scale);
  scene.add(clickable);
};

const testSelectableSprite = () => {
  const matSet = new StateMaterialSet({
    normal: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_01.png"),
      color: 0xffffff,
      opacity: 0.3,
      transparent: true
    }),
    over: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_02.png"),
      color: 0xffffff,
      opacity: 0.3,
      transparent: true
    }),
    down: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_03.png"),
      color: 0xffffff,
      opacity: 0.3,
      transparent: true
    }),
    normalSelect: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_01.png"),
      color: 0xffffff,
      opacity: 1.0,
      transparent: true,
      name: "normalSelect"
    }),
    overSelect: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_02.png"),
      color: 0xffffff,
      opacity: 1.0,
      transparent: true,
      name: "overSelect"
    }),
    downSelect: new SpriteMaterial({
      map: new TextureLoader().load("./btn045_03.png"),
      color: 0xffffff,
      opacity: 1.0,
      transparent: true,
      name: "downSelect"
    })
  });

  const selectable = new CheckBoxSprite(matSet);
  selectable.position.set(20, 20, 0);
  const scale = 4.0;
  selectable.scale.set(scale, scale, scale);
  scene.add(selectable);
};

const testRadio = () => {
  const geometry = new BoxBufferGeometry(3, 3, 3);

  const getMaterialSet = () => {
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
        opacity: 0.6,
        transparent: true
      }),
      overSelect: new MeshBasicMaterial({
        color: 0xffff00,
        opacity: 0.8,
        transparent: true
      }),
      downSelect: new MeshBasicMaterial({
        color: 0xffff00,
        opacity: 1.0,
        transparent: true
      })
    });
    return matSet;
  };

  const initButton = (x, buttonValue) => {
    const button = new RadioButtonMesh({
      geo: geometry,
      material: getMaterialSet()
    });
    button.position.set(x, -10, 0);
    button.value = buttonValue;
    scene.add(button);
    return button;
  };

  const manager = new RadioButtonManager();
  manager.addButton(initButton(-10, "button01"));
  manager.addButton(initButton(0, Math.PI));
  manager.addButton(initButton(10, { value01: 1, value02: 2 }));
  manager.addButton(initButton(20, undefined));

  manager.addEventListener(ThreeMouseEventType.SELECT, e => {
    console.log(e.button.value);
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
