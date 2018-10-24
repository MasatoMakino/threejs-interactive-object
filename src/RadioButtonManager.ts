import { EventDispatcher, Event } from "three";
import { IRadioButtonObject3D } from "./MouseEventManager";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";


export class RadioButtonManager extends EventDispatcher {
  /**
   * このマネージャーの管理下のボタン
   * @type {any[]}
   * @private
   */
  protected _buttons: IRadioButtonObject3D[] = [];
  /**
   * 現状選択されているボタン。
   */
  protected _selected!: IRadioButtonObject3D;

  /**
   * コンストラクタ
   */
  constructor() {
    super();
  }

  /**
   * このマネージャーの管理下にボタンを追加する
   * @param {IRadioButtonObject3D} button
   */
  public addButton(button: IRadioButtonObject3D): void {
    this._buttons.push(button);
    button.addEventListener(ThreeMouseEventType.SELECT, this.onSelectedButton);
  }

  /**
   * 管理下のボタンが選択された場合の処理
   * @param {Event} e
   */
  private onSelectedButton = (e: Event) => {
    const evt = e as ThreeMouseEvent;
    if (evt.isSelected) this.select(evt.target as IRadioButtonObject3D);
  };

  /**
   * ボタンを管理下から外す。
   * ボタン自体の削除は行わない。
   * @param {IRadioButtonObject3D} button
   */
  public removeButton(button: IRadioButtonObject3D): IRadioButtonObject3D {
    const index = this._buttons.indexOf(button);
    if (index > -1) {
      this._buttons.splice(index, 1);
    }
    button.removeEventListener(
      ThreeMouseEventType.SELECT,
      this.onSelectedButton
    );
    return button;
  }

  /**
   * 特定のボタンを選択する
   * @param {IRadioButtonObject3D} button
   */
  public select(button: IRadioButtonObject3D): void {
    const index = this._buttons.indexOf(button);
    if (index === -1) {
      console.warn("管理下でないボタンが選択処理されました。");
      return;
    }

    this._selected = button;
    for (let btn of this._buttons) {
      btn.selection = btn === button;
      btn.isFrozen = btn === button;
    }

    this.dispatchEvent(new ThreeMouseEvent(ThreeMouseEventType.SELECT, button));
  }

  get selected(): IRadioButtonObject3D {
    return this._selected;
  }
}
