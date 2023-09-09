import { getMouseEvent } from "@masatomakino/fake-mouse-event";
import { RAFTicker } from "@masatomakino/raf-ticker";
import { Camera, PerspectiveCamera, Scene } from "three";
import { MouseEventManager } from "../src/index.js";

export class MouseEventManagerScene {
  public scene: Scene;
  public canvas: HTMLCanvasElement;
  public camera: Camera;
  public manager: MouseEventManager;

  public static readonly W = 1920;
  public static readonly H = 1080;

  constructor() {
    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      45,
      MouseEventManagerScene.W / MouseEventManagerScene.H,
      1,
      400,
    );
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    this.canvas = document.createElement("canvas");
    this.canvas.width = MouseEventManagerScene.W;
    this.canvas.height = MouseEventManagerScene.H;
    this.canvas.style.width = `${MouseEventManagerScene.W}px`;
    this.canvas.style.height = `${MouseEventManagerScene.H}px`;

    //マウスイベントの取得開始
    this.manager = new MouseEventManager(this.scene, this.camera, this.canvas);
  }

  public interval(ratio: number = 2.0): void {
    RAFTicker.emit("tick", {
      timestamp: 0,
      delta: this.manager.throttlingTime_ms * ratio,
    });
    this.scene.updateMatrixWorld();
  }

  public reset() {
    const e = getMouseEvent("mouseup", {
      x: 0,
      y: 0,
      clientX: 0,
      clientY: 0,
      offsetX: 0,
      offsetY: 0,
    });
    this.canvas.dispatchEvent(e);
  }

  public dispatchMouseEvent(type: string, x: number, y: number): void {
    const e = getMouseEvent(type, {
      x,
      y,
      clientX: x,
      clientY: y,
      offsetX: x,
      offsetY: y,
    });
    this.canvas.dispatchEvent(e);
  }
}
