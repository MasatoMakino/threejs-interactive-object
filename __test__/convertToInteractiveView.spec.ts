import { describe, it, expect } from "vitest";
import {
  convertToClickableMesh,
  convertToCheckboxMesh,
  convertToRadioButtonMesh,
  RadioButtonInteractionHandler,
  CheckBoxInteractionHandler,
  ButtonInteractionHandler,
} from "../src/index.js";
import { Mesh } from "three";

describe("convertToInteractiveView", () => {
  function expectInteractiveView<T>(
    interactiveView: T,
    originalView: T,
    handlerClass: new (...args: any[]) => any,
  ) {
    expect(interactiveView).toBe(originalView);
    expect((interactiveView as any).interactionHandler).toBeDefined();
    expect(
      (interactiveView as any).interactionHandler instanceof handlerClass,
    ).toBe(true);
  }

  it("convertToClickableMesh", () => {
    const mesh = new Mesh();
    const clickableMesh = convertToClickableMesh(mesh);

    expectInteractiveView(clickableMesh, mesh, ButtonInteractionHandler);
  });

  it("convertToCheckboxMesh", () => {
    const mesh = new Mesh();
    const checkboxMesh = convertToCheckboxMesh(mesh);

    expectInteractiveView(checkboxMesh, mesh, CheckBoxInteractionHandler);
  });

  it("convertToRadioButtonMesh", () => {
    const mesh = new Mesh();
    const radioButtonMesh = convertToRadioButtonMesh(mesh);

    expectInteractiveView(radioButtonMesh, mesh, RadioButtonInteractionHandler);
  });
});
