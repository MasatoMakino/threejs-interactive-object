import { getMouseEvent } from "@masatomakino/fake-mouse-event";
import { Vector2, Vector4 } from "three";
import { ViewPortUtil } from "../src/ViewPortUtil";

describe("ViewPortUtil", () => {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  canvas.style.width = "640px";
  canvas.style.height = "480px";
  canvas.style.setProperty("margin", "0");
  canvas.style.setProperty("padding", "0");
  document.body.appendChild(canvas);

  const viewport = new Vector4(10, 6, 128, 64);

  test("rectangle", () => {
    const rect = ViewPortUtil.convertToRectangle(canvas, viewport);
    expect(rect).toStrictEqual({
      x1: 10,
      x2: 138,
      y1: 410,
      y2: 474,
    });
  });

  test("contain without viewport", () => {
    const e = getMouseEvent("mousemove", {
      offsetX: 16,
      offsetY: 420,
    });
    expect(ViewPortUtil.isContain(canvas, undefined, e)).toBe(true);
  });

  test("contain with viewport", () => {
    const e = getMouseEvent("mousemove", {
      offsetX: 16,
      offsetY: 420,
    });
    expect(ViewPortUtil.isContain(canvas, viewport, e)).toBe(true);
  });

  test("get mouse position without viewport", () => {
    testPoint(0, 0, -1, 1, canvas, undefined);
    testPoint(16, 420, -0.95, -0.75, canvas, undefined);
    testPoint(640, 480, 1, -1, canvas, undefined);
  });

  test("get mouse position with viewport", () => {
    testPoint(10, 410, -1, 1, canvas, viewport);
    testPoint(16, 420, -0.90625, 0.6875, canvas, viewport);
    testPoint(138, 474, 1, -1, canvas, viewport);
  });
});

function testPoint(
  offsetX: number,
  offsetY: number,
  resultX: number,
  resultY: number,
  canvas: HTMLCanvasElement,
  viewport?: Vector4
): void {
  const e = getMouseEvent("mousemove", {
    offsetX,
    offsetY,
  });
  const pos = ViewPortUtil.convertToMousePosition(
    canvas,
    e,
    viewport,
    undefined
  );
  expect(pos).toEqual(new Vector2(resultX, resultY));
}
