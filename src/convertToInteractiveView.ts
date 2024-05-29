import { Mesh } from "three";
import {
  CheckBoxMesh,
  ClickableMesh,
  RadioButtonMesh,
} from "./InteractiveMesh";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  RadioButtonInteractionHandler,
} from "./index.js";

export function convertToClickableMesh<V = any>(view: Mesh): ClickableMesh<V> {
  const anyView = view as any;
  anyView["interactionHandler"] = new ButtonInteractionHandler<V>({
    view: anyView,
  });
  return view as ClickableMesh<V>;
}

export function convertToCheckboxMesh<V = any>(view: Mesh): CheckBoxMesh<V> {
  const anyView = view as any;
  anyView["interactionHandler"] = new CheckBoxInteractionHandler<V>({
    view: anyView,
  });
  return view as CheckBoxMesh<V>;
}

export function convertToRadioButtonMesh<V = any>(
  view: Mesh,
): RadioButtonMesh<V> {
  const anyView = view as any;
  anyView["interactionHandler"] = new RadioButtonInteractionHandler<V>({
    view: anyView,
  });
  return view as RadioButtonMesh<V>;
}
