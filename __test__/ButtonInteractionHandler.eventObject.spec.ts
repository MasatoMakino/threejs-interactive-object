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

  it("should emit click event with proper type and handler reference after down-up sequence", () => {
    const { handler } = createTestSetup();
    const clickSpy = vi.fn();
    handler.on("click", clickSpy);

    handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
    handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

    expect(
      clickSpy,
      "Click event should be emitted exactly once after down-up sequence",
    ).toHaveBeenCalledTimes(1);

    const receivedEvent = clickSpy.mock.calls[0][0] as ThreeMouseEvent<string>;
    expect(receivedEvent).toEqual(
      expect.objectContaining({
        type: "click",
        interactionHandler: handler,
      }),
    );
    expect(
      receivedEvent.type,
      "Event type should be 'click' for complete interaction",
    ).toBe("click");
    expect(
      receivedEvent.interactionHandler,
      "Event should contain reference to the originating handler",
    ).toBe(handler);
  });

  it("should emit distinct event objects for up and click events in proper sequence", () => {
    const { handler } = createTestSetup();
    const upSpy = vi.fn();
    const clickSpy = vi.fn();

    handler.on("up", upSpy);
    handler.on("click", clickSpy);

    handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
    handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

    expect(
      upSpy,
      "Up event should be emitted when pointer is released",
    ).toHaveBeenCalledTimes(1);
    expect(
      clickSpy,
      "Click event should be emitted after complete down-up interaction",
    ).toHaveBeenCalledTimes(1);

    const upEvent = upSpy.mock.calls[0][0] as ThreeMouseEvent<string>;
    const clickEvent = clickSpy.mock.calls[0][0] as ThreeMouseEvent<string>;

    // Ensure 'up' event is emitted before 'click'
    // Note: verify your Vitest version supports `mock.invocationCallOrder`.
    expect(upSpy.mock.invocationCallOrder[0]).toBeLessThan(
      clickSpy.mock.invocationCallOrder[0],
    );

    expect(
      upEvent,
      "Up and click events should be distinct object instances",
    ).not.toBe(clickEvent);
    expect(upEvent.type, "Up event should have correct type identifier").toBe(
      "up",
    );
    expect(
      clickEvent.type,
      "Click event should have correct type identifier",
    ).toBe("click");
  });

  it("should preserve handler reference and value data in click event object", () => {
    const { handler } = createTestSetup();
    const clickSpy = vi.fn();
    handler.on("click", clickSpy);

    handler.onMouseDownHandler(ThreeMouseEventUtil.generate("down", handler));
    handler.onMouseUpHandler(ThreeMouseEventUtil.generate("up", handler));

    const clickEvent = clickSpy.mock.calls[0][0] as ThreeMouseEvent<string>;
    expect(
      clickEvent.interactionHandler,
      "Event should maintain reference to the original handler instance",
    ).toBe(handler);
    expect(
      clickEvent.interactionHandler?.value,
      "Event should preserve the handler's value data for identification",
    ).toBe("test button");
  });
});
