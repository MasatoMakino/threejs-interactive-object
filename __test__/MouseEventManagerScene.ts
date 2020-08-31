import { RAFTicker, RAFTickerEventType } from "raf-ticker";
import { Camera, PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { MouseEventManager } from "../src";

interface Offset {
  x: number;
  y: number;
}
export class MouseEventManagerScene {
  public canvas: HTMLCanvasElement;
  public scene: Scene;
  public renderer: WebGLRenderer;
  public camera: Camera;

  private offset: Offset;

  constructor() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.canvas.style.setProperty("margin", "0");
    this.canvas.style.setProperty("padding", "0");
    document.body.appendChild(this.canvas);

    this.offset = this.getOffset();

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(
      45,
      this.canvas.width / this.canvas.height,
      1,
      400
    );
    this.camera.position.set(0, 0, 100);
    this.scene.add(this.camera);

    const renderOption = {
      canvas: this.canvas,
    };
    this.renderer = new WebGLRenderer(renderOption);
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    //マウスイベントの取得開始
    MouseEventManager.init(this.scene, this.camera, this.renderer);
  }

  private getOffset(): Offset {
    const spyClick = jest.fn((e) => e);
    this.canvas.addEventListener("mouseleave", spyClick);
    this.canvas.dispatchEvent(new MouseEvent("mouseleave"));
    const result = spyClick.mock.results[0].value;
    this.canvas.removeEventListener("mouseleave", spyClick);
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
      delta: MouseEventManager.throttlingTime_ms * ratio,
    });
    this.render();
  }

  public reset() {
    const e = new MouseEvent("mouseup", { clientX: 0, clientY: 0 });
    this.canvas.dispatchEvent(e);
  }

  public dispatchMouseEvent(type: string, x: number, y: number): void {
    const e = new MouseEvent(type, {
      clientX: x + this.offset.x,
      clientY: y + this.offset.y,
    });
    this.canvas.dispatchEvent(e);
  }
}
