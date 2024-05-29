import EventEmitter from "eventemitter3";
import {
  IClickableObject3D,
  RadioButtonInteractionHandler,
  ThreeMouseEvent,
  ThreeMouseEventMap,
  ThreeMouseEventUtil,
} from "./index.js";

export class RadioButtonManager<Value = any> extends EventEmitter<
  ThreeMouseEventMap<Value>
> {
  /**
   * このマネージャーの管理下のボタン
   * @private
   */
  protected _models: RadioButtonInteractionHandler<Value>[] = [];
  /**
   * 現状選択されているボタン。
   */
  protected _selected!: RadioButtonInteractionHandler<Value>;

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
  public addButton(...buttons: IClickableObject3D<Value>[]): void {
    buttons.forEach((btn) => {
      this.addModel(
        btn.interactionHandler as RadioButtonInteractionHandler<Value>,
      );
    });
  }

  public addModel(model: RadioButtonInteractionHandler<Value>): void {
    this._models.push(model);
    model.on("select", this.onSelectedButton);
  }

  /**
   * 管理下のボタンが選択された場合の処理
   * @param {Event} e
   */
  private onSelectedButton = (e: ThreeMouseEvent<Value>) => {
    if (e.isSelected) {
      this.select(e.interactionHandler as RadioButtonInteractionHandler<Value>);
    }
  };

  /**
   * ボタンを管理下から外す。
   * ボタン自体の削除は行わない。
   * @param {IClickableObject3D} button
   */
  public removeButton(button: IClickableObject3D<Value>): void {
    this.removeModel(
      button.interactionHandler as RadioButtonInteractionHandler<Value>,
    );
  }

  public removeModel(
    model: RadioButtonInteractionHandler<Value>,
  ): RadioButtonInteractionHandler<Value> {
    const index = this._models.indexOf(model);
    if (index > -1) {
      this._models.splice(index, 1);
      model.off("select", this.onSelectedButton);
    }
    return model;
  }

  /**
   * 特定のボタンを選択する
   * @param {RadioButtonInteractionHandler} model
   */
  public select(model: RadioButtonInteractionHandler<Value>): void {
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
    this.emit(evt.type, evt);
  }

  get selected(): RadioButtonInteractionHandler<Value> {
    return this._selected;
  }

  get models(): RadioButtonInteractionHandler<Value>[] {
    return this._models;
  }
}
