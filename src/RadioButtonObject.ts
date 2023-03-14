import { CheckBoxObject, RadioButtonMesh, RadioButtonSprite } from "./";

export class RadioButtonObject<Value> extends CheckBoxObject<Value> {
  declare view: RadioButtonMesh<Value> | RadioButtonSprite<Value>;
  protected _isFrozen: boolean = false;

  /**
   * 現在のボタンの有効、無効状態を取得する
   * ラジオボタンは選択中は自身の状態を変更できない。
   * @return    ボタンが有効か否か
   */
  protected checkActivity(): Boolean {
    return this._enable && !this._isFrozen;
  }

  get isFrozen(): boolean {
    return this._isFrozen;
  }
  set isFrozen(bool: boolean) {
    this._isFrozen = bool;
  }
}
