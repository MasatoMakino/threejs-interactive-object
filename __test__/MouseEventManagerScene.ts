import { RAFTicker, RAFTickerEventType } from "raf-ticker";
import { Camera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { MouseEventManager } from "../src";
import { getMouseEvent } from "fake-mouse-event";

export class MouseEventManagerScene {
  public scene: Scene;
  public renderer: WebGLRenderer;
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
      400
    );
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    const glContext = require("gl")(1, 1);
    const renderOption = {
      context: glContext,
    };
    this.renderer = new WebGLRenderer(renderOption);
    this.renderer.setSize(MouseEventManagerScene.W, MouseEventManagerScene.H);
    document.body.appendChild(this.renderer.domElement);

    //マウスイベントの取得開始
    this.manager = new MouseEventManager(
      this.scene,
      this.camera,
      this.renderer.domElement
    );
  }

  public render(): void {
    this.renderer.render(this.scene, this.camera);
  }
  public interval(ratio: number = 2.0): void {
    RAFTicker.emit(RAFTickerEventType.tick, {
      timestamp: 0,
      delta: this.manager.throttlingTime_ms * ratio,
    });
    this.render();
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
    this.renderer.domElement.dispatchEvent(e);
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
    this.renderer.domElement.dispatchEvent(e);
  }
}
