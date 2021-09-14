import { RAFTicker, RAFTickerEventType } from "raf-ticker";
import { Camera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { MouseEventManager } from "../src";

interface Offset {
  x: number;
  y: number;
}
export class MouseEventManagerScene {
  public scene: Scene;
  public renderer: WebGLRenderer;
  public camera: Camera;
  public manager: MouseEventManager;
  private offset: Offset;

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

    const glContext = require("gl")(
      MouseEventManagerScene.W,
      MouseEventManagerScene.H
    );
    const renderOption = {
      context: glContext,
    };
    this.renderer = new WebGLRenderer(renderOption);
    this.renderer.setSize(MouseEventManagerScene.W, MouseEventManagerScene.H);
    document.body.appendChild(this.renderer.domElement);

    this.offset = this.getOffset();

    //マウスイベントの取得開始
    this.manager = new MouseEventManager(
      this.scene,
      this.camera,
      this.renderer.domElement
    );
  }

  private getOffset(): Offset {
    const spyClick = jest.fn((e) => e);
    this.renderer.domElement.addEventListener("mouseleave", spyClick);
    this.renderer.domElement.dispatchEvent(new MouseEvent("mouseleave"));
    const result = spyClick.mock.results[0].value;
    this.renderer.domElement.removeEventListener("mouseleave", spyClick);
    return {
      x: -result.offsetX,
      y: -result.offsetY,
    };
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
    const e = new MouseEvent("mouseup", { clientX: 0, clientY: 0 });
    this.renderer.domElement.dispatchEvent(e);
  }

  public dispatchMouseEvent(type: string, x: number, y: number): void {
    const e = new MouseEvent(type, {
      clientX: x + this.offset.x,
      clientY: y + this.offset.y,
    });
    this.renderer.domElement.dispatchEvent(e);
  }
}
