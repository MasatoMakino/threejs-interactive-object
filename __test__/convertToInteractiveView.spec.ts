import { Mesh } from "three";
import { describe, expect, it } from "vitest";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  convertToCheckboxMesh,
  convertToClickableMesh,
  convertToRadioButtonMesh,
  type IClickableObject3D,
  RadioButtonInteractionHandler,
} from "../src/index.js";

describe("convertToInteractiveView", () => {
  function expectInteractiveView<T>(
    interactiveView: T & IClickableObject3D<unknown>,
    originalView: T,
    // biome-ignore lint/suspicious/noExplicitAny: Constructor type is needed
    handlerClass: new (...args: any[]) => any,
  ) {
    expect(interactiveView).toBe(originalView);
    expect(interactiveView.interactionHandler).toBeDefined();
    expect(interactiveView.interactionHandler instanceof handlerClass).toBe(
      true,
    );
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
