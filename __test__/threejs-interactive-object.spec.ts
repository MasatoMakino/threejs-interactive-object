import {
  Scene,
  PerspectiveCamera,
  MeshBasicMaterial,
  BoxBufferGeometry
} from "three";
import { ClickableMesh, StateMaterialSet } from "../src/index";

const W = 1920;
const H = 1080;

describe("ClickableMesh", () => {
  // シーンを作成
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, W / H, 1, 400);
  camera.position.set(0, 0, 100);
  scene.add(camera);

  let clickable: ClickableMesh;
  let matSet;

  test("初期化", () => {
    const geometry = new BoxBufferGeometry(3, 3, 3);
    matSet = new StateMaterialSet({
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

    clickable = new ClickableMesh({
      geo: geometry,
      material: matSet
    });
    scene.add(clickable);

    expect(clickable.material).toBe(matSet.normal.material);
  });

  test("マウスオーバー", () => {});

  test("マウスアウト", () => {});

  test("マウスダウン", () => {});

  test("クリック", () => {});
});
