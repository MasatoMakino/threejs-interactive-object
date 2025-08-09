/**
 * Comprehensive test suite for RadioButtonManager functionality.
 * Tests manager-specific features independent of UI implementation (Mesh/Sprite).
 */

import { BoxGeometry } from "three";
import { describe, expect, test, vi, beforeEach, afterAll } from "vitest";
import {
  RadioButtonManager,
  RadioButtonMesh,
  type ThreeMouseEvent,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

// Global spy for console.warn with proper cleanup
const _spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("RadioButtonManager", () => {
  let manager: RadioButtonManager<string>;

  beforeEach(() => {
    manager = new RadioButtonManager<string>();
    _spyWarn.mockClear();
  });

  afterAll(() => {
    _spyWarn.mockRestore();
  });

  /**
   * Helper function to create test radio buttons with specific values
   */
  const createTestButton = (value: string): RadioButtonMesh<string> => {
    const button = new RadioButtonMesh({
      geo: new BoxGeometry(1, 1, 1),
      material: getMeshMaterialSet(),
    });
    button.interactionHandler.value = value;
    return button;
  };

  describe("Initialization and Button Management", () => {
    test("should initialize with empty handler array and no selection", () => {
      expect(
        manager.interactionHandlers,
        "New manager should have empty handler array",
      ).toEqual([]);
      expect(
        manager.selected,
        "New manager should have no selected button",
      ).toBeUndefined();
    });

    test("should add single button to manager", () => {
      const button = createTestButton("option1");
      manager.addButton(button);

      expect(
        manager.interactionHandlers.length,
        "Manager should contain one handler after adding button",
      ).toBe(1);
      expect(
        manager.interactionHandlers[0],
        "First handler should match added button's handler",
      ).toBe(button.interactionHandler);
      expect(
        manager.interactionHandlers[0].value,
        "Handler value should match button value",
      ).toBe("option1");
    });

    test("should add multiple buttons to manager", () => {
      const button1 = createTestButton("option1");
      const button2 = createTestButton("option2");
      const button3 = createTestButton("option3");

      manager.addButton(button1, button2, button3);

      expect(
        manager.interactionHandlers.length,
        "Manager should contain three handlers",
      ).toBe(3);
      expect(
        manager.interactionHandlers[0].value,
        "First handler should have value 'option1'",
      ).toBe("option1");
      expect(
        manager.interactionHandlers[1].value,
        "Second handler should have value 'option2'",
      ).toBe("option2");
      expect(
        manager.interactionHandlers[2].value,
        "Third handler should have value 'option3'",
      ).toBe("option3");
    });

    test("should add interaction handler directly", () => {
      const button = createTestButton("direct");
      manager.addInteractionHandler(button.interactionHandler);

      expect(
        manager.interactionHandlers.length,
        "Manager should contain handler added directly",
      ).toBe(1);
      expect(
        manager.interactionHandlers[0].value,
        "Handler value should be preserved when added directly",
      ).toBe("direct");
    });
  });

  describe("Button Removal", () => {
    let button1: RadioButtonMesh<string>;
    let button2: RadioButtonMesh<string>;
    let button3: RadioButtonMesh<string>;

    beforeEach(() => {
      button1 = createTestButton("button1");
      button2 = createTestButton("button2");
      button3 = createTestButton("button3");
      manager.addButton(button1, button2, button3);
    });

    test("should remove button using removeButton method", () => {
      const initialLength = manager.interactionHandlers.length;
      manager.removeButton(button2);

      expect(
        manager.interactionHandlers.length,
        `Manager should have ${initialLength - 1} handlers after removal`,
      ).toBe(initialLength - 1);
      expect(
        manager.interactionHandlers.find((h) => h.value === "button2"),
        "Removed button should not be found in handlers",
      ).toBeUndefined();
    });

    test("should remove handler using removeInteractionHandler method", () => {
      const handlerToRemove = button2.interactionHandler;
      const initialLength = manager.interactionHandlers.length;

      const removedHandler = manager.removeInteractionHandler(handlerToRemove);

      expect(
        manager.interactionHandlers.length,
        `Manager should have ${initialLength - 1} handlers after removal`,
      ).toBe(initialLength - 1);
      expect(removedHandler, "Method should return the removed handler").toBe(
        handlerToRemove,
      );
      expect(
        manager.interactionHandlers.includes(handlerToRemove),
        "Removed handler should not be in manager array",
      ).toBe(false);
    });

    test("should handle removal of non-existent button gracefully", () => {
      const externalButton = createTestButton("external");
      const initialLength = manager.interactionHandlers.length;

      manager.removeButton(externalButton);

      expect(
        manager.interactionHandlers.length,
        "Manager length should be unchanged when removing non-existent button",
      ).toBe(initialLength);
    });

    test("should handle removal of non-existent handler gracefully", () => {
      const externalButton = createTestButton("external");
      const initialLength = manager.interactionHandlers.length;

      const result = manager.removeInteractionHandler(
        externalButton.interactionHandler,
      );

      expect(
        manager.interactionHandlers.length,
        "Manager length should be unchanged when removing non-existent handler",
      ).toBe(initialLength);
      expect(
        result,
        "Should return the handler even if not found in manager",
      ).toBe(externalButton.interactionHandler);
    });
  });

  describe("Exclusive Selection Behavior", () => {
    let button1: RadioButtonMesh<string>;
    let button2: RadioButtonMesh<string>;
    let button3: RadioButtonMesh<string>;

    beforeEach(() => {
      button1 = createTestButton("option1");
      button2 = createTestButton("option2");
      button3 = createTestButton("option3");
      manager.addButton(button1, button2, button3);
    });

    test("should select first button and set it as selected", () => {
      manager.select(button1.interactionHandler);

      expect(manager.selected, "Manager should have button1 selected").toBe(
        button1.interactionHandler,
      );
      expect(
        manager.selected?.value,
        "Selected button should have correct value",
      ).toBe("option1");
      expect(
        button1.interactionHandler.selection,
        "Selected button should have selection=true",
      ).toBe(true);
      expect(
        button1.interactionHandler.isFrozen,
        "Selected button should be frozen",
      ).toBe(true);
    });

    test("should maintain exclusive selection when switching buttons", () => {
      // Select first button
      manager.select(button1.interactionHandler);

      // Select second button - should deselect first
      manager.select(button2.interactionHandler);

      expect(manager.selected, "Manager should now have button2 selected").toBe(
        button2.interactionHandler,
      );
      expect(
        manager.selected?.value,
        "Selected value should be 'option2'",
      ).toBe("option2");

      // Check exclusive behavior
      expect(
        button1.interactionHandler.selection,
        "Previously selected button should be deselected",
      ).toBe(false);
      expect(
        button1.interactionHandler.isFrozen,
        "Previously selected button should not be frozen",
      ).toBe(false);
      expect(
        button2.interactionHandler.selection,
        "Currently selected button should be selected",
      ).toBe(true);
      expect(
        button2.interactionHandler.isFrozen,
        "Currently selected button should be frozen",
      ).toBe(true);
      expect(
        button3.interactionHandler.selection,
        "Unselected button should remain unselected",
      ).toBe(false);
      expect(
        button3.interactionHandler.isFrozen,
        "Unselected button should not be frozen",
      ).toBe(false);
    });

    test("should ignore re-selection of already selected and frozen button", () => {
      const spySelect = vi.fn();
      manager.on("select", spySelect);

      // Initial selection
      manager.select(button1.interactionHandler);
      expect(
        spySelect,
        "Select event should be emitted for initial selection",
      ).toHaveBeenCalledTimes(1);

      spySelect.mockClear();

      // Attempt re-selection
      manager.select(button1.interactionHandler);
      expect(
        spySelect,
        "Select event should not be emitted for re-selection of frozen button",
      ).not.toHaveBeenCalled();
      expect(
        button1.interactionHandler.isFrozen,
        "Button should remain frozen after re-selection attempt",
      ).toBe(true);
    });

    test("should warn when selecting unmanaged button", () => {
      const unmanagedButton = createTestButton("unmanaged");

      manager.select(unmanagedButton.interactionHandler);

      expect(
        _spyWarn,
        "Should warn when selecting button not in manager",
      ).toHaveBeenCalledWith("管理下でないボタンが選択処理されました。");
      expect(
        manager.selected,
        "Manager should have no selection after attempting to select unmanaged button",
      ).toBeUndefined();
    });
  });

  describe("Event Emission", () => {
    let button1: RadioButtonMesh<string>;
    let button2: RadioButtonMesh<string>;

    beforeEach(() => {
      button1 = createTestButton("event1");
      button2 = createTestButton("event2");
      manager.addButton(button1, button2);
    });

    test("should emit select event when button is selected", () => {
      const spySelect = vi.fn();
      manager.on("select", spySelect);

      manager.select(button1.interactionHandler);

      expect(spySelect, "Select event should be emitted").toHaveBeenCalledTimes(
        1,
      );

      const eventArg = spySelect.mock.calls[0][0] as ThreeMouseEvent<string>;
      expect(eventArg.type, "Event type should be 'select'").toBe("select");
      expect(
        eventArg.interactionHandler,
        "Event should contain the selected interaction handler",
      ).toBe(button1.interactionHandler);
      expect(
        eventArg.isSelected,
        "Event should indicate button is selected",
      ).toBe(true);
    });

    test("should emit select event when switching between buttons", () => {
      const spySelect = vi.fn();
      manager.on("select", spySelect);

      // Select first button
      manager.select(button1.interactionHandler);
      // Select second button
      manager.select(button2.interactionHandler);

      expect(
        spySelect,
        "Select event should be emitted twice for two selections",
      ).toHaveBeenCalledTimes(2);

      const secondEvent = spySelect.mock.calls[1][0] as ThreeMouseEvent<string>;
      expect(
        secondEvent.interactionHandler,
        "Second event should contain button2 handler",
      ).toBe(button2.interactionHandler);
      expect(
        secondEvent.interactionHandler?.value,
        "Second event handler should have correct value",
      ).toBe("event2");
    });

    test("should respond to select events from interaction handlers", () => {
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      // Simulate handler emitting select event (as would happen from mouse interaction)
      button1.interactionHandler.emit("select", {
        type: "select",
        interactionHandler: button1.interactionHandler,
        isSelected: true,
        pointerEvent: null,
      } as ThreeMouseEvent<string>);

      expect(
        spyManagerSelect,
        "Manager should respond to handler select event",
      ).toHaveBeenCalledTimes(1);
      expect(
        manager.selected,
        "Manager should have button selected after handler event",
      ).toBe(button1.interactionHandler);
      expect(
        button1.interactionHandler.isFrozen,
        "Button should be frozen after handler select event",
      ).toBe(true);
    });

    test("should ignore select events with isSelected=false from interaction handlers", () => {
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      // Simulate handler emitting select event with isSelected=false (deselection)
      button1.interactionHandler.emit("select", {
        type: "select",
        interactionHandler: button1.interactionHandler,
        isSelected: false,
        pointerEvent: null,
      } as ThreeMouseEvent<string>);

      expect(
        spyManagerSelect,
        "Manager should not respond to deselection events",
      ).not.toHaveBeenCalled();
      expect(
        manager.selected,
        "Manager should have no selection after deselection event",
      ).toBeUndefined();
    });
  });

  describe("Generic Value Type Handling", () => {
    test("should handle string values", () => {
      const stringManager = new RadioButtonManager<string>();
      const button = createTestButton("string-value");

      stringManager.addButton(button);
      stringManager.select(button.interactionHandler);

      expect(
        stringManager.selected?.value,
        "Should handle string value correctly",
      ).toBe("string-value");
    });

    test("should handle object values", () => {
      const objectManager = new RadioButtonManager<{
        id: number;
        label: string;
      }>();
      const button = new RadioButtonMesh<{ id: number; label: string }>({
        geo: new BoxGeometry(1, 1, 1),
        material: getMeshMaterialSet(),
      });
      const objectValue = { id: 1, label: "Test Object" };
      button.interactionHandler.value = objectValue;

      objectManager.addButton(button);
      objectManager.select(button.interactionHandler);

      expect(
        objectManager.selected?.value,
        "Should handle object value correctly",
      ).toEqual(objectValue);
      expect(
        objectManager.selected?.value?.id,
        "Object properties should be preserved",
      ).toBe(1);
      expect(
        objectManager.selected?.value?.label,
        "Object properties should be preserved",
      ).toBe("Test Object");
    });

    test("should handle undefined values", () => {
      const undefinedManager = new RadioButtonManager<string | undefined>();
      const button = new RadioButtonMesh<string | undefined>({
        geo: new BoxGeometry(1, 1, 1),
        material: getMeshMaterialSet(),
      });
      button.interactionHandler.value = undefined;

      undefinedManager.addButton(button);
      undefinedManager.select(button.interactionHandler);

      expect(
        undefinedManager.selected?.value,
        "Should handle undefined value correctly",
      ).toBeUndefined();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty manager operations", () => {
      expect(() => {
        // These operations should not throw on empty manager
        expect(
          manager.selected,
          "Empty manager should have no selection",
        ).toBeUndefined();
        expect(
          manager.interactionHandlers,
          "Empty manager should have empty handlers array",
        ).toEqual([]);
      }, "Empty manager operations should not throw").not.toThrow();
    });

    test("should handle multiple manager instances independently", () => {
      const manager1 = new RadioButtonManager<string>();
      const manager2 = new RadioButtonManager<string>();

      const button1 = createTestButton("manager1-option");
      const button2 = createTestButton("manager2-option");

      manager1.addButton(button1);
      manager2.addButton(button2);

      manager1.select(button1.interactionHandler);
      manager2.select(button2.interactionHandler);

      expect(
        manager1.selected?.value,
        "Manager1 should have independent selection",
      ).toBe("manager1-option");
      expect(
        manager2.selected?.value,
        "Manager2 should have independent selection",
      ).toBe("manager2-option");
      expect(
        manager1.interactionHandlers.length,
        "Manager1 should have only its own handlers",
      ).toBe(1);
      expect(
        manager2.interactionHandlers.length,
        "Manager2 should have only its own handlers",
      ).toBe(1);
    });

    test("should handle rapid successive selections", () => {
      const buttons = [
        createTestButton("rapid1"),
        createTestButton("rapid2"),
        createTestButton("rapid3"),
      ];
      manager.addButton(...buttons);

      const spySelect = vi.fn();
      manager.on("select", spySelect);

      // Rapid successive selections
      manager.select(buttons[0].interactionHandler);
      manager.select(buttons[1].interactionHandler);
      manager.select(buttons[2].interactionHandler);
      manager.select(buttons[0].interactionHandler);

      expect(
        spySelect,
        "Should emit select event for each distinct selection",
      ).toHaveBeenCalledTimes(4);
      expect(
        manager.selected,
        "Final selection should be the last button selected",
      ).toBe(buttons[0].interactionHandler);
      expect(
        buttons[0].interactionHandler.isFrozen,
        "Final selected button should be frozen",
      ).toBe(true);
      expect(
        buttons[1].interactionHandler.isFrozen,
        "Previous buttons should not be frozen",
      ).toBe(false);
      expect(
        buttons[2].interactionHandler.isFrozen,
        "Previous buttons should not be frozen",
      ).toBe(false);
    });
  });

  describe("Integration with RadioButtonInteractionHandler", () => {
    test("should properly set selection and frozen states on handlers", () => {
      const button1 = createTestButton("integration1");
      const button2 = createTestButton("integration2");
      manager.addButton(button1, button2);

      // Initial state
      expect(
        button1.interactionHandler.selection,
        "Handler should start unselected",
      ).toBe(false);
      expect(
        button1.interactionHandler.isFrozen,
        "Handler should start unfrozen",
      ).toBe(false);

      // After selection
      manager.select(button1.interactionHandler);
      expect(
        button1.interactionHandler.selection,
        "Selected handler should have selection=true",
      ).toBe(true);
      expect(
        button1.interactionHandler.isFrozen,
        "Selected handler should be frozen",
      ).toBe(true);
      expect(
        button2.interactionHandler.selection,
        "Unselected handler should have selection=false",
      ).toBe(false);
      expect(
        button2.interactionHandler.isFrozen,
        "Unselected handler should be unfrozen",
      ).toBe(false);

      // After switching selection
      manager.select(button2.interactionHandler);
      expect(
        button1.interactionHandler.selection,
        "Previously selected handler should be unselected",
      ).toBe(false);
      expect(
        button1.interactionHandler.isFrozen,
        "Previously selected handler should be unfrozen",
      ).toBe(false);
      expect(
        button2.interactionHandler.selection,
        "Newly selected handler should be selected",
      ).toBe(true);
      expect(
        button2.interactionHandler.isFrozen,
        "Newly selected handler should be frozen",
      ).toBe(true);
    });

    test("should maintain handler event listener registration", () => {
      const button = createTestButton("listener-test");
      manager.addButton(button);

      // Simulate handler emitting select event
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      button.interactionHandler.emit("select", {
        type: "select",
        interactionHandler: button.interactionHandler,
        isSelected: true,
        pointerEvent: null,
      } as ThreeMouseEvent<string>);

      expect(
        spyManagerSelect,
        "Manager should respond to handler events",
      ).toHaveBeenCalledTimes(1);
    });

    test("should remove event listeners when handler is removed", () => {
      const button = createTestButton("remove-listener-test");
      manager.addButton(button);

      // Remove the handler
      manager.removeInteractionHandler(button.interactionHandler);

      // Emit event from removed handler - manager should not respond
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      button.interactionHandler.emit("select", {
        type: "select",
        interactionHandler: button.interactionHandler,
        isSelected: true,
        pointerEvent: null,
      } as ThreeMouseEvent<string>);

      expect(
        spyManagerSelect,
        "Manager should not respond to events from removed handlers",
      ).not.toHaveBeenCalled();
    });
  });
});
