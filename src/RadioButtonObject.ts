import { CheckBoxObject } from "./CheckBoxObject";

export class RadioButtonObject extends CheckBoxObject {
  protected _isFrozen: boolean = false;

  /**
   * 現在のボタンの有効、無効状態を取得する
   * ラジオボタンは選択中は自身の状態を変更できない。
   * @return    ボタンが有効か否か
   */
  protected checkActivity(): Boolean {
    return this._enableMouse && !this._isFrozen;
  }

  get isFrozen(): boolean {
    return this._isFrozen;
  }
  set isFrozen(bool: boolean) {
    this._isFrozen = bool;
  }
}
