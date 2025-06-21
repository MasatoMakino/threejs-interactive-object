import { Vector2, type Vector4 } from "three";

interface Rectangle {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
}

/**
 * ViewPort矩形に関する処理を受け持つユーティリティ関数群
 */
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
function getCanvasHeight(canvas: HTMLCanvasElement): number {
  return canvas.clientHeight;
}

function getCanvasWidth(canvas: HTMLCanvasElement): number {
  return canvas.clientWidth;
}

/**
 * ViewportをCanvas内のRectangleに変換する
 * @param canvas
 * @param viewport
 */
export function convertToRectangle(
  canvas: HTMLCanvasElement,
  viewport: Vector4,
): Rectangle {
  const height = getCanvasHeight(canvas);
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
export function isContain(
  canvas: HTMLCanvasElement,
  viewport: Vector4 | undefined,
  event: PointerEvent,
): boolean {
  if (viewport == null) {
    return true;
  }
  const rect = convertToRectangle(canvas, viewport);

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
export function convertToMousePosition(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: Vector4 | undefined,
  mouse?: Vector2,
): Vector2 {
  const { x, y } = getMousePosition(canvas, event, viewport);

  if (mouse) {
    mouse.set(x, y);
    return mouse;
  }
  return new Vector2(x, y);
}

function getMousePosition(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport?: Vector4,
): { x: number; y: number } {
  if (viewport) {
    return getViewportMousePosition(canvas, event, viewport);
  }
  return getCanvasMousePosition(canvas, event);
}

function getCanvasMousePosition(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
): { x: number; y: number } {
  const x = (event.offsetX / getCanvasWidth(canvas)) * 2 - 1;
  const y = -(event.offsetY / getCanvasHeight(canvas)) * 2 + 1;
  return { x, y };
}

function getViewportMousePosition(
  canvas: HTMLCanvasElement,
  event: PointerEvent,
  viewport: Vector4,
): { x: number; y: number } {
  const rect = convertToRectangle(canvas, viewport);

  const mouseX = event.offsetX - rect.x1;
  const mouseY = event.offsetY - rect.y1;
  const width = rect.x2 - rect.x1;
  const height = rect.y2 - rect.y1;

  const x = (mouseX / width) * 2 - 1;
  const y = -(mouseY / height) * 2 + 1;
  return { x, y };
}
