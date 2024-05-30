import { CheckBoxMesh, CheckBoxSprite, ThreeMouseEventUtil } from "../index.js";
import {
  ButtonInteractionHandler,
  ButtonInteractionHandlerParameters,
} from "./index.js";

/**
 * The `CheckBoxInteractionHandler` class extends the `ButtonInteractionHandler` class to manage interactions with checkbox-like objects.
 * In addition to handling interaction events, this class also maintains the selection state of the checkbox-like object.
 *
 * The generic parameter `Value` represents the type of the `value` property associated with this checkbox.
 */
export class CheckBoxInteractionHandler<
  Value,
> extends ButtonInteractionHandler<Value> {
  declare readonly view: CheckBoxMesh<Value> | CheckBoxSprite<Value>;
  protected _isSelect: boolean = false;

  /**
   * クリックイベント時の処理
   * "click"イベントはマウスイベント類の必ず最後に発生するので
   * ここでisSelect状態を一括管理する。
   */
  public override onMouseClick(): void {
    this._isSelect = !this._isSelect;

    const e = ThreeMouseEventUtil.generate("select", this);
    this.emit(e.type, e);
    this.updateMaterial();
  }

  public get selection(): boolean {
    return this._isSelect;
  }

  public set selection(bool: boolean) {
    this._isSelect = bool;
    this.updateState("normal");
  }

  protected override updateMaterial(): void {
    this.materialSet?.setOpacity(this._alpha);
    const stateMat = this.materialSet?.getMaterial(
      this.state,
      this._enable,
      this._isSelect,
    );
    if (stateMat?.material != null) {
      this.view.material = stateMat.material;
    }
  }
}

/**
 * @deprecated Use CheckBoxInteractionHandler instead. This class will be removed in next minor version.
 */
export class CheckBoxObject<Value> extends CheckBoxInteractionHandler<Value> {
  constructor(parameters: ButtonInteractionHandlerParameters<Value>) {
    console.warn(
      "This class is deprecated. Use CheckBoxInteractionHandler instead.",
    );
    super(parameters);
  }
}
