import { BoxGeometry, Mesh, MeshBasicMaterial } from "three";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  convertToCheckboxMesh,
  convertToClickableMesh,
  convertToRadioButtonMesh,
  type IClickableObject3D,
  RadioButtonInteractionHandler,
} from "../src/index.js";

// Suppress console.warn output during tests while still allowing spy verification
const _globalWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

describe("convertToInteractiveView", () => {
  beforeEach(() => {
    _globalWarnSpy.mockClear();
  });

  function expectInteractiveView<T>(
    interactiveView: T & IClickableObject3D<unknown>,
    originalView: T,
    // biome-ignore lint/suspicious/noExplicitAny: Constructor type is needed
    handlerClass: new (...args: any[]) => any,
  ) {
    expect(
      interactiveView,
      "Converted object should be same reference as original",
    ).toBe(originalView);
    expect(
      interactiveView.interactionHandler,
      "InteractionHandler should be defined after conversion",
    ).toBeDefined();
    expect(
      interactiveView.interactionHandler instanceof handlerClass,
      `InteractionHandler should be instance of ${handlerClass.name}`,
    ).toBe(true);
  }

  it("should convert existing Mesh to ClickableMesh with ButtonInteractionHandler", () => {
    const mesh = new Mesh();
    const clickableMesh = convertToClickableMesh(mesh);

    expectInteractiveView(clickableMesh, mesh, ButtonInteractionHandler);
  });

  it("should convert existing Mesh to CheckBoxMesh with CheckBoxInteractionHandler", () => {
    const mesh = new Mesh();
    const checkboxMesh = convertToCheckboxMesh(mesh);

    expectInteractiveView(checkboxMesh, mesh, CheckBoxInteractionHandler);
  });

  it("should convert existing Mesh to RadioButtonMesh with RadioButtonInteractionHandler", () => {
    const mesh = new Mesh();
    const radioButtonMesh = convertToRadioButtonMesh(mesh);

    expectInteractiveView(radioButtonMesh, mesh, RadioButtonInteractionHandler);
  });

  describe("Property preservation", () => {
    it("should preserve all mesh properties across all conversion types", () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0x00ff00 });
      const baseMesh = new Mesh(geometry, material);
      baseMesh.position.set(10, 20, 30);
      baseMesh.name = "testMesh";
      baseMesh.userData = { customData: "test", id: 123 };

      const clickable = convertToClickableMesh(baseMesh.clone());
      const checkbox = convertToCheckboxMesh(baseMesh.clone());
      const radio = convertToRadioButtonMesh(baseMesh.clone());

      const testCases = [
        { converted: clickable, type: "ClickableMesh" },
        { converted: checkbox, type: "CheckBoxMesh" },
        { converted: radio, type: "RadioButtonMesh" },
      ];

      for (const { converted, type } of testCases) {
        expect(
          converted.geometry,
          `Geometry should be preserved in ${type}`,
        ).toBe(geometry);
        expect(
          converted.material,
          `Material should be preserved in ${type}`,
        ).toBe(material);
        expect(
          converted.position.x,
          `Position X should be preserved in ${type}`,
        ).toBe(10);
        expect(
          converted.position.y,
          `Position Y should be preserved in ${type}`,
        ).toBe(20);
        expect(
          converted.position.z,
          `Position Z should be preserved in ${type}`,
        ).toBe(30);
        expect(converted.name, `Name should be preserved in ${type}`).toBe(
          "testMesh",
        );
        expect(
          converted.userData.customData,
          `UserData should be preserved in ${type}`,
        ).toBe("test");
      }
    });
  });

  describe("Type safety and generics", () => {
    it("should support generic value types for ClickableMesh handlers", () => {
      interface CustomValue {
        id: number;
        name: string;
      }
      const mesh = new Mesh();
      const converted = convertToClickableMesh<CustomValue>(mesh);

      const testValue: CustomValue = { id: 1, name: "test" };
      converted.interactionHandler.value = testValue;

      expect(
        converted.interactionHandler.value,
        "Generic value type should be preserved for ClickableMesh",
      ).toEqual(testValue);
      expect(
        converted.interactionHandler.value?.id,
        "Custom value id should be accessible",
      ).toBe(1);
      expect(
        converted.interactionHandler.value?.name,
        "Custom value name should be accessible",
      ).toBe("test");
    });

    it("should support generic value types for CheckBoxMesh handlers", () => {
      type OptionValue = "option1" | "option2" | "option3";
      const mesh = new Mesh();
      const converted = convertToCheckboxMesh<OptionValue>(mesh);

      const testValue: OptionValue = "option2";
      converted.interactionHandler.value = testValue;

      expect(
        converted.interactionHandler.value,
        "Generic value type should be preserved for CheckBoxMesh",
      ).toBe(testValue);
      expect(
        converted.interactionHandler.selection,
        "Initial selection state should be false",
      ).toBe(false);
    });

    it("should support generic value types for RadioButtonMesh handlers", () => {
      enum ButtonType {
        PRIMARY,
        SECONDARY,
        TERTIARY,
      }
      const mesh = new Mesh();
      const converted = convertToRadioButtonMesh<ButtonType>(mesh);

      const testValue: ButtonType = ButtonType.PRIMARY;
      converted.interactionHandler.value = testValue;

      expect(
        converted.interactionHandler.value,
        "Generic enum value type should be preserved for RadioButtonMesh",
      ).toBe(testValue);
      expect(
        converted.interactionHandler.selection,
        "Initial selection state should be false",
      ).toBe(false);
    });

    it("should handle undefined generic types correctly", () => {
      const mesh = new Mesh();
      const clickable = convertToClickableMesh(mesh); // No generic type specified
      const checkbox = convertToCheckboxMesh(mesh);
      const radio = convertToRadioButtonMesh(mesh);

      expect(
        clickable.interactionHandler.value,
        "Default value should be undefined for ClickableMesh",
      ).toBeUndefined();
      expect(
        checkbox.interactionHandler.value,
        "Default value should be undefined for CheckBoxMesh",
      ).toBeUndefined();
      expect(
        radio.interactionHandler.value,
        "Default value should be undefined for RadioButtonMesh",
      ).toBeUndefined();
    });
  });

  describe("Handler initialization state", () => {
    it("should initialize all handler types with correct default state", () => {
      const mesh1 = new Mesh();
      const mesh2 = new Mesh();
      const mesh3 = new Mesh();

      const clickable = convertToClickableMesh(mesh1);
      const checkbox = convertToCheckboxMesh(mesh2);
      const radio = convertToRadioButtonMesh(mesh3);

      // Test view references
      expect(
        clickable.interactionHandler.view,
        "ClickableMesh handler should reference converted mesh",
      ).toBe(clickable);
      expect(
        checkbox.interactionHandler.view,
        "CheckBoxMesh handler should reference converted mesh",
      ).toBe(checkbox);
      expect(
        radio.interactionHandler.view,
        "RadioButtonMesh handler should reference converted mesh",
      ).toBe(radio);

      // Test initial states
      expect(
        clickable.interactionHandler.state,
        "ClickableMesh handler should have normal initial state",
      ).toBe("normal");
      expect(
        checkbox.interactionHandler.state,
        "CheckBoxMesh handler should have normal initial state",
      ).toBe("normal");
      expect(
        radio.interactionHandler.state,
        "RadioButtonMesh handler should have normal initial state",
      ).toBe("normal");

      // Test selection states (for selection-capable handlers)
      expect(
        checkbox.interactionHandler.selection,
        "CheckBoxMesh initial selection should be false",
      ).toBe(false);
      expect(
        radio.interactionHandler.selection,
        "RadioButtonMesh initial selection should be false",
      ).toBe(false);
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle meshes without geometry or material", () => {
      const emptyMesh = new Mesh(); // No geometry or material

      expect(
        () => convertToClickableMesh(emptyMesh),
        "Should handle mesh without geometry/material gracefully",
      ).not.toThrow();
      expect(
        () => convertToCheckboxMesh(emptyMesh),
        "Should handle mesh without geometry/material gracefully",
      ).not.toThrow();
      expect(
        () => convertToRadioButtonMesh(emptyMesh),
        "Should handle mesh without geometry/material gracefully",
      ).not.toThrow();
    });

    it("should warn when attempting to convert already interactive objects and return unchanged", () => {
      const mesh = new Mesh();
      const firstConversion = convertToClickableMesh(mesh);
      const originalHandler = firstConversion.interactionHandler;

      // Try to convert again - should warn and return unchanged
      const secondConversion = convertToCheckboxMesh(firstConversion);

      expect(
        _globalWarnSpy,
        "Should show warning when converting already interactive object",
      ).toHaveBeenCalledWith(
        expect.stringContaining(
          "WARNING: Cannot convert object that already has an interactionHandler",
        ),
      );

      expect(
        secondConversion.interactionHandler,
        "Should return original handler unchanged after warning",
      ).toBe(originalHandler);

      expect(
        secondConversion.interactionHandler instanceof ButtonInteractionHandler,
        "Handler should remain as original ButtonInteractionHandler, not CheckBoxInteractionHandler",
      ).toBe(true);
    });

    it("should warn consistently across all converter functions when attempting re-conversion", () => {
      const mesh1 = new Mesh();
      const mesh2 = new Mesh();
      const mesh3 = new Mesh();

      // Create initial conversions
      const clickableMesh = convertToClickableMesh(mesh1);
      const checkboxMesh = convertToCheckboxMesh(mesh2);
      const radioMesh = convertToRadioButtonMesh(mesh3);

      // Test all converter functions with already-interactive objects
      const testCases = [
        {
          converter: convertToClickableMesh,
          input: checkboxMesh,
          type: "convertToClickableMesh",
        },
        {
          converter: convertToCheckboxMesh,
          input: radioMesh,
          type: "convertToCheckboxMesh",
        },
        {
          converter: convertToRadioButtonMesh,
          input: clickableMesh,
          type: "convertToRadioButtonMesh",
        },
      ];

      for (const { converter, input, type } of testCases) {
        const originalHandler = input.interactionHandler;

        const result = converter(input);

        expect(
          _globalWarnSpy,
          `${type} should show warning when converting already interactive object`,
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            "WARNING: Cannot convert object that already has an interactionHandler",
          ),
        );

        expect(
          result.interactionHandler,
          `${type} should return original handler unchanged after warning`,
        ).toBe(originalHandler);
      }
    });

    it("should maintain conversion functionality across different mesh configurations", () => {
      const geometry = new BoxGeometry(1, 1, 1);
      const material = new MeshBasicMaterial({ color: 0x00ff00 });

      // Test with various mesh configurations
      const meshConfigs = [
        new Mesh(), // Empty mesh
        new Mesh(geometry), // Geometry only
        new Mesh(undefined, material), // Material only
        new Mesh(geometry, material), // Full mesh
      ];

      for (const [index, mesh] of meshConfigs.entries()) {
        const converted = convertToClickableMesh(mesh);
        expect(
          converted.interactionHandler,
          `Mesh config ${index} should have handler after conversion`,
        ).toBeDefined();
        expect(
          converted,
          `Mesh config ${index} should maintain reference equality`,
        ).toBe(mesh);
      }
    });
  });
});
