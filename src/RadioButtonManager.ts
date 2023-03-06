import { Event, EventDispatcher } from "three";
import { IClickableObject3D } from "./MouseEventManager";
import { RadioButtonObject } from "./RadioButtonObject";
import { ThreeMouseEvent, ThreeMouseEventUtil } from "./ThreeMouseEvent";

export class RadioButtonManager<ValueType = any> extends EventDispatcher<
  ThreeMouseEvent<ValueType>
> {
  /**
   * このマネージャーの管理下のボタン
   * @type {any[]}
   * @private
   */
  protected _models: RadioButtonObject<ValueType>[] = [];
  /**
   * 現状選択されているボタン。
   */
  protected _selected!: RadioButtonObject<ValueType>;

  /**
   * コンストラクタ
   */
  constructor() {
    super();
  }

  /**
   * このマネージャーの管理下にボタンを追加する
   * @param {IClickableObject3D[]} buttons
   */
  public addButton(...buttons: IClickableObject3D<ValueType>[]): void {
    buttons.forEach((btn) => {
      this.addModel(btn.model as RadioButtonObject<ValueType>);
    });
  }

  public addModel(model: RadioButtonObject<ValueType>): void {
    this._models.push(model);
    model.view.addEventListener("select", this.onSelectedButton);
  }

  /**
   * 管理下のボタンが選択された場合の処理
   * @param {Event} e
   */
  private onSelectedButton = (e: ThreeMouseEvent<ValueType>) => {
    if (e.isSelected) {
      this.select(e.model as RadioButtonObject<ValueType>);
    }
  };

  /**
   * ボタンを管理下から外す。
   * ボタン自体の削除は行わない。
   * @param {IClickableObject3D} button
   */
  public removeButton(button: IClickableObject3D<ValueType>): void {
    this.removeModel(button.model as RadioButtonObject<ValueType>);
  }

  public removeModel(
    model: RadioButtonObject<ValueType>
  ): RadioButtonObject<ValueType> {
    const index = this._models.indexOf(model);
    if (index > -1) {
      this._models.splice(index, 1);
      model.view.removeEventListener("select", this.onSelectedButton);
    }
    return model;
  }

  /**
   * 特定のボタンを選択する
   * @param {RadioButtonObject} model
   */
  public select(model: RadioButtonObject<ValueType>): void {
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

    const evt = ThreeMouseEventUtil.generate("select", model);
    this.dispatchEvent(evt);
  }

  get selected(): RadioButtonObject<ValueType> {
    return this._selected;
  }

  get models(): RadioButtonObject<ValueType>[] {
    return this._models;
  }
}
