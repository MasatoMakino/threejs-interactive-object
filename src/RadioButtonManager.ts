import { Event, EventDispatcher } from "three";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { ThreeMouseEvent, ThreeMouseEventType } from "./ThreeMouseEvent";

export class RadioButtonManager extends EventDispatcher {
  /**
   * このマネージャーの管理下のボタン
   * @type {any[]}
   * @private
   */
  protected _models: RadioButtonObject[] = [];
  /**
   * 現状選択されているボタン。
   */
  protected _selected!: RadioButtonObject;

  /**
   * コンストラクタ
   */
  constructor() {
    super();
  }

  /**
   * このマネージャーの管理下にボタンを追加する
   * @param {IRadioButtonObject3D[]} buttons
   */
  public addButton(...buttons: IClickableObject3D[]): void {
    buttons.forEach((btn) => {
      this.addModel(btn.model as RadioButtonObject);
    });
  }

  public addModel(model: RadioButtonObject): void {
    this._models.push(model);
    model.view.addEventListener(
      ThreeMouseEventType.SELECT,
      this.onSelectedButton
    );
  }

  /**
   * 管理下のボタンが選択された場合の処理
   * @param {Event} e
   */
  private onSelectedButton = (e: any) => {
    const evt = e as ThreeMouseEvent;
    if (evt.isSelected) {
      this.select(evt.model as RadioButtonObject);
    }
  };

  /**
   * ボタンを管理下から外す。
   * ボタン自体の削除は行わない。
   * @param {IRadioButtonObject3D} button
   */
  public removeButton(button: IClickableObject3D): void {
    this.removeModel(button.model as RadioButtonObject);
  }

  public removeModel(model: RadioButtonObject): RadioButtonObject {
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
  public select(model: RadioButtonObject): void {
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

  get selected(): RadioButtonObject {
    return this._selected;
  }

  get models(): RadioButtonObject[] {
    return this._models;
  }
}
