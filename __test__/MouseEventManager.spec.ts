import { getMouseEvent } from "fake-mouse-event";
import { MouseEventManager } from "../src";
import { generateScene } from "./MouseEventManagerGenerator";

describe("MouseEventManager", () => {
  const { scene, canvas, renderer } = generateScene();

  test("Init", () => {
    expect(MouseEventManager.isInit).toBe(true);
    resetMouseEventManager(canvas);
  });
});

const resetMouseEventManager = (canvas: HTMLCanvasElement) => {
  const e = getMouseEvent("mouseup");
  canvas.dispatchEvent(e);
};
