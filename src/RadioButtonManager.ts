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
   */
  protected _interactionHandlers: RadioButtonInteractionHandler<Value>[] = [];
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
      this.addInteractionHandler(
        btn.interactionHandler as RadioButtonInteractionHandler<Value>,
      );
    });
  }

  public addInteractionHandler(
    interactionHandler: RadioButtonInteractionHandler<Value>,
  ): void {
    this._interactionHandlers.push(interactionHandler);
    interactionHandler.on("select", this.onSelectedButton);
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
    this.removeInteractionHandler(
      button.interactionHandler as RadioButtonInteractionHandler<Value>,
    );
  }

  public removeInteractionHandler(
    interactionHandler: RadioButtonInteractionHandler<Value>,
  ): RadioButtonInteractionHandler<Value> {
    const index = this._interactionHandlers.indexOf(interactionHandler);
    if (index > -1) {
      this._interactionHandlers.splice(index, 1);
      interactionHandler.off("select", this.onSelectedButton);
    }
    return interactionHandler;
  }

  /**
   * 特定のボタンを選択する
   * @param {RadioButtonInteractionHandler} interactionHandler
   */
  public select(
    interactionHandler: RadioButtonInteractionHandler<Value>,
  ): void {
    const index = this._interactionHandlers.indexOf(interactionHandler);
    if (index === -1) {
      console.warn("管理下でないボタンが選択処理されました。");
      return;
    }

    //選択済みのボタンを再度渡されても反応しない。
    if (interactionHandler === this._selected && interactionHandler.isFrozen) {
      return;
    }

    this._selected = interactionHandler;
    for (let mdl of this._interactionHandlers) {
      mdl.selection = mdl.isFrozen = mdl === interactionHandler;
    }

    const evt = ThreeMouseEventUtil.generate("select", interactionHandler);
    this.emit(evt.type, evt);
  }

  get selected(): RadioButtonInteractionHandler<Value> {
    return this._selected;
  }

  get interactionHandlers(): RadioButtonInteractionHandler<Value>[] {
    return this._interactionHandlers;
  }
}
