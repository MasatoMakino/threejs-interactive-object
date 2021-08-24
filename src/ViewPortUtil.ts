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
   * ViewportをCanvas内のRectangleに変換する
   * @param canvas
   * @param viewport
   */
  static convertToRectangle(
    canvas: HTMLCanvasElement,
    viewport: Vector4
  ): Rectangle {
    return {
      x1: viewport.x,
      x2: viewport.x + viewport.width,
      y1: canvas.height - (viewport.y + viewport.height),
      y2: canvas.height - viewport.y,
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
    viewport: Vector4
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
    const x = (event.offsetX / canvas.clientWidth) * 2 - 1;
    const y = -(event.offsetY / canvas.clientHeight) * 2 + 1;
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
