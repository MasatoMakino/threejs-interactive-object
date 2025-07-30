import { BoxGeometry } from "three";
import { describe, expect, it, vi } from "vitest";
import {
  ClickableMesh,
  type ThreeMouseEvent,
  ThreeMouseEventUtil,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

describe("ButtonInteractionHandler Event Object Validation", () => {
  const createTestSetup = () => {
    const matSet = getMeshMaterialSet();
    const clickable = new ClickableMesh({
      geo: new BoxGeometry(3, 3, 3),
      material: matSet,
    });
    clickable.interactionHandler.value = "test button";
    const handler = clickable.interactionHandler;

    return { clickable, handler };
  };

  it("should emit correct click event object with proper type and handler reference", () => {
    const { handler } = createTestSetup();
    const clickSpy = vi.fn();
    handler.on("click", clickSpy);

    handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
    handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

    expect(clickSpy).toHaveBeenCalledTimes(1);

    const receivedEvent = clickSpy.mock.calls[0][0] as ThreeMouseEvent<string>;
    expect(receivedEvent.type).toBe("click");
    expect(receivedEvent.interactionHandler).toBe(handler);
  });

  it("should emit distinct event objects for up and click events", () => {
    const { handler } = createTestSetup();
    const upSpy = vi.fn();
    const clickSpy = vi.fn();

    handler.on("up", upSpy);
    handler.on("click", clickSpy);

    handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
    handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

    expect(upSpy).toHaveBeenCalledTimes(1);
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const upEvent = upSpy.mock.calls[0][0] as ThreeMouseEvent<string>;
    const clickEvent = clickSpy.mock.calls[0][0] as ThreeMouseEvent<string>;

    expect(upEvent).not.toBe(clickEvent);
    expect(upEvent.type).toBe("up");
    expect(clickEvent.type).toBe("click");
  });

  it("should correctly set interactionHandler property and value in click event", () => {
    const { handler } = createTestSetup();
    const clickSpy = vi.fn();
    handler.on("click", clickSpy);

    handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
    handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

    const clickEvent = clickSpy.mock.calls[0][0] as ThreeMouseEvent<string>;
    expect(clickEvent.interactionHandler).toBe(handler);
    expect(clickEvent.interactionHandler?.value).toBe("test button");
  });
});
