import { Vector2, Vector4 } from "three";

export interface Rectangle {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/**
 * ViewPort矩形に関する処理を受け持つユーティリティクラス
 */
export class ViewPortUtil {
  /**
   * canvasの高さを取得する。
   *
   * three.jsのWebGLRendererは、devicePixelRatioにあわせてcanvas.heightを変更する。
   * ブラウザの拡大縮小を行うと、devicePixelRatioが変更されるためcanvas.heightを取得できない。
   * そのためまずstyleから高さを取得し、styleがない場合はdevicePixelRatioを加味した高さを取得する。
   *
   * @param canvas
   * @private
   */
  private static getCanvasHeight(canvas: HTMLCanvasElement): number {
    return this.getCanvasSize(canvas, "height");
  }

  private static getCanvasWidth(canvas: HTMLCanvasElement): number {
    return this.getCanvasSize(canvas, "width");
  }

  private static getCanvasSize(
    canvas: HTMLCanvasElement,
    propName: "width" | "height"
  ): number {
    const style = canvas.style;
    if (style.width && style.height) {
      return parseInt(style[propName]);
    } else if (window.devicePixelRatio != null) {
      return canvas[propName] / window.devicePixelRatio;
    }
    return canvas[propName];
  }

  /**
   * ViewportをCanvas内のRectangleに変換する
   * @param canvas
   * @param viewport
   */
  static convertToRectangle(
    canvas: HTMLCanvasElement,
    viewport: Vector4
  ): Rectangle {
    const height = this.getCanvasHeight(canvas);
    return {
      x1: viewport.x,
      x2: viewport.x + viewport.width,
      y1: height - (viewport.y + viewport.height),
      y2: height - viewport.y,
    };
  }

  /**
   * マウスポインターが指定されたviewport内に収まっているかを判定する。
   * @param canvas
   * @param viewport
   * @param event
   */
  static isContain(
    canvas: HTMLCanvasElement,
    viewport: Vector4,
    event: MouseEvent
  ): boolean {
    if (viewport == null) {
      return true;
    }
    const rect = this.convertToRectangle(canvas, viewport);

    return (
      event.offsetX >= rect.x1 &&
      event.offsetX <= rect.x2 &&
      event.offsetY >= rect.y1 &&
      event.offsetY <= rect.y2
    );
  }

  /**
   * マウスイベントをWebGL座標系に変換する
   * @param canvas
   * @param event
   * @param viewport
   * @param mouse オプション 指定された場合、結果をこのVector2に上書きする
   */
  static convertToMousePosition(
    canvas: HTMLCanvasElement,
    event: MouseEvent,
    viewport: Vector4,
    mouse?: Vector2
  ): Vector2 {
    const { x, y } = this.getMousePosition(canvas, event, viewport);

    if (mouse) {
      mouse.set(x, y);
      return mouse;
    }
    return new Vector2(x, y);
  }

  private static getMousePosition(
    canvas: HTMLCanvasElement,
    event: MouseEvent,
    viewport?: Vector4
  ): { x: number; y: number } {
    if (viewport) {
      return this.getViewportMousePosition(canvas, event, viewport);
    }
    return this.getCanvasMousePosition(canvas, event);
  }

  private static getCanvasMousePosition(
    canvas: HTMLCanvasElement,
    event: MouseEvent
  ): { x: number; y: number } {
    const x = (event.offsetX / this.getCanvasWidth(canvas)) * 2 - 1;
    const y = -(event.offsetY / this.getCanvasHeight(canvas)) * 2 + 1;
    return { x, y };
  }

  private static getViewportMousePosition(
    canvas: HTMLCanvasElement,
    event: MouseEvent,
    viewport: Vector4
  ): { x: number; y: number } {
    const rect = this.convertToRectangle(canvas, viewport);

    const mouseX = event.offsetX - rect.x1;
    const mouseY = event.offsetY - rect.y1;
    const width = rect.x2 - rect.x1;
    const height = rect.y2 - rect.y1;

    const x = (mouseX / width) * 2 - 1;
    const y = -(mouseY / height) * 2 + 1;
    return { x, y };
  }
}
