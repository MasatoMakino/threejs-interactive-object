/**
 * Comprehensive test suite for RadioButtonManager functionality.
 *
 * Test Environment: Vitest + WebDriverIO + Chrome (headless)
 * Test Approach: Logic-focused testing with programmatic interaction
 *
 * This suite tests manager-specific features independent of UI implementation (Mesh/Sprite).
 * Tests verify exclusive selection behavior, event emission, and handler management through
 * direct API calls and programmatic event simulation rather than DOM mouse interactions.
 *
 * For actual mouse interaction testing, see RadioMesh.spec.ts and RadioSprite.spec.ts
 * which use testRadioSelectionWithMouse() utility for browser automation.
 */

import { BoxGeometry } from "three";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import {
  RadioButtonManager,
  RadioButtonMesh,
  type ThreeMouseEvent,
} from "../src/index.js";
import { getMeshMaterialSet } from "./Materials.js";

// Suite-scoped spy for console.warn with proper setup/teardown
let _spyWarn: ReturnType<typeof vi.spyOn>;

describe("RadioButtonManager", () => {
  let manager: RadioButtonManager<string>;

  beforeAll(() => {
    _spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

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
    const button = new RadioButtonMesh<string>({
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

      const handlers = manager.interactionHandlers;
      expect(
        handlers.length,
        "Manager should contain one handler after adding button",
      ).toBe(1);
      expect(
        handlers[0],
        "First handler should match added button's handler",
      ).toBe(button.interactionHandler);
      expect(handlers[0].value, "Handler value should match button value").toBe(
        "option1",
      );
    });

    test("should add multiple buttons to manager", () => {
      const button1 = createTestButton("option1");
      const button2 = createTestButton("option2");
      const button3 = createTestButton("option3");

      manager.addButton(button1, button2, button3);

      const handlers = manager.interactionHandlers;
      expect(handlers.length, "Manager should contain three handlers").toBe(3);
      expect(
        handlers[0].value,
        "First handler should have value 'option1'",
      ).toBe("option1");
      expect(
        handlers[1].value,
        "Second handler should have value 'option2'",
      ).toBe("option2");
      expect(
        handlers[2].value,
        "Third handler should have value 'option3'",
      ).toBe("option3");
    });

    test("should add interaction handler directly", () => {
      const button = createTestButton("direct");
      manager.addInteractionHandler(button.interactionHandler);

      const handlers = manager.interactionHandlers;
      expect(
        handlers.length,
        "Manager should contain handler added directly",
      ).toBe(1);
      expect(
        handlers[0].value,
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
      const handler1 = button1.interactionHandler;
      manager.select(handler1);

      expect(manager.selected, "Manager should have button1 selected").toBe(
        handler1,
      );
      expect(
        manager.selected?.value,
        "Selected button should have correct value",
      ).toBe("option1");
      expect(
        handler1.selection,
        "Selected button should have selection=true",
      ).toBe(true);
      expect(handler1.isFrozen, "Selected button should be frozen").toBe(true);
    });

    test("should maintain exclusive selection when switching buttons", () => {
      const handler1 = button1.interactionHandler;
      const handler2 = button2.interactionHandler;
      const handler3 = button3.interactionHandler;

      // Select first button
      manager.select(handler1);

      // Select second button - should deselect first
      manager.select(handler2);

      expect(manager.selected, "Manager should now have button2 selected").toBe(
        handler2,
      );
      expect(
        manager.selected?.value,
        "Selected value should be 'option2'",
      ).toBe("option2");

      // Check exclusive behavior
      expect(
        handler1.selection,
        "Previously selected button should be deselected",
      ).toBe(false);
      expect(
        handler1.isFrozen,
        "Previously selected button should not be frozen",
      ).toBe(false);
      expect(
        handler2.selection,
        "Currently selected button should be selected",
      ).toBe(true);
      expect(
        handler2.isFrozen,
        "Currently selected button should be frozen",
      ).toBe(true);
      expect(
        handler3.selection,
        "Unselected button should remain unselected",
      ).toBe(false);
      expect(handler3.isFrozen, "Unselected button should not be frozen").toBe(
        false,
      );
    });

    test("should ignore re-selection of already selected and frozen button", () => {
      const handler1 = button1.interactionHandler;
      const spySelect = vi.fn();
      manager.on("select", spySelect);

      // Initial selection
      manager.select(handler1);
      expect(
        spySelect,
        "Select event should be emitted for initial selection",
      ).toHaveBeenCalledTimes(1);

      spySelect.mockClear();

      // Attempt re-selection
      manager.select(handler1);
      expect(
        spySelect,
        "Select event should not be emitted for re-selection of frozen button",
      ).not.toHaveBeenCalled();
      expect(
        handler1.isFrozen,
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
      const handler1 = button1.interactionHandler;
      const spySelect = vi.fn();
      manager.on("select", spySelect);

      manager.select(handler1);

      expect(spySelect, "Select event should be emitted").toHaveBeenCalledTimes(
        1,
      );

      const eventArg = spySelect.mock.calls[0][0] as ThreeMouseEvent<string>;
      expect(eventArg.type, "Event type should be 'select'").toBe("select");
      expect(
        eventArg.interactionHandler,
        "Event should contain the selected interaction handler",
      ).toBe(handler1);
      expect(
        eventArg.isSelected,
        "Event should indicate button is selected",
      ).toBe(true);
    });

    test("should emit select event when switching between buttons", () => {
      const handler1 = button1.interactionHandler;
      const handler2 = button2.interactionHandler;
      const spySelect = vi.fn();
      manager.on("select", spySelect);

      // Select first button
      manager.select(handler1);
      // Select second button
      manager.select(handler2);

      expect(
        spySelect,
        "Select event should be emitted twice for two selections",
      ).toHaveBeenCalledTimes(2);

      const secondEvent = spySelect.mock.calls[1][0] as ThreeMouseEvent<string>;
      expect(
        secondEvent.interactionHandler,
        "Second event should contain button2 handler",
      ).toBe(handler2);
      expect(
        secondEvent.interactionHandler?.value,
        "Second event handler should have correct value",
      ).toBe("event2");
    });

    test("should respond to select events from interaction handlers", () => {
      const handler1 = button1.interactionHandler;
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      // Simulate handler emitting select event (as would happen from mouse interaction)
      handler1.emit("select", {
        type: "select",
        interactionHandler: handler1,
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
      ).toBe(handler1);
      expect(
        handler1.isFrozen,
        "Button should be frozen after handler select event",
      ).toBe(true);
    });

    test("should ignore select events with isSelected=false from interaction handlers", () => {
      const handler1 = button1.interactionHandler;
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      // Simulate handler emitting select event with isSelected=false (deselection)
      handler1.emit("select", {
        type: "select",
        interactionHandler: handler1,
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
      // These reads should not throw and should reflect initial state
      expect(
        manager.selected,
        "Empty manager should have no selection",
      ).toBeUndefined();
      expect(
        manager.interactionHandlers,
        "Empty manager should have empty handlers array",
      ).toEqual([]);
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
      const handler1 = button1.interactionHandler;
      const handler2 = button2.interactionHandler;
      manager.addButton(button1, button2);

      // Initial state
      expect(handler1.selection, "Handler should start unselected").toBe(false);
      expect(handler1.isFrozen, "Handler should start unfrozen").toBe(false);

      // After selection
      manager.select(handler1);
      expect(
        handler1.selection,
        "Selected handler should have selection=true",
      ).toBe(true);
      expect(handler1.isFrozen, "Selected handler should be frozen").toBe(true);
      expect(
        handler2.selection,
        "Unselected handler should have selection=false",
      ).toBe(false);
      expect(handler2.isFrozen, "Unselected handler should be unfrozen").toBe(
        false,
      );

      // After switching selection
      manager.select(handler2);
      expect(
        handler1.selection,
        "Previously selected handler should be unselected",
      ).toBe(false);
      expect(
        handler1.isFrozen,
        "Previously selected handler should be unfrozen",
      ).toBe(false);
      expect(
        handler2.selection,
        "Newly selected handler should be selected",
      ).toBe(true);
      expect(handler2.isFrozen, "Newly selected handler should be frozen").toBe(
        true,
      );
    });

    test("should maintain handler event listener registration", () => {
      const button = createTestButton("listener-test");
      const handler = button.interactionHandler;
      manager.addButton(button);

      // Simulate handler emitting select event
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      handler.emit("select", {
        type: "select",
        interactionHandler: handler,
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
      const handler = button.interactionHandler;
      manager.addButton(button);

      // Remove the handler
      manager.removeInteractionHandler(handler);

      // Emit event from removed handler - manager should not respond
      const spyManagerSelect = vi.fn();
      manager.on("select", spyManagerSelect);

      handler.emit("select", {
        type: "select",
        interactionHandler: handler,
        isSelected: true,
        pointerEvent: null,
      } as ThreeMouseEvent<string>);

      expect(
        spyManagerSelect,
        "Manager should not respond to events from removed handlers",
      ).not.toHaveBeenCalled();
    });
  });

  describe("Material State Integration", () => {
    test("should apply normalSelect material when selecting button in normal state", () => {
      const button = createTestButton("material-normal");
      manager.addButton(button);
      const handler = button.interactionHandler;

      // Select button in normal state
      manager.select(handler);

      expect(handler.selection, "Handler should be selected").toBe(true);
      expect(handler.isFrozen, "Handler should be frozen").toBe(true);
      expect(
        button.material,
        "Should apply normalSelect material when selecting in normal state",
      ).toBe(button.interactionHandler.materialSet?.normalSelect.material);
    });

    test("should force normalSelect material even when button was in hover state", () => {
      const button = createTestButton("material-hover");
      manager.addButton(button);
      const handler = button.interactionHandler;
      const matSet = handler.materialSet;

      // Simulate hover state before selection
      handler.onMouseOverHandler({
        type: "over",
        interactionHandler: handler,
        pointerEvent: null,
      } as ThreeMouseEvent<string>);

      expect(handler.isOver, "Handler should be in hover state").toBe(true);
      expect(
        button.material,
        "Should have over material before selection",
      ).toBe(matSet?.over.material);

      // Select button while in hover state
      manager.select(handler);

      expect(handler.selection, "Handler should be selected").toBe(true);
      expect(handler.isFrozen, "Handler should be frozen").toBe(true);
      expect(handler.isOver, "Hover state should be preserved internally").toBe(
        true,
      );
      expect(
        button.material,
        "Should force normalSelect material despite hover state",
      ).toBe(matSet?.normalSelect.material);
    });

    test("should maintain normalSelect material for selected frozen button", () => {
      const button1 = createTestButton("maintain-1");
      const button2 = createTestButton("maintain-2");
      manager.addButton(button1, button2);

      const handler1 = button1.interactionHandler;
      const handler2 = button2.interactionHandler;
      const matSet1 = handler1.materialSet;

      // Select first button
      manager.select(handler1);
      expect(
        button1.material,
        "Should have normalSelect after initial selection",
      ).toBe(matSet1?.normalSelect.material);

      // Simulate hover on selected frozen button
      handler1.onMouseOverHandler({
        type: "over",
        interactionHandler: handler1,
        pointerEvent: null,
      } as ThreeMouseEvent<string>);

      expect(
        button1.material,
        "Selected frozen button should maintain normalSelect despite hover",
      ).toBe(matSet1?.normalSelect.material);

      // Switch to second button
      manager.select(handler2);

      expect(handler1.selection, "First handler should be deselected").toBe(
        false,
      );
      expect(handler1.isFrozen, "First handler should be unfrozen").toBe(false);
      expect(
        button2.material,
        "Second button should have normalSelect material",
      ).toBe(handler2.materialSet?.normalSelect.material);
    });
  });

  describe("Array Reference Security", () => {
    test("should prevent external mutation of interactionHandlers array", () => {
      const button1 = createTestButton("option1");
      const button2 = createTestButton("option2");
      manager.addButton(button1, button2);

      // Get the array reference
      const handlersArray = manager.interactionHandlers;
      const originalLength = handlersArray.length;

      // Attempt destructive operations on the returned array
      handlersArray.push(createTestButton("malicious").interactionHandler);
      handlersArray.pop();
      handlersArray.splice(0, 1);

      // Verify internal state is unchanged
      expect(
        manager.interactionHandlers.length,
        "Internal array should not be affected by external mutations",
      ).toBe(originalLength);
      expect(
        manager.interactionHandlers.find((h) => h.value === "option1"),
        "Original buttons should still be present",
      ).toBeDefined();
      expect(
        manager.interactionHandlers.find((h) => h.value === "option2"),
        "Original buttons should still be present",
      ).toBeDefined();
      expect(
        manager.interactionHandlers.find((h) => h.value === "malicious"),
        "External additions should not affect internal state",
      ).toBeUndefined();
    });

    test("should return different array instances on multiple calls", () => {
      const button = createTestButton("test");
      manager.addButton(button);

      const array1 = manager.interactionHandlers;
      const array2 = manager.interactionHandlers;

      expect(
        array1 === array2,
        "Different calls should return different array instances",
      ).toBe(false);
      expect(array1, "Arrays should have same content").toEqual(array2);
    });
  });
});
