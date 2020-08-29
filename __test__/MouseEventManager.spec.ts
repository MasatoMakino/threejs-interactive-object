import { MouseEventManager } from "../src";
import { generateScene } from "./MouseEventManagerGenerator";

describe("MouseEventManager", () => {
  const { scene, canvas, renderer } = generateScene();

  test("Init", () => {
    expect(MouseEventManager.isInit).toBe(true);
  });
});
