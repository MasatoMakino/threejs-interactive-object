import { BoxGeometry } from "three";
import { describe, expect, test, vi } from "vitest";
import {
  RadioButtonManager,
  RadioButtonMesh,
  type ThreeMouseEvent,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";
import { testRadioSelectionWithMouse } from "./RadioObject.js";

/**
 * Helper function to create test radio buttons with specific values.
 */
const initButton = (buttonValue: unknown): RadioButtonMesh => {
  const button = new RadioButtonMesh({
    geo: new BoxGeometry(3, 3, 3),
    material: getMeshMaterialSet(),
  });
  button.interactionHandler.value = buttonValue;
  return button;
};

describe("RadioButtonMesh", () => {
  test("should create radio button mesh with proper interaction handler", () => {
    const button = initButton("mesh-test");

    expect(button, "RadioButtonMesh instance should be created").toBeDefined();
    expect(
      button.interactionHandler,
      "Should have radio button interaction handler",
    ).toBeDefined();
    expect(
      button.interactionHandler.value,
      "Handler should preserve assigned value",
    ).toBe("mesh-test");
    expect(
      button.interactionHandler.isFrozen,
      "New radio button should not be frozen",
    ).toBe(false);
    expect(
      button.interactionHandler.selection,
      "New radio button should not be selected",
    ).toBe(false);
  });

  test("should emit select event and transition state when interacted", () => {
    const button = initButton("event-test");
    const handler = button.interactionHandler;

    // Set up event listener
    const spySelect = vi.fn();
    handler.on("select", spySelect);

    // Initial state
    expect(handler.selection, "Should start unselected").toBe(false);
    expect(handler.isFrozen, "Should start unfrozen").toBe(false);

    // Simulate pointer interaction (click)
    handler.onMouseClick();

    // Verify state transition
    expect(handler.selection, "Should be selected after click").toBe(true);
    expect(spySelect, "Select event should be emitted").toHaveBeenCalledTimes(
      1,
    );

    // Verify event payload
    const eventArg = spySelect.mock.calls[0][0] as ThreeMouseEvent<unknown>;
    expect(eventArg.type, "Event type should be 'select'").toBe("select");
    expect(
      eventArg.interactionHandler,
      "Event should contain the interaction handler",
    ).toBe(handler);
    expect(
      eventArg.isSelected,
      "Event should indicate button is selected",
    ).toBe(true);

    // Test deselection (toggle behavior)
    spySelect.mockClear();
    handler.onMouseClick();

    expect(handler.selection, "Should be deselected after second click").toBe(
      false,
    );
    expect(
      spySelect,
      "Select event should be emitted for deselection",
    ).toHaveBeenCalledTimes(1);

    const deselectionEvent = spySelect.mock
      .calls[0][0] as ThreeMouseEvent<unknown>;
    expect(
      deselectionEvent.isSelected,
      "Event should indicate button is deselected",
    ).toBe(false);
  });

  test("should integrate with RadioButtonManager for mouse interactions", () => {
    const button1 = initButton("mesh1");
    const button2 = initButton("mesh2");
    const button3 = initButton("mesh3");
    const testManager = new RadioButtonManager();

    testManager.addButton(button1, button2, button3);

    // Test mouse-driven selection integration
    testRadioSelectionWithMouse(testManager);
  });
});
