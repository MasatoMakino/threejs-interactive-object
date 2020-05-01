import { EventDispatcher } from "three";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";

export class RadioButtonManager extends EventDispatcher {
  /**
   * コンストラクタ
   */
  constructor() {
    super();
    /**
     * このマネージャーの管理下のボタン
     * @type {any[]}
     * @private
     */
    this._models = [];
    /**
     * 管理下のボタンが選択された場合の処理
     * @param {Event} e
     */
    this.onSelectedButton = (e) => {
      const evt = e;
      if (evt.isSelected) {
        this.select(evt.model);
      }
    };
  }
  /**
   * このマネージャーの管理下にボタンを追加する
   * @param {IRadioButtonObject3D[]} buttons
   */
  addButton(...buttons) {
    buttons.forEach((btn) => {
      this.addModel(btn.model);
    });
  }
  addModel(model) {
    this._models.push(model);
    model.view.addEventListener(
      ThreeMouseEventType.SELECT,
      this.onSelectedButton
    );
  }
  /**
   * ボタンを管理下から外す。
   * ボタン自体の削除は行わない。
   * @param {IRadioButtonObject3D} button
   */
  removeButton(button) {
    this.removeModel(button.model);
  }
  removeModel(model) {
    const index = this._models.indexOf(model);
    if (index > -1) {
      this._models.splice(index, 1);
      model.view.removeEventListener(
        ThreeMouseEventType.SELECT,
        this.onSelectedButton
      );
    }
    return model;
  }
  /**
   * 特定のボタンを選択する
   * @param {RadioButtonObject} model
   */
  select(model) {
    const index = this._models.indexOf(model);
    if (index === -1) {
      console.warn("管理下でないボタンが選択処理されました。");
      return;
    }
    //選択済みのボタンを再度渡されても反応しない。
    if (model === this._selected && model.isFrozen) {
      return;
    }
    this._selected = model;
    for (let mdl of this._models) {
      mdl.selection = mdl.isFrozen = mdl === model;
    }
    const evt = new ThreeMouseEvent(ThreeMouseEventType.SELECT, model);
    this.dispatchEvent(evt);
  }
  get selected() {
    return this._selected;
  }
  get models() {
    return this._models;
  }
}
