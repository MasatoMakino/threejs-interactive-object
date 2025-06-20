/**
 * すでに存在するMeshをClickableMeshに変換するユーティリティ関数。
 * gltfなどで読み込んだMeshをClickableMeshに変換する際に使用する。
 */

import type { Mesh } from "three";
import {
  ButtonInteractionHandler,
  CheckBoxInteractionHandler,
  RadioButtonInteractionHandler,
} from "./index.js";
import type {
  CheckBoxMesh,
  ClickableMesh,
  RadioButtonMesh,
} from "./view/index.js";

export function convertToClickableMesh<V = unknown>(
  view: Mesh,
): ClickableMesh<V> {
  // biome-ignore lint/suspicious/noExplicitAny: cast Mesh to ClickableMesh
  const anyView = view as any;
  anyView.interactionHandler = new ButtonInteractionHandler<V>({
    view: anyView,
  });
  return view as ClickableMesh<V>;
}

export function convertToCheckboxMesh<V = unknown>(
  view: Mesh,
): CheckBoxMesh<V> {
  // biome-ignore lint/suspicious/noExplicitAny: cast Mesh to CheckBoxMesh
  const anyView = view as any;
  anyView.interactionHandler = new CheckBoxInteractionHandler<V>({
    view: anyView,
  });
  return view as CheckBoxMesh<V>;
}

export function convertToRadioButtonMesh<V = unknown>(
  view: Mesh,
): RadioButtonMesh<V> {
  // biome-ignore lint/suspicious/noExplicitAny: cast Mesh to RadioButtonMesh
  const anyView = view as any;
  anyView.interactionHandler = new RadioButtonInteractionHandler<V>({
    view: anyView,
  });
  return view as RadioButtonMesh<V>;
}
