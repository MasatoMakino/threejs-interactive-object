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
  it("convertToClickableMesh", () => {
    const mesh = new Mesh();
    const clickableMesh = convertToClickableMesh(mesh);
    expect(clickableMesh).toBe(mesh);
    expect(clickableMesh.interactionHandler).toBeDefined();
    expect(
      clickableMesh.interactionHandler instanceof ButtonInteractionHandler,
    ).toBe(true);
  });

  it("convertToCheckboxMesh", () => {
    const mesh = new Mesh();
    const checkboxMesh = convertToCheckboxMesh(mesh);
    expect(checkboxMesh).toBe(mesh);
    expect(checkboxMesh.interactionHandler).toBeDefined();
    expect(
      checkboxMesh.interactionHandler instanceof CheckBoxInteractionHandler,
    ).toBe(true);
  });

  it("convertToRadioButtonMesh", () => {
    const mesh = new Mesh();
    const radioButtonMesh = convertToRadioButtonMesh(mesh);
    expect(radioButtonMesh).toBe(mesh);
    expect(radioButtonMesh.interactionHandler).toBeDefined();
    expect(
      radioButtonMesh.interactionHandler instanceof
        RadioButtonInteractionHandler,
    ).toBe(true);
  });
});
