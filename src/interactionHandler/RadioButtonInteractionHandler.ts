import type { RadioButtonMesh, RadioButtonSprite } from "../index.js";
import {
  type ButtonInteractionHandlerParameters,
  CheckBoxInteractionHandler,
} from "./index.js";

export class RadioButtonInteractionHandler<
  Value,
> extends CheckBoxInteractionHandler<Value> {
  declare readonly view: RadioButtonMesh<Value> | RadioButtonSprite<Value>;
  protected _isFrozen: boolean = false;

  /**
   * 現在のボタンの有効、無効状態を取得する
   * ラジオボタンは選択中は自身の状態を変更できない。
   * @return    ボタンが有効か否か
   */
  protected override checkActivity(): boolean {
    return this._enable && !this._isFrozen;
  }

  get isFrozen(): boolean {
    return this._isFrozen;
  }
  set isFrozen(bool: boolean) {
    this._isFrozen = bool;
  }
}

/**
 * @deprecated Use RadioButtonInteractionHandler instead. This class will be removed in next minor version.
 */
export class RadioButtonObject<
  Value,
> extends RadioButtonInteractionHandler<Value> {
  constructor(parameters: ButtonInteractionHandlerParameters<Value>) {
    console.warn(
      "This class is deprecated. Use RadioButtonInteractionHandler instead.",
    );
    super(parameters);
  }
}
