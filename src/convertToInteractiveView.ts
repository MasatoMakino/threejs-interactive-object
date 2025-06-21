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

// 一時的にreadonly を剥がす型
type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function convertToClickableMesh<V = unknown>(
  view: Mesh,
): ClickableMesh<V> {
  const writableView = view as Writable<Mesh & ClickableMesh<V>>;
  writableView.interactionHandler = new ButtonInteractionHandler<V>({
    view: writableView,
  });
  return writableView as ClickableMesh<V>;
}

export function convertToCheckboxMesh<V = unknown>(
  view: Mesh,
): CheckBoxMesh<V> {
  const writableView = view as Writable<Mesh & CheckBoxMesh<V>>;
  writableView.interactionHandler = new CheckBoxInteractionHandler<V>({
    view: writableView,
  });
  return writableView as CheckBoxMesh<V>;
}

export function convertToRadioButtonMesh<V = unknown>(
  view: Mesh,
): RadioButtonMesh<V> {
  const writableView = view as Writable<Mesh & RadioButtonMesh<V>>;
  writableView.interactionHandler = new RadioButtonInteractionHandler<V>({
    view: writableView,
  });
  return writableView as RadioButtonMesh<V>;
}
