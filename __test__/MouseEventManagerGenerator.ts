import { Camera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { MouseEventManager } from "../src";

export function generateScene(): {
  canvas: HTMLCanvasElement;
  scene: Scene;
  renderer: WebGLRenderer;
  camera: Camera;
} {
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  canvas.style.setProperty("margin", "0");
  canvas.style.setProperty("padding", "0");
  document.body.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    45,
    canvas.width / canvas.height,
    1,
    400
  );
  camera.position.set(0, 0, 100);
  scene.add(camera);

  const renderOption = {
    canvas: canvas,
  };
  const renderer = new WebGLRenderer(renderOption);
  renderer.setSize(canvas.width, canvas.height);

  //マウスイベントの取得開始
  MouseEventManager.init(scene, camera, renderer);
  return { canvas, scene, renderer, camera };
}
